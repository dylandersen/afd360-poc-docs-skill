// Extract brand signals from CSS text. v1: regex for custom properties and
// @font-face rules. Good enough for the common cases. v2 will use css-tree.

const CUSTOM_PROP_RE = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+?)\s*;/g;
const FONT_FACE_RE = /@font-face\s*{([\s\S]*?)}/gi;
const URL_IN_CSS_RE = /url\((['"]?)([^)'"]+)\1\)/gi;

const PRIMARY_HINTS = [
  /^primary$/i,
  /^color-primary$/i,
  /^brand$/i,
  /^brand-color$/i,
  /^color-brand$/i,
  /^primary-500$/i,
  /^primary-600$/i,
];
const SECONDARY_HINTS = [
  /^secondary$/i,
  /^color-secondary$/i,
  /^accent$/i,
  /^color-accent$/i,
  /^brand-secondary$/i,
];

function isHintedPrimary(name) {
  return PRIMARY_HINTS.some((rx) => rx.test(name));
}
function isHintedSecondary(name) {
  return SECONDARY_HINTS.some((rx) => rx.test(name));
}

// Returns the first well-formed color string (hex, rgb, hsl) inside `value`.
// Keeps the original representation; caller can normalize.
function firstColor(value) {
  const v = value.trim();
  const hex = v.match(/#([0-9a-f]{3,8})\b/i);
  if (hex) return "#" + hex[1];
  const rgb = v.match(/rgba?\s*\([^)]+\)/i);
  if (rgb) return rgb[0];
  const hsl = v.match(/hsla?\s*\([^)]+\)/i);
  if (hsl) return hsl[0];
  const oklch = v.match(/oklch\s*\([^)]+\)/i);
  if (oklch) return oklch[0];
  return null;
}

// Extract candidate colors from CSS custom properties. Returns an array of
// { name, color, kind: 'primary' | 'secondary' | 'other' }.
export function extractColorCandidates(cssText) {
  const candidates = [];
  let m;
  CUSTOM_PROP_RE.lastIndex = 0;
  while ((m = CUSTOM_PROP_RE.exec(cssText))) {
    const name = m[1];
    const rawValue = m[2];
    const color = firstColor(rawValue);
    if (!color) continue;
    let kind = "other";
    if (isHintedPrimary(name)) kind = "primary";
    else if (isHintedSecondary(name)) kind = "secondary";
    candidates.push({ name, color, kind, rawValue });
  }
  return candidates;
}

// Look for @font-face { font-family: "..."; ... } declarations. Returns family names seen.
export function extractFontFaceFamilies(cssText) {
  const families = new Set();
  let m;
  FONT_FACE_RE.lastIndex = 0;
  while ((m = FONT_FACE_RE.exec(cssText))) {
    const body = m[1];
    const fam = body.match(/font-family\s*:\s*(['"]?)([^;'"]+)\1\s*;/i);
    if (fam) families.add(fam[2].trim());
  }
  return [...families];
}

// Pull body { font-family: ... } or html { font-family: ... } declarations if present.
export function extractBodyFontFamily(cssText) {
  const rules = [];
  const re = /(?:^|[}])\s*(body|html|:root)\s*{([^}]*)}/gi;
  let m;
  while ((m = re.exec(cssText))) {
    rules.push(m[2]);
  }
  for (const body of rules) {
    const fam = body.match(/font-family\s*:\s*([^;]+);?/i);
    if (fam) return fam[1].trim().replace(/;$/, "");
  }
  return null;
}

// Pull all url(...) references out of the CSS, useful for web-font assets.
export function extractUrls(cssText) {
  const urls = [];
  let m;
  URL_IN_CSS_RE.lastIndex = 0;
  while ((m = URL_IN_CSS_RE.exec(cssText))) {
    urls.push(m[2]);
  }
  return urls;
}
