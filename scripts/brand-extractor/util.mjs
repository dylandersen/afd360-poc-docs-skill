// Shared helpers for the brand extractor. Zero external deps — Node 22+ built-ins only.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const USER_AGENT =
  "afd360-poc-docs-skill/0.1 brand-extractor (+https://github.com/dylandersen/afd360-poc-docs-skill)";

export function log(level, msg, extra) {
  const prefix = `[brand-extractor:${level}]`;
  if (extra !== undefined) {
    console.error(prefix, msg, extra);
  } else {
    console.error(prefix, msg);
  }
}

export function info(msg, extra) {
  log("info", msg, extra);
}

export function warn(msg, extra) {
  log("warn", msg, extra);
}

export function debug(msg, extra) {
  if (process.env.BRAND_EXTRACTOR_DEBUG) log("debug", msg, extra);
}

// Normalize a URL string into { href, origin, hostname }. Auto-prepends https://.
export function normalizeUrl(input) {
  if (!input || typeof input !== "string") return null;
  let s = input.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    // Strip obvious credentials and fragments.
    u.username = "";
    u.password = "";
    u.hash = "";
    return u;
  } catch {
    return null;
  }
}

// Resolve a possibly-relative URL against a base. Returns null if unparseable.
export function resolveUrl(maybe, base) {
  if (!maybe) return null;
  try {
    return new URL(maybe, base).toString();
  } catch {
    return null;
  }
}

// Ensure a directory exists.
export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// Pick an extension from a content-type or url. Defaults to .bin.
export function extFromContentType(ct, fallbackUrl) {
  const m = (ct || "").toLowerCase();
  if (m.includes("svg")) return ".svg";
  if (m.includes("png")) return ".png";
  if (m.includes("jpeg") || m.includes("jpg")) return ".jpg";
  if (m.includes("webp")) return ".webp";
  if (m.includes("gif")) return ".gif";
  if (m.includes("avif")) return ".avif";
  if (m.includes("x-icon") || m.includes("vnd.microsoft.icon")) return ".ico";
  if (fallbackUrl) {
    const e = path.extname(new URL(fallbackUrl).pathname).toLowerCase();
    if (e && e.length <= 5) return e;
  }
  return ".bin";
}

// Sanitize a string into a safe filename segment.
export function safeName(s, max = 40) {
  return String(s || "asset")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max) || "asset";
}

// Approximate image size from bytes — cheap heuristic for ranking logo candidates.
// This reads the first few bytes of a PNG/JPEG/GIF/WebP buffer to pull width/height.
// Returns { width, height } or null.
export function sniffImageDimensions(buf) {
  if (!buf || buf.length < 24) return null;
  // PNG: 8-byte signature + IHDR at bytes 16..24 (width/height big-endian u32)
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    return { width: w, height: h };
  }
  // GIF: "GIF87a"/"GIF89a" then width/height little-endian u16 at 6..10
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46
  ) {
    const w = buf.readUInt16LE(6);
    const h = buf.readUInt16LE(8);
    return { width: w, height: h };
  }
  // JPEG: scan for SOF marker
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 8) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      // SOF0..SOF15 (0xC0..0xCF) minus a few non-SOF ones
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        const h = buf.readUInt16BE(i + 5);
        const w = buf.readUInt16BE(i + 7);
        return { width: w, height: h };
      }
      const len = buf.readUInt16BE(i + 2);
      i += 2 + len;
    }
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    // VP8X chunk at offset 12 sometimes carries canvas size; best-effort.
    if (
      buf[12] === 0x56 &&
      buf[13] === 0x50 &&
      buf[14] === 0x38 &&
      buf[15] === 0x58
    ) {
      const w = 1 + ((buf[24] | (buf[25] << 8) | (buf[26] << 16)) & 0xffffff);
      const h = 1 + ((buf[27] | (buf[28] << 8) | (buf[29] << 16)) & 0xffffff);
      return { width: w, height: h };
    }
  }
  return null;
}

// Detect transparency: PNG with color type 6 or 4; SVG always treated as transparent.
export function sniffTransparency(buf, ext) {
  if (ext === ".svg") return true;
  if (!buf || buf.length < 26) return false;
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    const colorType = buf[25];
    return colorType === 4 || colorType === 6;
  }
  return false;
}

// Extract viewBox or width/height from a raw SVG string.
export function sniffSvgDimensions(svgText) {
  if (!svgText) return null;
  const vb = svgText.match(/viewBox\s*=\s*['"]\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)/i);
  if (vb) return { width: Math.round(parseFloat(vb[1])), height: Math.round(parseFloat(vb[2])) };
  const w = svgText.match(/\swidth\s*=\s*['"]([\d.]+)(px)?['"]/i);
  const h = svgText.match(/\sheight\s*=\s*['"]([\d.]+)(px)?['"]/i);
  if (w && h) return { width: Math.round(parseFloat(w[1])), height: Math.round(parseFloat(h[1])) };
  return null;
}

export function fileUrl(p) {
  return pathToFileURL(path.resolve(p)).toString();
}

export function nowIso() {
  return new Date().toISOString();
}
