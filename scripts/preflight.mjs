#!/usr/bin/env node
// Phase 0 environment check for /setup-docs.
//
// Verifies the SE has the toolchain Fumadocs 16 + Next.js 16 require before
// we collect any intake. Fails loudly with platform-specific install hints
// instead of letting the SE discover the problem mid-`pnpm install`.
//
// Exit codes:
//   0 — all checks passed (some may be soft warnings)
//   1 — a hard requirement is missing (Node version, no package manager)
//
// Usage:
//   node scripts/preflight.mjs            # human-readable
//   node scripts/preflight.mjs --json     # machine-readable
//
// Soft warnings (network, git) print to stderr but don't fail the run.

import { spawnSync } from "node:child_process";
import process from "node:process";

const REQUIRED_NODE_MAJOR = 22;
const REGISTRY_URL = "https://registry.npmjs.org/";
const NETWORK_TIMEOUT_MS = 4000;

const args = process.argv.slice(2);
const wantJson = args.includes("--json");

function which(cmd) {
  const lookup = process.platform === "win32" ? "where" : "which";
  const res = spawnSync(lookup, [cmd], { encoding: "utf8" });
  if (res.status !== 0) return null;
  const first = (res.stdout || "").split(/\r?\n/).find(Boolean);
  return first ? first.trim() : null;
}

function tryVersion(cmd) {
  const res = spawnSync(cmd, ["--version"], { encoding: "utf8" });
  if (res.status !== 0) return null;
  return (res.stdout || res.stderr || "").trim().split(/\r?\n/)[0] || null;
}

function checkNode() {
  const v = process.versions.node;
  const major = Number(v.split(".")[0]);
  const ok = major >= REQUIRED_NODE_MAJOR;
  return {
    name: "node",
    ok,
    detail: `node ${v}`,
    fix: ok
      ? null
      : [
          `Node ${v} detected. Fumadocs 16 + Next.js 16 require Node ${REQUIRED_NODE_MAJOR}+.`,
          `Install via:`,
          `  brew install node@${REQUIRED_NODE_MAJOR}              (macOS)`,
          `  nvm install ${REQUIRED_NODE_MAJOR}                       (any platform with nvm)`,
          `  https://nodejs.org/                       (any platform, manual)`,
        ].join("\n"),
  };
}

function checkPackageManager() {
  const candidates = ["pnpm", "npm", "bun"];
  const found = {};
  for (const c of candidates) {
    const where = which(c);
    if (where) found[c] = tryVersion(c) || where;
  }
  const ok = Object.keys(found).length > 0;
  const preferred =
    found.pnpm ? "pnpm" : found.npm ? "npm" : found.bun ? "bun" : null;
  return {
    name: "package-manager",
    ok,
    detail: ok
      ? `found: ${Object.entries(found)
          .map(([k, v]) => `${k} (${v})`)
          .join(", ")}; preferred: ${preferred}`
      : "none found",
    preferred,
    found,
    fix: ok
      ? null
      : [
          `No package manager on PATH. Install one:`,
          `  npm install -g pnpm                    (preferred)`,
          `  Node 22+ ships with npm; check shell PATH if missing`,
          `  curl -fsSL https://bun.sh/install | bash`,
        ].join("\n"),
  };
}

function checkGit() {
  const where = which("git");
  if (!where) {
    return {
      name: "git",
      ok: false,
      soft: true,
      detail: "not found on PATH",
      fix: [
        `git is missing. Phase 4 (git init) will not work without it.`,
        `Install via:`,
        `  xcode-select --install                  (macOS)`,
        `  apt install git                         (Debian/Ubuntu)`,
        `  https://git-scm.com/                    (any platform)`,
      ].join("\n"),
    };
  }
  const v = tryVersion("git");
  return { name: "git", ok: true, detail: `git ${v || where}` };
}

async function checkRegistry() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), NETWORK_TIMEOUT_MS);
  try {
    const res = await fetch(REGISTRY_URL, { method: "HEAD", signal: ctrl.signal });
    return {
      name: "npm-registry",
      ok: res.ok,
      soft: true,
      detail: `${REGISTRY_URL} → ${res.status}`,
      fix: res.ok
        ? null
        : [
            `Could not reach ${REGISTRY_URL} (status ${res.status}).`,
            `If you're behind a corporate proxy, set npm_config_registry or HTTP(S)_PROXY.`,
            `Phase 3 (pnpm install) will fail if the registry stays unreachable.`,
          ].join("\n"),
    };
  } catch (err) {
    return {
      name: "npm-registry",
      ok: false,
      soft: true,
      detail: `${REGISTRY_URL} → ${String(err.message || err)}`,
      fix: [
        `Could not reach ${REGISTRY_URL}.`,
        `If you're behind a corporate proxy, set npm_config_registry or HTTP(S)_PROXY.`,
        `Phase 3 (pnpm install) will fail if the registry stays unreachable.`,
      ].join("\n"),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const results = [];
  results.push(checkNode());
  results.push(checkPackageManager());
  results.push(checkGit());
  results.push(await checkRegistry());

  const hardFail = results.find((r) => !r.ok && !r.soft);
  const softFail = results.filter((r) => !r.ok && r.soft);

  if (wantJson) {
    console.log(JSON.stringify({ ok: !hardFail, results }, null, 2));
    process.exit(hardFail ? 1 : 0);
  }

  for (const r of results) {
    const mark = r.ok ? "✓" : r.soft ? "!" : "✗";
    console.log(`${mark} ${r.name}: ${r.detail}`);
  }

  if (hardFail) {
    console.error("");
    console.error(`[afd360-poc-docs-skill] preflight failed: ${hardFail.name}`);
    console.error("");
    if (hardFail.fix) console.error(hardFail.fix + "\n");
    process.exit(1);
  }

  if (softFail.length) {
    console.warn("");
    console.warn(`[afd360-poc-docs-skill] preflight passed with warnings:`);
    for (const r of softFail) {
      console.warn(`  • ${r.name}: ${r.detail}`);
      if (r.fix) console.warn(r.fix.split("\n").map((l) => "      " + l).join("\n"));
    }
    console.warn("");
  } else {
    console.log("");
    console.log(`[afd360-poc-docs-skill] preflight ok`);
  }
}

main().catch((err) => {
  console.error(`[afd360-poc-docs-skill] preflight crashed: ${String(err && err.stack || err)}`);
  process.exit(1);
});
