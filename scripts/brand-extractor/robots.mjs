// Minimal robots.txt parser. Just enough to decide "may we GET /" under our UA.

import { fetchText } from "./fetch.mjs";
import { USER_AGENT, debug, warn } from "./util.mjs";

const UA_TOKEN = "afd360-poc-docs-skill"; // what we'd match on in robots.txt user-agent lines

export async function isAllowed(originUrl, pathname = "/") {
  const robotsUrl = new URL("/robots.txt", originUrl).toString();
  let text;
  try {
    const r = await fetchText(robotsUrl, { timeoutMs: 4000 });
    text = r.text;
  } catch (err) {
    // If robots.txt is missing or 404s, assume allowed. RFC 9309 §2.3.1.3.
    debug("robots.txt not available, assuming allowed:", String(err.message || err));
    return { allowed: true, reason: "no-robots-txt" };
  }

  // Parse into groups keyed by user-agent.
  const groups = [];
  let cur = null;
  const lines = text.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) {
      if (cur && cur.rules.length) {
        groups.push(cur);
        cur = null;
      }
      continue;
    }
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const val = m[2].trim();
    if (key === "user-agent") {
      if (!cur) cur = { agents: [], rules: [] };
      cur.agents.push(val.toLowerCase());
    } else if (key === "disallow" || key === "allow") {
      if (!cur) cur = { agents: ["*"], rules: [] };
      cur.rules.push({ type: key, pattern: val });
    }
    // Ignore sitemap, crawl-delay, etc. for v1.
  }
  if (cur && cur.rules.length) groups.push(cur);

  // Choose the most specific matching group: our UA token, else "*".
  const ua = UA_TOKEN.toLowerCase();
  const specific = groups.find((g) => g.agents.some((a) => a === ua));
  const wildcard = groups.find((g) => g.agents.some((a) => a === "*"));
  const applicable = specific || wildcard;
  if (!applicable) return { allowed: true, reason: "no-matching-group" };

  // Evaluate rules: longest matching pattern wins; allow beats disallow on tie.
  const matches = applicable.rules
    .filter((r) => patternMatches(r.pattern, pathname))
    .sort((a, b) => {
      if (b.pattern.length !== a.pattern.length) return b.pattern.length - a.pattern.length;
      if (a.type === b.type) return 0;
      return a.type === "allow" ? -1 : 1;
    });
  if (!matches.length) return { allowed: true, reason: "no-matching-rule" };
  const winner = matches[0];
  if (winner.type === "allow") return { allowed: true, reason: "allow-rule" };
  return { allowed: false, reason: "disallow-rule", rule: winner.pattern };
}

function patternMatches(pattern, pathname) {
  if (!pattern) return false; // empty Disallow means "allow all"
  if (pattern === "/") return true;
  // Very light glob support for "*" and end-anchor "$".
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  const anchored = pattern.endsWith("$")
    ? "^" + escaped.slice(0, -2) + "$"
    : "^" + escaped;
  try {
    return new RegExp(anchored).test(pathname);
  } catch {
    return pathname.startsWith(pattern);
  }
}
