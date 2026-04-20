#!/usr/bin/env node
// afd360-poc-docs-skill — brand extractor (v1, zero external deps)
//
// Fetches a customer's public website and emits:
//   - data/brand-snapshot.json                 (versioned structured snapshot)
//   - data/brand-assets/logo.<ext>             (header or OG logo)
//   - data/brand-assets/favicon.<ext>          (favicon)
//   - data/brand-assets/og-hero.<ext>          (OG image, if distinct from logo)
//
// Usage:
//   node scripts/brand-extractor/index.mjs \
//     --url https://www.acme.com \
//     --out ./data/brand-snapshot.json \
//     --assets-out ./data/brand-assets
//
// Exit codes:
//   0  success (snapshot written)
//   1  unexpected error
//   2  bad invocation (missing args)
//   6  robots.txt disallow (clean skip)
//   7  unreachable / network error (clean skip)
//
// Flags:
//   --url <u>             required
//   --out <path>          snapshot path (default ./brand-snapshot.json)
//   --assets-out <dir>    assets directory (default ./brand-assets)
//   --timeout-ms <n>      per-request timeout
//   --no-contrast-nudge   skip WCAG contrast adjustment
//   --no-assets           skip asset download (metadata-only)
//   --dry                 print snapshot to stdout, don't write
//   --json                print the review payload as JSON on stdout
//
// This is v1. It does not use Playwright, node-vibrant, sharp, culori, or
// cheerio. All logic is in the sibling .mjs files using Node 22 built-ins.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { fetchHtml, fetchAsset, fetchText, sameApex } from "./fetch.mjs";
import { parseDocument, metaContent, linksByRel } from "./html.mjs";
import { isAllowed } from "./robots.mjs";
import {
  extractColorCandidates,
  extractFontFaceFamilies,
  extractBodyFontFamily,
} from "./css.mjs";
import {
  parseColor,
  rgbToHex,
  contrastRatio,
  brandinessScore,
  nudgeForContrast,
  foregroundFor,
  rgbToHsl,
} from "./color.mjs";
import {
  pickHeaderLogoCandidate,
  fallbackTopOfPageCandidates,
  scoreImgCandidate,
  pickFaviconLink,
  pickOgImage,
} from "./logo.mjs";
import { pickSansFont } from "./fonts.mjs";
import {
  normalizeUrl,
  ensureDir,
  resolveUrl,
  extFromContentType,
  sniffImageDimensions,
  sniffSvgDimensions,
  sniffTransparency,
  nowIso,
  info,
  warn,
  debug,
} from "./util.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function die(code, msg, extra) {
  const payload = {
    ok: false,
    reason: msg,
    extra: extra || null,
    extractedAt: nowIso(),
  };
  process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  process.exit(code);
}

async function main() {
  const args = parseArgs(process.argv);
  const urlRaw = args.url;
  if (!urlRaw || urlRaw === true) die(2, "missing --url");

  const u = normalizeUrl(urlRaw);
  if (!u) die(2, `unparseable URL: ${urlRaw}`);

  const outPath = path.resolve(args.out || "./brand-snapshot.json");
  const assetsOut = path.resolve(args["assets-out"] || "./brand-assets");
  const timeoutMs = parseInt(args["timeout-ms"] || "8000", 10);
  const skipContrast = Boolean(args["no-contrast-nudge"]);
  const skipAssets = Boolean(args["no-assets"]);
  const dry = Boolean(args.dry);

  info(`extracting brand from ${u.toString()}`);

  // 1. Robots check.
  let robots;
  try {
    robots = await isAllowed(u.origin, u.pathname || "/");
  } catch (err) {
    warn("robots.txt check failed, continuing:", String(err.message || err));
    robots = { allowed: true, reason: "robots-check-failed" };
  }
  if (!robots.allowed) {
    die(6, "robots-disallow", {
      rule: robots.rule || null,
      url: u.toString(),
    });
  }

  // 2. Fetch HTML.
  let html, finalUrl;
  try {
    const r = await fetchHtml(u.toString(), { timeoutMs });
    html = r.text;
    finalUrl = r.finalUrl;
  } catch (err) {
    die(7, "unreachable", { detail: String(err.message || err) });
  }

  // 3. Parse HTML.
  const doc = parseDocument(html);

  // 4. Resolve company name / tagline.
  const companyName =
    metaContent(doc.metas, "og:site_name") ||
    doc.title ||
    metaContent(doc.metas, "twitter:title") ||
    null;
  const tagline =
    metaContent(doc.metas, "og:description") ||
    metaContent(doc.metas, "description") ||
    metaContent(doc.metas, "twitter:description") ||
    null;

  // 5. Colors.
  const themeColorMeta = metaContent(doc.metas, "theme-color");
  const inlineCss = doc.styles.join("\n");
  const stylesheetLinks = linksByRel(doc.links, ["stylesheet"])
    .map((l) => ({ href: resolveUrl(l.href, finalUrl), raw: l }))
    .filter((l) => l.href && sameApex(l.href, finalUrl));

  // Fetch a bounded number of same-origin stylesheets. v1: cap at 5.
  const MAX_STYLESHEETS = 5;
  const fetchedCss = [];
  for (const sl of stylesheetLinks.slice(0, MAX_STYLESHEETS)) {
    try {
      const r = await fetchText(sl.href, { timeoutMs });
      fetchedCss.push({ href: sl.href, text: r.text });
    } catch (err) {
      debug(`stylesheet fetch failed: ${sl.href}`, String(err.message || err));
    }
  }
  const combinedCss = inlineCss + "\n" + fetchedCss.map((c) => c.text).join("\n");
  const cssColors = extractColorCandidates(combinedCss);

  // Candidate resolution: prefer hinted primary from CSS, else theme-color meta,
  // else the most saturated / brand-like hinted CSS color of any kind.
  const hintedPrimary = cssColors.find((c) => c.kind === "primary");
  const hintedSecondary = cssColors.find((c) => c.kind === "secondary");

  let primaryRaw = null;
  let primarySource = null;
  if (hintedPrimary) {
    primaryRaw = hintedPrimary.color;
    primarySource = `css-var:--${hintedPrimary.name}`;
  } else if (themeColorMeta) {
    primaryRaw = themeColorMeta;
    primarySource = "meta:theme-color";
  } else {
    // Pick the most "brand-like" resolvable CSS color.
    const ranked = cssColors
      .map((c) => {
        const rgb = parseColor(c.color);
        return rgb ? { ...c, rgb, score: brandinessScore(rgb) } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);
    if (ranked.length) {
      primaryRaw = ranked[0].color;
      primarySource = `css-var:--${ranked[0].name}`;
    }
  }

  const primaryRgb = primaryRaw ? parseColor(primaryRaw) : null;

  // Accessibility nudge.
  let primaryNudged = null;
  let primaryAA = null;
  if (primaryRgb) {
    primaryAA = {
      againstLight: contrastRatio(primaryRgb, { r: 255, g: 255, b: 255 }),
      againstDark: contrastRatio(primaryRgb, { r: 17, g: 24, b: 39 }),
    };
    if (!skipContrast && primaryAA.againstLight < 4.5) {
      const n = nudgeForContrast(primaryRgb, { target: 4.5, against: { r: 255, g: 255, b: 255 } });
      if (n.changed) primaryNudged = n;
    }
  }

  let secondaryRaw = null;
  let secondarySource = null;
  if (hintedSecondary) {
    secondaryRaw = hintedSecondary.color;
    secondarySource = `css-var:--${hintedSecondary.name}`;
  } else {
    // Fall back: second most brand-like distinct color (different hue from primary).
    const primaryHue = primaryRgb ? rgbToHsl(primaryRgb).h : null;
    const ranked = cssColors
      .map((c) => {
        const rgb = parseColor(c.color);
        return rgb ? { ...c, rgb, score: brandinessScore(rgb) } : null;
      })
      .filter(Boolean)
      .filter(
        (c) =>
          primaryHue === null || Math.abs(rgbToHsl(c.rgb).h - primaryHue) > 20
      )
      .sort((a, b) => b.score - a.score);
    if (ranked.length) {
      secondaryRaw = ranked[0].color;
      secondarySource = `css-var:--${ranked[0].name}`;
    }
  }

  // 6. Fonts.
  const font = pickSansFont({
    headLinks: doc.links,
    cssFontFaceFamilies: extractFontFaceFamilies(combinedCss),
    bodyFontFamilyRaw: extractBodyFontFamily(combinedCss),
  });

  // 7. Logo candidate (header first, fall back to top-of-page).
  let logoCandidate = pickHeaderLogoCandidate(doc.headerImgs, { companyName });
  if (!logoCandidate) {
    const fallback = fallbackTopOfPageCandidates(doc.allImgs, html.length);
    if (fallback.length) {
      const ranked = fallback
        .map((a) => ({ attrs: a, score: scoreImgCandidate(a, { companyName }) }))
        .sort((a, b) => b.score - a.score);
      if (ranked[0] && ranked[0].score > 0) logoCandidate = ranked[0];
    }
  }

  // 8. Favicon candidate.
  const favLink = pickFaviconLink(doc.links);

  // 9. OG image.
  const og = pickOgImage(doc.metas, finalUrl);

  // 10. Download assets (unless --no-assets).
  const notes = [];
  let logo = null;
  let favicon = null;
  let ogAsset = null;
  if (!skipAssets) {
    ensureDir(assetsOut);
    if (logoCandidate) {
      const src = logoCandidate.attrs.src;
      const url = resolveUrl(src, finalUrl);
      if (url && !url.startsWith("data:")) {
        try {
          const r = await fetchAsset(url, { timeoutMs, restrictToApex: finalUrl });
          const ext = extFromContentType(r.contentType, r.finalUrl);
          const fname = `logo${ext}`;
          const fpath = path.join(assetsOut, fname);
          fs.writeFileSync(fpath, r.buf);
          const dims =
            ext === ".svg"
              ? sniffSvgDimensions(r.buf.toString("utf8"))
              : sniffImageDimensions(r.buf);
          logo = {
            file: fname,
            format: ext.slice(1),
            width: dims?.width || null,
            height: dims?.height || null,
            hasTransparency: sniffTransparency(r.buf, ext),
            source: r.finalUrl,
            confidence: Math.min(1, 0.6 + Math.max(0, logoCandidate.score) * 0.1),
          };
        } catch (err) {
          warn(`logo download failed: ${String(err.message || err)}`);
          notes.push(`logo-download-failed: ${String(err.message || err)}`);
        }
      } else if (url && url.startsWith("data:")) {
        // Inline data URI — decode and persist.
        try {
          const match = url.match(/^data:([^;,]+)(;base64)?,(.*)$/i);
          if (match) {
            const ct = match[1];
            const isB64 = Boolean(match[2]);
            const ext = extFromContentType(ct);
            const data = isB64
              ? Buffer.from(match[3], "base64")
              : Buffer.from(decodeURIComponent(match[3]), "utf8");
            const fname = `logo${ext}`;
            const fpath = path.join(assetsOut, fname);
            fs.writeFileSync(fpath, data);
            const dims =
              ext === ".svg"
                ? sniffSvgDimensions(data.toString("utf8"))
                : sniffImageDimensions(data);
            logo = {
              file: fname,
              format: ext.slice(1),
              width: dims?.width || null,
              height: dims?.height || null,
              hasTransparency: sniffTransparency(data, ext),
              source: "data-uri",
              confidence: 0.55,
            };
          }
        } catch (err) {
          warn(`logo data-uri decode failed: ${String(err.message || err)}`);
        }
      }
    }
    if (favLink) {
      const url = resolveUrl(favLink.href, finalUrl);
      if (url) {
        try {
          const r = await fetchAsset(url, { timeoutMs, restrictToApex: finalUrl });
          const ext = extFromContentType(r.contentType, r.finalUrl);
          const fname = `favicon${ext}`;
          const fpath = path.join(assetsOut, fname);
          fs.writeFileSync(fpath, r.buf);
          favicon = {
            file: fname,
            generatedSet: [],
            source: r.finalUrl,
          };
        } catch (err) {
          warn(`favicon download failed: ${String(err.message || err)}`);
          notes.push(`favicon-download-failed`);
        }
      }
    } else {
      // Try /favicon.ico as last-ditch.
      try {
        const url = new URL("/favicon.ico", finalUrl).toString();
        const r = await fetchAsset(url, { timeoutMs, restrictToApex: finalUrl });
        const fname = `favicon.ico`;
        const fpath = path.join(assetsOut, fname);
        fs.writeFileSync(fpath, r.buf);
        favicon = {
          file: fname,
          generatedSet: [],
          source: url,
        };
      } catch {
        // ignore
      }
    }
    if (og && og.url) {
      try {
        const r = await fetchAsset(og.url, { timeoutMs, restrictToApex: finalUrl });
        const ext = extFromContentType(r.contentType, r.finalUrl);
        const fname = `og-hero${ext}`;
        const fpath = path.join(assetsOut, fname);
        fs.writeFileSync(fpath, r.buf);
        ogAsset = {
          image: {
            file: fname,
            source: og.source,
          },
        };
      } catch (err) {
        debug(`og image download failed: ${String(err.message || err)}`);
      }
    }
  }

  // 11. Assemble snapshot.
  const snapshot = {
    schemaVersion: "1.0.0",
    extractedFrom: u.toString(),
    extractedAt: nowIso(),
    strategies: ["static"],
    company: {
      ...(companyName ? { name: companyName } : {}),
      ...(tagline ? { tagline } : {}),
    },
    colors: {
      ...(themeColorMeta && parseColor(themeColorMeta)
        ? {
            themeColor: {
              value: rgbToHex(parseColor(themeColorMeta)),
              source: "meta:theme-color",
            },
          }
        : {}),
      ...(primaryRgb
        ? {
            primary: {
              value: primaryNudged
                ? rgbToHex(primaryNudged.color)
                : rgbToHex(primaryRgb),
              raw: rgbToHex(primaryRgb),
              nudged: Boolean(primaryNudged && primaryNudged.changed),
              foreground: rgbToHex(
                foregroundFor(primaryNudged ? primaryNudged.color : primaryRgb)
              ),
              source: primarySource,
              confidence: hintedPrimary ? 0.85 : themeColorMeta ? 0.7 : 0.55,
            },
          }
        : {}),
      ...(secondaryRaw && parseColor(secondaryRaw)
        ? {
            secondary: {
              value: rgbToHex(parseColor(secondaryRaw)),
              foreground: rgbToHex(foregroundFor(parseColor(secondaryRaw))),
              source: secondarySource,
              confidence: hintedSecondary ? 0.8 : 0.5,
            },
          }
        : {}),
    },
    ...(logo ? { logo } : {}),
    ...(favicon ? { favicon } : {}),
    ...(ogAsset ? { og: ogAsset } : {}),
    fonts: {
      sans: font,
    },
    accessibility: {
      primaryAgainstLight: primaryAA
        ? {
            ratio: Number(primaryAA.againstLight.toFixed(2)),
            pass: primaryAA.againstLight >= 4.5,
          }
        : null,
      primaryAgainstDark: primaryAA
        ? {
            ratio: Number(primaryAA.againstDark.toFixed(2)),
            pass: primaryAA.againstDark >= 4.5,
          }
        : null,
      notes: [
        ...(primaryNudged
          ? [
              `primary color nudged from ${rgbToHex(primaryRgb)} to ${rgbToHex(
                primaryNudged.color
              )} for WCAG AA on white (${primaryNudged.steps} steps)`,
            ]
          : []),
      ],
    },
    notes,
    disclaimer:
      "Automatically extracted from the URL above. Customer should review trademark usage before external publication.",
  };

  if (dry) {
    process.stdout.write(JSON.stringify(snapshot, null, 2) + "\n");
    return;
  }

  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  info(`wrote ${outPath}`);

  const review = {
    ok: true,
    snapshot: outPath,
    assetsDir: assetsOut,
    summary: {
      extractedFrom: snapshot.extractedFrom,
      company: snapshot.company,
      primary: snapshot.colors.primary || null,
      secondary: snapshot.colors.secondary || null,
      themeColor: snapshot.colors.themeColor || null,
      logo: snapshot.logo || null,
      favicon: snapshot.favicon || null,
      og: snapshot.og || null,
      font: snapshot.fonts.sans,
      accessibilityNotes: snapshot.accessibility.notes,
    },
  };
  process.stdout.write(JSON.stringify(review, null, 2) + "\n");
}

main().catch((err) => {
  warn("fatal:", String(err.stack || err.message || err));
  die(1, "unexpected-error", { detail: String(err.message || err) });
});
