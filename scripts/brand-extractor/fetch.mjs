// HTTP fetch helpers. Uses Node 22 built-in fetch. Adds timeouts, UA,
// redirect scheme-locking, and size caps. Zero external deps.

import { USER_AGENT, debug, warn } from "./util.mjs";

const DEFAULT_TIMEOUT_MS = 8000;
const MAX_BYTES_ASSET = 5 * 1024 * 1024;   // 5 MB per asset
const MAX_BYTES_HTML = 2 * 1024 * 1024;    // 2 MB HTML cap
const MAX_REDIRECTS = 5;

function apexHost(hostname) {
  // crude but good-enough for scheme-locking. Handles co.uk poorly; acceptable for v1.
  const parts = hostname.toLowerCase().split(".");
  if (parts.length <= 2) return parts.join(".");
  return parts.slice(-2).join(".");
}

export function sameApex(a, b) {
  try {
    return apexHost(new URL(a).hostname) === apexHost(new URL(b).hostname);
  } catch {
    return false;
  }
}

async function withTimeout(promise, ms, label) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await promise(controller.signal);
  } catch (err) {
    if (err && err.name === "AbortError") {
      throw new Error(`timeout after ${ms}ms: ${label || "request"}`);
    }
    throw err;
  } finally {
    clearTimeout(t);
  }
}

// Fetch HTML text with redirect following, scheme-locked to the original apex domain.
export async function fetchHtml(url, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  let current = url;
  let finalUrl = url;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const res = await withTimeout(
      (signal) =>
        fetch(current, {
          method: "GET",
          redirect: "manual",
          signal,
          headers: {
            "user-agent": USER_AGENT,
            accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
            "accept-language": "en-US,en;q=0.7",
          },
        }),
      timeoutMs,
      `fetch ${current}`
    );
    // Redirect?
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error(`redirect ${res.status} with no location`);
      const next = new URL(loc, current).toString();
      if (!sameApex(next, url)) {
        throw new Error(`redirect to foreign apex blocked: ${next}`);
      }
      current = next;
      debug("redirect", current);
      continue;
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} on ${current}`);
    }
    finalUrl = res.url || current;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    // Stream into buffer with cap.
    const reader = res.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES_HTML) {
        try { await reader.cancel(); } catch {}
        warn(`HTML body exceeded ${MAX_BYTES_HTML} bytes, truncating: ${finalUrl}`);
        break;
      }
      chunks.push(value);
    }
    const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    const text = buf.toString("utf8");
    return { text, finalUrl, contentType: ct };
  }
  throw new Error("too many redirects");
}

// Fetch a binary asset as a Buffer, capped. Returns { buf, contentType, finalUrl }.
export async function fetchAsset(url, {
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxBytes = MAX_BYTES_ASSET,
  restrictToApex = null,
} = {}) {
  let current = url;
  let finalUrl = url;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    if (restrictToApex && !sameApex(current, restrictToApex)) {
      // Allow CDN subdomains of the same apex, but not totally foreign hosts.
      // For v1 we explicitly allow common CDN hosts like `cdn.jsdelivr.net` for logos?
      // No — keep strict. SEs can always curl it themselves.
      throw new Error(`asset refused: foreign host ${new URL(current).host}`);
    }
    const res = await withTimeout(
      (signal) =>
        fetch(current, {
          method: "GET",
          redirect: "manual",
          signal,
          headers: {
            "user-agent": USER_AGENT,
            accept: "*/*",
          },
        }),
      timeoutMs,
      `fetch ${current}`
    );
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error(`redirect ${res.status} with no location`);
      current = new URL(loc, current).toString();
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} on ${current}`);
    finalUrl = res.url || current;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    const reader = res.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        try { await reader.cancel(); } catch {}
        throw new Error(`asset exceeds ${maxBytes} bytes: ${finalUrl}`);
      }
      chunks.push(value);
    }
    const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    return { buf, contentType: ct, finalUrl };
  }
  throw new Error("too many redirects");
}

// Fetch a text asset (CSS, txt). Same guardrails.
export async function fetchText(url, opts = {}) {
  const { buf, contentType, finalUrl } = await fetchAsset(url, {
    maxBytes: 1 * 1024 * 1024,
    ...opts,
  });
  return { text: buf.toString("utf8"), contentType, finalUrl };
}
