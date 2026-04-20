// Color math for the brand extractor — pure sRGB + WCAG utilities with no deps.
// Covers: parse hex/rgb/hsl to sRGB, relative luminance, contrast ratio, and a
// hue-preserving nudge that walks lightness until a target ratio is satisfied.
// Not a full color-science library; v2 will upgrade to culori for ΔE CIEDE2000.

const CSS_NAMED = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  // Add as needed; not critical for v1.
};

// Parse a color string. Returns { r, g, b } in 0..255 or null if unparseable.
export function parseColor(input) {
  if (!input) return null;
  let s = input.trim().toLowerCase();
  if (CSS_NAMED[s]) s = CSS_NAMED[s];
  // Strip alpha from rgba/hsla strings — v1 ignores alpha.
  const hexMatch = s.match(/^#([0-9a-f]{3,8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    if (hex.length === 4) hex = hex.slice(0, 3).split("").map((c) => c + c).join("");
    if (hex.length === 8) hex = hex.slice(0, 6);
    if (hex.length !== 6) return null;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  }
  const rgb = s.match(/^rgba?\s*\(\s*([^)]+)\s*\)$/);
  if (rgb) {
    const parts = rgb[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const toByte = (p) => {
      if (p.endsWith("%")) return Math.round((parseFloat(p) / 100) * 255);
      return Math.round(parseFloat(p));
    };
    return { r: toByte(parts[0]), g: toByte(parts[1]), b: toByte(parts[2]) };
  }
  const hsl = s.match(/^hsla?\s*\(\s*([^)]+)\s*\)$/);
  if (hsl) {
    const parts = hsl[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const h = parseFloat(parts[0]);
    const sP = parseFloat(parts[1]) / 100;
    const lP = parseFloat(parts[2]) / 100;
    return hslToRgb(h, sP, lP);
  }
  return null;
}

export function rgbToHex({ r, g, b }) {
  const h = (n) => n.toString(16).padStart(2, "0");
  return "#" + h(clamp255(r)) + h(clamp255(g)) + h(clamp255(b));
}

function clamp255(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

// sRGB -> HSL
export function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h, s;
  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      default: h = (rn - gn) / d + 4;
    }
    h *= 60;
  }
  return { h, s, l };
}

// HSL -> sRGB
export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const toRgb = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return {
    r: Math.round(toRgb(h + 1 / 3) * 255),
    g: Math.round(toRgb(h) * 255),
    b: Math.round(toRgb(h - 1 / 3) * 255),
  };
}

// Relative luminance per WCAG 2.x.
export function relativeLuminance({ r, g, b }) {
  const toLin = (c) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

// Measure how "brand-like" a color is. Grays near black/white are near zero;
// saturated mid-lightness colors score highest.
export function brandinessScore(color) {
  const { s, l } = rgbToHsl(color);
  // Penalize very light / very dark; reward mid-lightness + saturation.
  const mid = 1 - Math.abs(0.5 - l) * 2; // 0..1
  return s * mid;
}

// Hue-preserving WCAG nudge against a target background (default white).
// Walks lightness in small steps until the AA contrast target is satisfied,
// keeping hue/saturation the same. Returns { color, changed, steps }.
export function nudgeForContrast(color, {
  target = 4.5,            // AA body text
  against = { r: 255, g: 255, b: 255 },
  step = 0.02,
  maxSteps = 30,
} = {}) {
  const startRatio = contrastRatio(color, against);
  if (startRatio >= target) return { color, changed: false, steps: 0, ratio: startRatio };
  const hsl = rgbToHsl(color);
  // Decide whether to darken or lighten based on target background luminance.
  const lumBg = relativeLuminance(against);
  const goDarker = lumBg > 0.5; // against light bg, darken the color
  let l = hsl.l;
  for (let i = 1; i <= maxSteps; i++) {
    l = goDarker ? Math.max(0, l - step) : Math.min(1, l + step);
    const rgb = hslToRgb(hsl.h, hsl.s, l);
    const ratio = contrastRatio(rgb, against);
    if (ratio >= target) return { color: rgb, changed: true, steps: i, ratio };
  }
  // Hard fallback: pure black/white.
  const fallback = goDarker ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
  return { color: fallback, changed: true, steps: maxSteps, ratio: contrastRatio(fallback, against) };
}

// Derive a reasonable "foreground" color for a given background. Returns white
// if the background is dark, near-black otherwise — enough for pill buttons.
export function foregroundFor(color) {
  const lum = relativeLuminance(color);
  return lum > 0.5 ? { r: 17, g: 24, b: 39 } : { r: 255, g: 255, b: 255 };
}
