// Font detection. Reads <link> tags, parsed CSS @font-face families, and
// body font-family to pick a primary sans-serif family. Surfaces provider
// (google | typekit | custom | system) and a visual neighbor when the source
// font is proprietary.

const GOOGLE_HOST_RE = /fonts\.googleapis\.com|fonts\.gstatic\.com/i;
const TYPEKIT_HOST_RE = /use\.typekit\.net|p\.typekit\.net|typekit\.com/i;

// Hand-curated neighbors for common proprietary fonts. Not exhaustive; extend as we learn.
const NEIGHBORS = {
  "proxima nova": "Inter",
  "proxima-nova": "Inter",
  "circular": "Nunito Sans",
  "circular std": "Nunito Sans",
  "gotham": "Montserrat",
  "gotham rounded": "Nunito",
  "graphik": "Inter",
  "salesforce sans": "Inter",
  "sf pro": "Inter",
  "sf pro text": "Inter",
  "sf pro display": "Inter",
  "avenir next": "Work Sans",
  "avenir": "Work Sans",
  "helvetica neue": "Inter",
  "brandon": "Montserrat",
  "futura": "Jost",
  "gilroy": "Inter",
  "sofia pro": "Work Sans",
  "freight sans": "Source Sans 3",
  "tt norms": "Manrope",
  "whitney": "Source Sans 3",
};

const GENERIC_FAMILIES = new Set([
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "-apple-system",
  "blinkmacsystemfont",
  "segoe ui",
  "arial",
  "helvetica",
]);

function stripQuotes(s) {
  return s.replace(/^['"]|['"]$/g, "").trim();
}

// Parse a CSS font-family list into normalized family names (non-generic first).
export function parseFontFamilyList(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((p) => stripQuotes(p.trim()))
    .filter(Boolean);
}

// Pick a primary sans-serif: the first family in the list that's not a generic fallback.
export function pickPrimaryFamily(list) {
  for (const fam of list) {
    if (!fam) continue;
    if (GENERIC_FAMILIES.has(fam.toLowerCase())) continue;
    return fam;
  }
  return null;
}

// Given a bundle of signals, return { family, provider, neighbor? }.
export function pickSansFont({ headLinks, cssFontFaceFamilies, bodyFontFamilyRaw }) {
  // 1. Google Fonts link wins when present.
  const googleLink = (headLinks || []).find(
    (l) => l.href && GOOGLE_HOST_RE.test(l.href)
  );
  if (googleLink && googleLink.href) {
    const fam = familyFromGoogleFontsUrl(googleLink.href);
    if (fam) return { family: fam, provider: "google" };
  }
  // 2. Typekit preconnect/linking.
  const typekitLink = (headLinks || []).find(
    (l) =>
      (l.href && TYPEKIT_HOST_RE.test(l.href)) ||
      (l.rel === "preconnect" && l.href && TYPEKIT_HOST_RE.test(l.href))
  );
  if (typekitLink) {
    // We don't know the family name from Typekit's kit URL alone. Fall through and
    // maybe rescue from @font-face or body.
  }
  // 3. @font-face families from inline / linked CSS.
  const fontFaceFamily = (cssFontFaceFamilies || []).find(
    (f) => !GENERIC_FAMILIES.has(String(f).toLowerCase())
  );
  if (fontFaceFamily) {
    const key = fontFaceFamily.toLowerCase();
    const neighbor = NEIGHBORS[key];
    if (neighbor) return { family: fontFaceFamily, provider: typekitLink ? "typekit" : "custom", neighbor };
    return { family: fontFaceFamily, provider: typekitLink ? "typekit" : "custom" };
  }
  // 4. Fall back to computed body font-family.
  const primary = pickPrimaryFamily(parseFontFamilyList(bodyFontFamilyRaw));
  if (primary) {
    const key = primary.toLowerCase();
    const neighbor = NEIGHBORS[key];
    if (neighbor) return { family: primary, provider: "custom", neighbor };
    return { family: primary, provider: "custom" };
  }
  return { family: "system-ui", provider: "system" };
}

// Parse a Google Fonts v2 URL like
//   https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Grotesk&display=swap
// and return the first family name (with + replaced by space).
function familyFromGoogleFontsUrl(href) {
  try {
    const u = new URL(href);
    const fam = u.searchParams.get("family");
    if (!fam) return null;
    const first = fam.split("&")[0].split(":")[0];
    return first.replace(/\+/g, " ");
  } catch {
    return null;
  }
}
