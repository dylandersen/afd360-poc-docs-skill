#!/usr/bin/env node
// Scaffolds a Fumadocs POC docs site from templates/fumadocs-poc/ and copies
// on-demand sections from templates/sections/.
//
// Modes:
//   1. Initial scaffold:
//        node scaffold.mjs --target /abs/path --customer "Acme" --poc "POC" \
//          --product-area "Agentforce" --personas "..." --integrations "..." \
//          --deploy-target "Vercel" --se-name "..." [--repo-url "..."] \
//          [--customer-url https://www.acme.com] [--no-brand-extract] \
//          [--brand-snapshot /abs/path/to/brand-snapshot.json] \
//          [--include-sections "security,faq,glossary"]
//
//   2. List sections (no target needed):
//        node scaffold.mjs --list-sections [--json]
//
//   3. Add a section to an already-scaffolded site:
//        node scaffold.mjs --add-section <slug> --target /abs/path [--force]
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
const SECTIONS_DIR = path.join(SKILL_ROOT, "templates", "sections");
const BRAND_EXTRACTOR = path.join(SKILL_ROOT, "scripts", "brand-extractor", "index.mjs");
const META_FILE_NAME = ".poc-docs-meta.json";

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

function warn(msg) {
  console.warn(`[afd360-poc-docs-skill] warn: ${msg}`);
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

// Emits a JS/TS value literal: string -> JSON.stringify, null/empty -> "null".
function jsValue(v) {
  if (v === null || v === undefined || v === "") return "null";
  return JSON.stringify(v);
}

// ---------------------------------------------------------------------------
// Brand extraction
// ---------------------------------------------------------------------------

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
    { stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" },
  );
  if (res.status === 0) {
    try {
      const review = JSON.parse(res.stdout);
      return { ok: true, review };
    } catch {
      return { ok: false, reason: "bad-extractor-stdout" };
    }
  }
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

// ---------------------------------------------------------------------------
// Section library
// ---------------------------------------------------------------------------

function readSectionMeta(absPath) {
  const raw = fs.readFileSync(absPath, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { title: "", description: "", icon: "" };
  const fm = m[1];
  const grab = (key) => {
    const r = new RegExp(`^${key}:\\s*(.+)$`, "m").exec(fm);
    return r ? r[1].trim().replace(/^['"]|['"]$/g, "") : "";
  };
  return { title: grab("title"), description: grab("description"), icon: grab("icon") };
}

function listSections() {
  if (!fs.existsSync(SECTIONS_DIR)) return [];
  return fs
    .readdirSync(SECTIONS_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
    .map((e) => {
      const slug = e.name.replace(/\.mdx$/, "");
      const meta = readSectionMeta(path.join(SECTIONS_DIR, e.name));
      return { slug, ...meta };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function readTargetMeta(target) {
  const p = path.join(target, META_FILE_NAME);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    die(`failed to parse ${p}: ${e.message}`);
  }
}

function writeTargetMeta(target, meta) {
  const p = path.join(target, META_FILE_NAME);
  fs.writeFileSync(p, JSON.stringify(meta, null, 2) + "\n", "utf8");
}

// Insert a slug into content/docs/meta.json's `pages` array. Inserts before
// "troubleshooting" if present so Troubleshooting always stays last.
function addToDocsMeta(target, slug) {
  const metaPath = path.join(target, "content", "docs", "meta.json");
  if (!fs.existsSync(metaPath)) {
    die(`docs meta.json missing: ${metaPath}`);
  }
  const data = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  data.pages = Array.isArray(data.pages) ? data.pages : [];
  if (data.pages.includes(slug)) return false;

  const idx = data.pages.indexOf("troubleshooting");
  if (idx >= 0) {
    data.pages.splice(idx, 0, slug);
  } else {
    data.pages.push(slug);
  }
  fs.writeFileSync(metaPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  return true;
}

function copySection(slug, target, replacements, opts) {
  const force = Boolean(opts && opts.force);
  const src = path.join(SECTIONS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(src)) {
    const available = listSections().map((s) => s.slug).join(", ") || "(none)";
    die(`unknown section "${slug}". available: ${available}`);
  }
  const dest = path.join(target, "content", "docs", `${slug}.mdx`);
  if (fs.existsSync(dest) && !force) {
    warn(`section already exists at ${dest} — pass --force to overwrite. skipping.`);
    return { written: false, addedToMeta: false };
  }
  const raw = fs.readFileSync(src, "utf8");
  const replaced = replaceAll(raw, replacements);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, replaced, "utf8");
  const addedToMeta = addToDocsMeta(target, slug);
  return { written: true, addedToMeta };
}

function buildPocReplacements(meta) {
  return {
    "__CUSTOMER_NAME__": meta.customer,
    "__CUSTOMER_SLUG__": meta.customerSlug,
    "__POC_NAME__": meta.poc,
    "__POC_SLUG__": meta.pocSlug,
    "__PRODUCT_AREA__": meta.productArea,
    "__PERSONAS__": meta.personas,
    "__INTEGRATIONS__": meta.integrations,
    "__DEPLOY_TARGET__": meta.deployTarget,
    "__REPO_URL__": meta.repoUrl,
    "__SE_NAME__": meta.seName,
    "__YEAR__": meta.year,
    "__CUSTOMER_URL__": meta.customerUrl || "",
    "__CUSTOMER_URL_JS__": jsValue(meta.customerUrl || null),
  };
}

// ---------------------------------------------------------------------------
// CLI modes
// ---------------------------------------------------------------------------

function runListSections(args) {
  const sections = listSections();
  if (args.json) {
    console.log(JSON.stringify(sections, null, 2));
    return;
  }
  if (sections.length === 0) {
    info("no sections available — templates/sections/ is empty");
    return;
  }
  info(`available sections (${sections.length}):`);
  const slugWidth = Math.max(...sections.map((s) => s.slug.length));
  for (const s of sections) {
    const pad = " ".repeat(Math.max(0, slugWidth - s.slug.length));
    console.log(`  ${s.slug}${pad}  ${s.title}${s.description ? "  —  " + s.description : ""}`);
  }
}

function runAddSection(args) {
  const slug = typeof args["add-section"] === "string" ? args["add-section"] : null;
  if (!slug) die("--add-section requires a slug, e.g. --add-section security");
  if (!args.target) die("--add-section requires --target <abs path to scaffolded site>");
  const target = path.resolve(args.target);
  if (!fs.existsSync(target)) die(`target does not exist: ${target}`);

  const meta = readTargetMeta(target);
  if (!meta) {
    die(`${target} does not look like a scaffolded site (missing ${META_FILE_NAME}).`);
  }

  const replacements = buildPocReplacements(meta);
  const result = copySection(slug, target, replacements, { force: Boolean(args.force) });

  if (result.written) {
    info(`added section "${slug}" to ${target}/content/docs/${slug}.mdx`);
  }
  if (result.addedToMeta) {
    info(`added "${slug}" to content/docs/meta.json`);
  } else if (result.written) {
    info(`"${slug}" already in content/docs/meta.json — left as-is`);
  }
  console.log("\n" + JSON.stringify({ slug, target, ...result }, null, 2));
}

function runInitialScaffold(args) {
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

  // Resolve brand snapshot.
  let brandSnapshot = null;
  let brandReview = null;
  let brandAssetsTmpDir = null;
  const targetDataDir = path.join(target, "data");
  const targetSnapshotPath = path.join(targetDataDir, "brand-snapshot.json");

  if (existingSnapshotFlag && typeof existingSnapshotFlag === "string") {
    brandSnapshot = loadSnapshot(path.resolve(existingSnapshotFlag));
    if (brandSnapshot) {
      info(`using existing brand snapshot: ${existingSnapshotFlag}`);
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

  if (brandAssetsTmpDir) {
    const { installed, publicBrandDir } = installBrandAssets(brandAssetsTmpDir, target);
    if (installed.length) info(`installed ${installed.length} brand asset(s) → ${publicBrandDir}`);
    if (brandAssetsTmpDir.startsWith(target) && fs.existsSync(brandAssetsTmpDir)) {
      fs.rmSync(brandAssetsTmpDir, { recursive: true, force: true });
    }
  }

  const intake = {
    customer, customerSlug, poc, pocSlug, productArea,
    personas, integrations, deployTarget, repoUrl, seName,
    customerUrl, year,
  };
  const themeReplacements = deriveThemeReplacements(brandSnapshot);
  const replacements = {
    ...buildPocReplacements(intake),
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

  const underscoreGitignore = path.join(target, "_gitignore");
  const realGitignore = path.join(target, ".gitignore");
  if (fs.existsSync(underscoreGitignore)) {
    fs.renameSync(underscoreGitignore, realGitignore);
  }

  // Persist intake metadata so /update-docs add-section works without re-prompting.
  writeTargetMeta(target, intake);

  info(`wrote ${fileCount} files`);

  // Optional: include any sections requested at scaffold time.
  const includeRaw = typeof args["include-sections"] === "string"
    ? args["include-sections"]
    : "";
  const includeSlugs = includeRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const sectionResults = [];
  for (const slug of includeSlugs) {
    const r = copySection(slug, target, replacements, { force });
    sectionResults.push({ slug, ...r });
    if (r.written) info(`included section "${slug}"`);
  }

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
    includedSections: sectionResults,
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

function main() {
  const args = parseArgs(process.argv);

  if (args["list-sections"]) {
    runListSections(args);
    return;
  }

  if (args["add-section"]) {
    runAddSection(args);
    return;
  }

  runInitialScaffold(args);
}

main();
