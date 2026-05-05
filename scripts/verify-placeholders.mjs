#!/usr/bin/env node
// Post-scaffold sanity check.
//
// Walks the target directory looking for any leftover __FOO__ placeholder
// tokens. If a template file is added without updating the scaffolder's
// REPLACEMENTS map, those tokens will leak through and the site will fail
// at build time. This catches it earlier with a clear message.
//
// Usage:
//   node scripts/verify-placeholders.mjs <target>          # human-readable
//   node scripts/verify-placeholders.mjs <target> --json   # machine-readable
//
// Exit codes:
//   0 — no leftovers found
//   1 — leftover placeholders found (printed)
//   2 — bad usage / target missing

import fs from "node:fs";
import path from "node:path";

const TOKEN_RE = /__[A-Z][A-Z0-9_]*__/g;

const SKIP_DIRS = new Set([
  "node_modules", ".next", ".turbo", ".git", "dist", "out",
  ".source", ".vercel", ".cache", "coverage",
]);

const BINARY_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
  ".zip", ".pdf", ".mp4", ".mov", ".woff", ".woff2", ".ttf", ".otf",
  ".lock", ".lockb",
]);

const args = process.argv.slice(2);
const wantJson = args.includes("--json");
const target = args.find((a) => !a.startsWith("--"));

if (!target) {
  console.error("usage: node scripts/verify-placeholders.mjs <target> [--json]");
  process.exit(2);
}

const root = path.resolve(target);
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error(`[afd360-poc-docs-skill] target not found or not a directory: ${root}`);
  process.exit(2);
}

const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
      continue;
    }
    if (!entry.isFile()) continue;
    const abs = path.join(dir, entry.name);
    const ext = path.extname(entry.name).toLowerCase();
    if (BINARY_EXT.has(ext)) continue;

    let raw;
    try {
      raw = fs.readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    const lines = raw.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matches = line.match(TOKEN_RE);
      if (!matches) continue;
      for (const m of matches) {
        findings.push({
          file: path.relative(root, abs),
          line: i + 1,
          token: m,
          excerpt: line.trim().slice(0, 200),
        });
      }
    }
  }
}

walk(root);

if (wantJson) {
  console.log(JSON.stringify({ ok: findings.length === 0, target: root, findings }, null, 2));
  process.exit(findings.length === 0 ? 0 : 1);
}

if (findings.length === 0) {
  console.log(`[afd360-poc-docs-skill] verify-placeholders: ok (${root})`);
  process.exit(0);
}

console.error(`[afd360-poc-docs-skill] verify-placeholders: found ${findings.length} leftover token(s) in ${root}`);
console.error("");
const byToken = new Map();
for (const f of findings) {
  if (!byToken.has(f.token)) byToken.set(f.token, []);
  byToken.get(f.token).push(f);
}
for (const [token, occurrences] of [...byToken.entries()].sort()) {
  console.error(`  ${token}  (${occurrences.length})`);
  for (const o of occurrences.slice(0, 5)) {
    console.error(`    ${o.file}:${o.line}  ${o.excerpt}`);
  }
  if (occurrences.length > 5) console.error(`    ...and ${occurrences.length - 5} more`);
}
console.error("");
console.error("This usually means a template file uses a placeholder that scripts/scaffold.mjs");
console.error("doesn't know about. Add the token to scaffold.mjs's REPLACEMENTS map and re-scaffold.");
process.exit(1);
