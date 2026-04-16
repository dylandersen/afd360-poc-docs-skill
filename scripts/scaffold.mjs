#!/usr/bin/env node
// Scaffolds a tailored Fumadocs POC docs site from templates/fumadocs-poc/.
// Copies files, replaces __PLACEHOLDER__ tokens, and writes to the target directory.
// Usage:
//   node scaffold.mjs --target /abs/path --customer "Acme" --poc "Service Agent POC" ...
//
// Safe by default: refuses to write into a non-empty directory unless --force.

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_ROOT = path.resolve(__dirname, "..");
const TEMPLATE_DIR = path.join(SKILL_ROOT, "templates", "fumadocs-poc");

const BINARY_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
  ".zip", ".pdf", ".mp4", ".mov", ".woff", ".woff2", ".ttf", ".otf",
]);

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "poc";
}

function die(msg, code = 1) {
  console.error(`\n[setup-docs] error: ${msg}\n`);
  process.exit(code);
}

function info(msg) {
  console.log(`[setup-docs] ${msg}`);
}

function walk(dir, cb, rel = "") {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const r = path.join(rel, entry.name);
    if (entry.isDirectory()) {
      walk(abs, cb, r);
    } else {
      cb(abs, r);
    }
  }
}

function replaceAll(str, map) {
  let out = str;
  for (const [token, value] of Object.entries(map)) {
    out = out.split(token).join(value);
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);

  const required = [
    "target", "customer", "poc",
    "product-area", "personas", "integrations",
    "deploy-target", "se-name",
  ];
  for (const key of required) {
    if (!args[key]) die(`missing required flag --${key}`);
  }

  const target = path.resolve(args.target);
  const customer = args.customer;
  const customerSlug = args["customer-slug"] || slugify(customer);
  const poc = args.poc;
  const pocSlug = args["poc-slug"] || slugify(poc);
  const productArea = args["product-area"];
  const personas = args.personas;
  const integrations = args.integrations;
  const deployTarget = args["deploy-target"];
  const repoUrl = args["repo-url"] && args["repo-url"] !== "skip" ? args["repo-url"] : "";
  const seName = args["se-name"];
  const year = String(new Date().getFullYear());
  const force = Boolean(args.force);

  if (!fs.existsSync(TEMPLATE_DIR)) {
    die(`template directory missing: ${TEMPLATE_DIR}`);
  }

  if (fs.existsSync(target)) {
    const existing = fs.readdirSync(target).filter(n => !n.startsWith(".DS_Store"));
    if (existing.length > 0 && !force) {
      die(`target directory is not empty: ${target}\n       pass --force to overwrite contents`);
    }
  } else {
    fs.mkdirSync(target, { recursive: true });
  }

  const replacements = {
    "__CUSTOMER_NAME__": customer,
    "__CUSTOMER_SLUG__": customerSlug,
    "__POC_NAME__": poc,
    "__POC_SLUG__": pocSlug,
    "__PRODUCT_AREA__": productArea,
    "__PERSONAS__": personas,
    "__INTEGRATIONS__": integrations,
    "__DEPLOY_TARGET__": deployTarget,
    "__REPO_URL__": repoUrl,
    "__SE_NAME__": seName,
    "__YEAR__": year,
  };

  info(`scaffolding "${customer}" — "${poc}" into ${target}`);

  let fileCount = 0;
  walk(TEMPLATE_DIR, (absSrc, relPath) => {
    const destRel = replaceAll(relPath, replacements);
    const absDest = path.join(target, destRel);
    fs.mkdirSync(path.dirname(absDest), { recursive: true });

    const ext = path.extname(relPath).toLowerCase();
    if (BINARY_EXT.has(ext)) {
      fs.copyFileSync(absSrc, absDest);
    } else {
      const raw = fs.readFileSync(absSrc, "utf8");
      const replaced = replaceAll(raw, replacements);
      fs.writeFileSync(absDest, replaced, "utf8");
    }
    fileCount++;
  });

  // gitignore ships as _gitignore in the template so pnpm/npm don't ignore it in the package.
  // Rename if present.
  const underscoreGitignore = path.join(target, "_gitignore");
  const realGitignore = path.join(target, ".gitignore");
  if (fs.existsSync(underscoreGitignore)) {
    fs.renameSync(underscoreGitignore, realGitignore);
  }

  info(`wrote ${fileCount} files`);
  info(`done`);

  const summary = {
    target,
    customer,
    customerSlug,
    poc,
    pocSlug,
    productArea,
    deployTarget,
    repoUrl,
    nextSteps: [
      `cd "${target}"`,
      `pnpm install   # or npm install`,
      `pnpm dev       # opens http://localhost:3000`,
      `edit content/docs/*.mdx to fill in POC details`,
      `git init && git remote add origin ${repoUrl || "<repo-url>"}`,
    ],
  };
  console.log("\n" + JSON.stringify(summary, null, 2));
}

main();
