// Build-time theme resolver. Reads the shipped brand-snapshot.json (if any)
// and merges it with siteConfig.theme to produce the fully-resolved theme
// record used by layout.tsx, the CSS variables emitter, and <CustomerLogo>.
//
// Precedence: defaults ← brand-snapshot.json ← siteConfig.theme (non-null wins)

import fs from "node:fs";
import path from "node:path";
import siteConfig from "../site.config";
import type { FontProvider } from "./site-config-types";

export interface ResolvedTheme {
  primaryHex: string | null;
  primaryForeground: string | null;
  secondaryHex: string | null;
  secondaryForeground: string | null;
  themeColorHex: string | null;
  radius: "sm" | "md" | "lg";
  fontSansFamily: string | null;
  fontSansProvider: FontProvider;
  fontSansNeighbor: string | null;
  fontMono: string;
  brandLogoSrc: string | null;
  brandLogoAlt: string;
  salesforceLogo: boolean;
  faviconSrc: string | null;
  ogHeroSrc: string | null;
  /** Provenance for the "how this site got its look" disclosure. */
  source: {
    extractedFrom: string | null;
    extractedAt: string | null;
    nudgedForContrast: boolean;
  };
}

type BrandSnapshot = {
  extractedFrom?: string;
  extractedAt?: string;
  colors?: {
    primary?: { value: string; foreground?: string; raw?: string; nudged?: boolean };
    secondary?: { value: string; foreground?: string };
    themeColor?: { value: string };
  };
  fonts?: {
    sans?: { family?: string; provider?: FontProvider; neighbor?: string };
  };
  logo?: { file: string };
  favicon?: { file: string };
  og?: { image?: { file: string } };
  company?: { name?: string };
};

const BRAND_PUBLIC_PREFIX = "/brand";

let cachedSnapshot: BrandSnapshot | null | undefined;

function loadSnapshot(): BrandSnapshot | null {
  if (cachedSnapshot !== undefined) return cachedSnapshot;
  const p = path.join(process.cwd(), "data", "brand-snapshot.json");
  try {
    if (!fs.existsSync(p)) {
      cachedSnapshot = null;
      return null;
    }
    const raw = fs.readFileSync(p, "utf8");
    cachedSnapshot = JSON.parse(raw) as BrandSnapshot;
    return cachedSnapshot;
  } catch {
    cachedSnapshot = null;
    return null;
  }
}

function publicBrandPath(file: string | null | undefined): string | null {
  if (!file) return null;
  return `${BRAND_PUBLIC_PREFIX}/${file}`;
}

export function resolveTheme(): ResolvedTheme {
  const snap = loadSnapshot();
  const t = siteConfig.theme;

  const primaryHex = t.primaryHex ?? snap?.colors?.primary?.value ?? null;
  const primaryForeground = snap?.colors?.primary?.foreground ?? null;
  const secondaryHex = t.secondaryHex ?? snap?.colors?.secondary?.value ?? null;
  const secondaryForeground = snap?.colors?.secondary?.foreground ?? null;
  const themeColorHex = snap?.colors?.themeColor?.value ?? null;

  const fontSansFamily = t.fontSans ?? snap?.fonts?.sans?.family ?? null;
  const fontSansProvider = t.fontSansProvider ?? snap?.fonts?.sans?.provider ?? null;
  const fontSansNeighbor = t.fontSansNeighbor ?? snap?.fonts?.sans?.neighbor ?? null;

  const brandLogoSrc =
    publicBrandPath(t.brandLogoFile) ?? publicBrandPath(snap?.logo?.file);
  const brandLogoAlt =
    t.brandLogoAlt ??
    (snap?.company?.name ? `${snap.company.name} logo` : siteConfig.customer.name + " logo");

  const faviconSrc =
    publicBrandPath(t.faviconFile) ?? publicBrandPath(snap?.favicon?.file);
  const ogHeroSrc =
    publicBrandPath(t.ogHeroFile) ?? publicBrandPath(snap?.og?.image?.file);

  return {
    primaryHex,
    primaryForeground,
    secondaryHex,
    secondaryForeground,
    themeColorHex,
    radius: t.radius,
    fontSansFamily,
    fontSansProvider,
    fontSansNeighbor,
    fontMono: t.fontMono,
    brandLogoSrc,
    brandLogoAlt,
    salesforceLogo: t.salesforceLogo,
    faviconSrc,
    ogHeroSrc,
    source: {
      extractedFrom: snap?.extractedFrom ?? null,
      extractedAt: snap?.extractedAt ?? null,
      nudgedForContrast: Boolean(snap?.colors?.primary?.nudged),
    },
  };
}

// Emit a `:root { ... }` declaration block with the CSS custom properties
// that the stylesheet consumes. Returns the CSS string; caller inlines it.
export function themeCssVars(theme: ResolvedTheme): string {
  const lines: string[] = [];
  const add = (k: string, v: string | null) => {
    if (v) lines.push(`  ${k}: ${v};`);
  };
  add("--brand-primary", theme.primaryHex);
  add("--brand-primary-foreground", theme.primaryForeground);
  add("--brand-secondary", theme.secondaryHex);
  add("--brand-secondary-foreground", theme.secondaryForeground);
  add(
    "--brand-radius",
    theme.radius === "sm" ? "4px" : theme.radius === "lg" ? "12px" : "8px",
  );
  if (theme.fontSansFamily) {
    const neighbor = theme.fontSansNeighbor ? `, "${theme.fontSansNeighbor}"` : "";
    add(
      "--font-sans-brand",
      `"${theme.fontSansFamily}"${neighbor}, var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif`,
    );
  }
  if (!lines.length) return "";
  return `:root {\n${lines.join("\n")}\n}`;
}
