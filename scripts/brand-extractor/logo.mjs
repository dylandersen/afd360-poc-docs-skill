// Logo and favicon selection from parsed HTML candidates.

import { linksByRel } from "./html.mjs";
import { resolveUrl } from "./util.mjs";

// Score an <img> candidate for "is this a logo?".
// Higher score = more likely.
export function scoreImgCandidate(imgAttrs, { companyName } = {}) {
  let score = 0;
  const alt = (imgAttrs.alt || "").toLowerCase();
  const src = (imgAttrs.src || "").toLowerCase();
  const cls = (imgAttrs.class || "").toLowerCase();
  const id = (imgAttrs.id || "").toLowerCase();
  const nameNeedle = (companyName || "").toLowerCase().split(/\s+/).filter(Boolean);

  if (/\blogo\b/.test(alt)) score += 3;
  if (/\bbrand\b/.test(alt)) score += 2;
  if (/logo/.test(src) || /brand/.test(src)) score += 2;
  if (/logo|brand/.test(cls)) score += 2;
  if (/logo|brand/.test(id)) score += 2;
  if (nameNeedle.some((n) => n.length > 2 && (alt.includes(n) || src.includes(n)))) score += 2;
  if (src.endsWith(".svg")) score += 1;

  // Tiny tracking pixels are probably not logos.
  const w = parseInt(imgAttrs.width || "0", 10);
  const h = parseInt(imgAttrs.height || "0", 10);
  if (w && h && w < 16 && h < 16) score -= 5;

  // data: URIs are workable but less preferable for extraction.
  if (src.startsWith("data:")) score -= 1;

  return score;
}

export function pickHeaderLogoCandidate(headerImgs, opts) {
  if (!headerImgs || !headerImgs.length) return null;
  const ranked = headerImgs
    .map((a) => ({ attrs: a, score: scoreImgCandidate(a, opts) }))
    .sort((a, b) => b.score - a.score);
  if (ranked[0].score <= 0) return null;
  return ranked[0];
}

// Pick a favicon-like <link>. Prefers largest declared "sizes", then SVG, then apple-touch, then generic icon.
export function pickFaviconLink(links) {
  const iconLinks = linksByRel(links, [
    "icon",
    "shortcut icon",
    "apple-touch-icon",
    "apple-touch-icon-precomposed",
    "mask-icon",
  ]);
  if (!iconLinks.length) return null;
  const scored = iconLinks
    .map((l) => ({
      link: l,
      size: parseSizes(l.sizes),
      isSvg: (l.type || "").toLowerCase().includes("svg") || /\.svg($|\?)/i.test(l.href || ""),
      isAppleTouch: /apple-touch-icon/i.test(l.rel || ""),
    }))
    .sort((a, b) => {
      if (b.size !== a.size) return b.size - a.size;
      if (b.isSvg !== a.isSvg) return b.isSvg ? 1 : -1;
      if (b.isAppleTouch !== a.isAppleTouch) return b.isAppleTouch ? 1 : -1;
      return 0;
    });
  return scored[0].link;
}

function parseSizes(str) {
  if (!str) return 0;
  const m = str.match(/(\d+)x(\d+)/i);
  if (!m) return 0;
  return parseInt(m[1], 10) * parseInt(m[2], 10);
}

// Given a list of <img> attrs that appear anywhere on the page, filter to ones
// in the top ~25% of the document and re-run scoring. This is a fallback for
// sites that don't use a real <header>.
export function fallbackTopOfPageCandidates(allImgs, htmlLength) {
  const cutoff = Math.min(htmlLength * 0.25, 20_000);
  return allImgs.filter((im) => im.index < cutoff).map((im) => im.attrs);
}

// Resolve common meta-image fields into absolute URLs. Returns the first one that resolves.
export function pickOgImage(metas, baseUrl) {
  const keys = ["og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"];
  for (const key of keys) {
    const m = metas.find(
      (a) =>
        (a.property && a.property.toLowerCase() === key) ||
        (a.name && a.name.toLowerCase() === key)
    );
    if (m && m.content) {
      const resolved = resolveUrl(m.content, baseUrl);
      if (resolved) return { url: resolved, source: `meta:${key}` };
    }
  }
  return null;
}
