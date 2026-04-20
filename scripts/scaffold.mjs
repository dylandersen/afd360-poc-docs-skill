#!/usr/bin/env node
// Scaffolds a tailored Fumadocs POC docs site from templates/fumadocs-poc/.
// Copies files, replaces __PLACEHOLDER__ tokens, and writes to the target directory.
//
// Usage:
//   node scaffold.mjs --target /abs/path --customer "Acme" --poc "Service Agent POC" \
//     [--customer-url https://www.acme.com] [--no-brand-extract] \
//     [--brand-snapshot /abs/path/to/brand-snapshot.json] ...
//
// Safe by default: refuses to write into a non-empty directory unless --force.

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { spawnSync } from "node:child_process";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_ROOT = path.resolve(__dirname, "..");
const TEMPLATE_DIR = path.join(SKILL_ROOT, "templates", "fumadocs-poc");
const BRAND_EXTRACTOR = path.join(SKILL_ROOT, "scripts", "brand-extractor", "index.mjs");

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
  console.error(`\n[afd360-poc-docs-skill] error: ${msg}\n`);
  process.exit(code);
}

function info(msg) {
  console.log(`[afd360-poc-docs-skill] ${msg}`);
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

// Emits a JavaScript/TypeScript value literal: string -> JSON.stringify, null -> "null".
// Used for placeholders that need to render either `'value'` or `null` without quotes.
function jsValue(v) {
  if (v === null || v === undefined || v === "") return "null";
  return JSON.stringify(v);
}

function runBrandExtractor({ url: customerUrl, snapshotOut, assetsOut }) {
  info(`extracting brand from ${customerUrl}`);
  const res = spawnSync(
    process.execPath,
    [
      BRAND_EXTRACTOR,
      "--url", customerUrl,
      "--out", snapshotOut,
      "--assets-out", assetsOut,
    ],
    { stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" }
  );
  if (res.status === 0) {
    try {
      const review = JSON.parse(res.stdout);
      return { ok: true, review };
    } catch {
      return { ok: false, reason: "bad-extractor-stdout" };
    }
  }
  // Extractor exits non-zero on robots-disallow (6) and unreachable (7) — both clean skips.
  if (res.status === 6) return { ok: false, reason: "robots-disallow" };
  if (res.status === 7) return { ok: false, reason: "unreachable" };
  return { ok: false, reason: `extractor-failed-${res.status}`, stdout: res.stdout };
}

function loadSnapshot(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (err) {
    info(`could not load brand snapshot at ${p}: ${String(err.message || err)}`);
    return null;
  }
}

// Copy files from an extractor assets dir into target/public/brand and return
// a manifest of what landed where.
function installBrandAssets(snapshotAssetsDir, target) {
  const publicBrandDir = path.join(target, "public", "brand");
  if (!fs.existsSync(snapshotAssetsDir)) return { installed: [], publicBrandDir };
  fs.mkdirSync(publicBrandDir, { recursive: true });
  const installed = [];
  for (const name of fs.readdirSync(snapshotAssetsDir)) {
    const src = path.join(snapshotAssetsDir, name);
    const dst = path.join(publicBrandDir, name);
    fs.copyFileSync(src, dst);
    installed.push(name);
  }
  return { installed, publicBrandDir };
}

function deriveThemeReplacements(snapshot) {
  const empty = {
    "__THEME_PRIMARY_HEX__": "null",
    "__THEME_SECONDARY_HEX__": "null",
    "__THEME_FONT_SANS_NAME__": "null",
    "__THEME_FONT_SANS_PROVIDER__": "null",
    "__THEME_FONT_SANS_NEIGHBOR__": "null",
    "__THEME_BRAND_LOGO_FILE__": "null",
    "__THEME_BRAND_LOGO_ALT__": "null",
    "__THEME_FAVICON_FILE__": "null",
    "__THEME_OG_HERO_FILE__": "null",
    "__BRAND_EXTRACTED_FROM__": "null",
    "__BRAND_EXTRACTED_AT__": "null",
    "__BRAND_COMPANY_TAGLINE__": "null",
  };
  if (!snapshot) return empty;

  const primaryHex = snapshot.colors?.primary?.value || null;
  const secondaryHex = snapshot.colors?.secondary?.value || null;
  const fontName = snapshot.fonts?.sans?.family || null;
  const fontProvider = snapshot.fonts?.sans?.provider || null;
  const fontNeighbor = snapshot.fonts?.sans?.neighbor || null;
  const logoFile = snapshot.logo?.file || null;
  const companyName = snapshot.company?.name || null;
  const tagline = snapshot.company?.tagline || null;
  const faviconFile = snapshot.favicon?.file || null;
  const ogFile = snapshot.og?.image?.file || null;

  return {
    "__THEME_PRIMARY_HEX__": jsValue(primaryHex),
    "__THEME_SECONDARY_HEX__": jsValue(secondaryHex),
    "__THEME_FONT_SANS_NAME__": jsValue(fontName),
    "__THEME_FONT_SANS_PROVIDER__": jsValue(fontProvider),
    "__THEME_FONT_SANS_NEIGHBOR__": jsValue(fontNeighbor),
    "__THEME_BRAND_LOGO_FILE__": jsValue(logoFile),
    "__THEME_BRAND_LOGO_ALT__": jsValue(companyName ? `${companyName} logo` : null),
    "__THEME_FAVICON_FILE__": jsValue(faviconFile),
    "__THEME_OG_HERO_FILE__": jsValue(ogFile),
    "__BRAND_EXTRACTED_FROM__": jsValue(snapshot.extractedFrom || null),
    "__BRAND_EXTRACTED_AT__": jsValue(snapshot.extractedAt || null),
    "__BRAND_COMPANY_TAGLINE__": jsValue(tagline),
  };
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
  const customerUrl =
    args["customer-url"] && args["customer-url"] !== "skip" ? args["customer-url"] : "";
  const noBrandExtract = Boolean(args["no-brand-extract"]);
  const existingSnapshotFlag = args["brand-snapshot"];
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

  // 1. Resolve brand snapshot: user-provided path wins; otherwise run extractor if URL given.
  let brandSnapshot = null;
  let brandReview = null;
  let brandAssetsTmpDir = null;
  const targetDataDir = path.join(target, "data");
  const targetSnapshotPath = path.join(targetDataDir, "brand-snapshot.json");

  if (existingSnapshotFlag && typeof existingSnapshotFlag === "string") {
    brandSnapshot = loadSnapshot(path.resolve(existingSnapshotFlag));
    if (brandSnapshot) {
      info(`using existing brand snapshot: ${existingSnapshotFlag}`);
      // Copy snapshot into target/data/ and assets from sibling brand-assets dir if present.
      fs.mkdirSync(targetDataDir, { recursive: true });
      fs.writeFileSync(targetSnapshotPath, JSON.stringify(brandSnapshot, null, 2) + "\n");
      const siblingAssets = path.join(path.dirname(path.resolve(existingSnapshotFlag)), "brand-assets");
      if (fs.existsSync(siblingAssets)) brandAssetsTmpDir = siblingAssets;
    }
  } else if (customerUrl && !noBrandExtract) {
    fs.mkdirSync(targetDataDir, { recursive: true });
    const tmpAssets = path.join(targetDataDir, "brand-assets");
    const result = runBrandExtractor({
      url: customerUrl,
      snapshotOut: targetSnapshotPath,
      assetsOut: tmpAssets,
    });
    if (result.ok) {
      brandReview = result.review;
      brandSnapshot = loadSnapshot(targetSnapshotPath);
      brandAssetsTmpDir = tmpAssets;
    } else {
      info(`brand extraction skipped: ${result.reason}`);
    }
  } else if (customerUrl && noBrandExtract) {
    info(`--no-brand-extract passed; skipping brand extraction`);
  }

  // 2. Install brand assets into public/brand/ so they resolve in the Next.js app.
  if (brandAssetsTmpDir) {
    const { installed, publicBrandDir } = installBrandAssets(brandAssetsTmpDir, target);
    if (installed.length) info(`installed ${installed.length} brand asset(s) → ${publicBrandDir}`);
    // If the tmp assets dir is inside the target (extractor default), remove it
    // so we don't ship duplicates of public/brand/.
    if (brandAssetsTmpDir.startsWith(target) && fs.existsSync(brandAssetsTmpDir)) {
      fs.rmSync(brandAssetsTmpDir, { recursive: true, force: true });
    }
  }

  const themeReplacements = deriveThemeReplacements(brandSnapshot);

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
    "__CUSTOMER_URL__": customerUrl || "",
    "__CUSTOMER_URL_JS__": jsValue(customerUrl || null),
    ...themeReplacements,
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
    customerUrl,
    brand: brandReview
      ? {
          extractedFrom: brandReview.summary?.extractedFrom || null,
          primary: brandReview.summary?.primary?.value || null,
          secondary: brandReview.summary?.secondary?.value || null,
          font: brandReview.summary?.font?.family || null,
          logo: brandReview.summary?.logo?.file || null,
          favicon: brandReview.summary?.favicon?.file || null,
          snapshotPath: targetSnapshotPath,
        }
      : brandSnapshot
      ? {
          extractedFrom: brandSnapshot.extractedFrom || null,
          snapshotPath: targetSnapshotPath,
          note: "loaded-from-existing-snapshot",
        }
      : null,
    nextSteps: [
      `cd "${target}"`,
      `pnpm install   # or npm install`,
      `pnpm dev       # opens http://localhost:3000`,
      `edit content/docs/*.mdx to fill in POC details`,
      brandSnapshot
        ? `review site.config.ts + data/brand-snapshot.json — override any auto-extracted values`
        : `optional: set theme colors in site.config.ts (primaryHex / secondaryHex)`,
      `git init && git remote add origin ${repoUrl || "<repo-url>"}`,
    ],
  };
  console.log("\n" + JSON.stringify(summary, null, 2));
}

main();
