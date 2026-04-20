// Strongly typed shape for site.config.ts. Every field that can be
// null-or-string is intentionally optional/nullable so authors can leave
// auto-extracted brand values alone and override only what they need.

export type FontProvider = "google" | "typekit" | "custom" | "system" | null;

export interface SiteThemeConfig {
  /** Primary brand color in `#rrggbb`. null → use brand-snapshot.json value; null there too → Fumadocs default. */
  primaryHex: string | null;
  secondaryHex: string | null;
  radius: "sm" | "md" | "lg";
  /** Sans family name. null → brand-snapshot value or `system-ui`. */
  fontSans: string | null;
  fontSansProvider: FontProvider;
  /** For proprietary fonts, the nearest Google Fonts alternative. */
  fontSansNeighbor: string | null;
  fontMono: string;
  /** Filename within public/brand/ for the customer logo (e.g. "logo.svg"). null → no logo. */
  brandLogoFile: string | null;
  brandLogoAlt: string | null;
  salesforceLogo: boolean;
  /** Filename within public/brand/ for the favicon. */
  faviconFile: string | null;
  ogHeroFile: string | null;
  source: {
    extractedFrom: string | null;
    extractedAt: string | null;
  };
}

export interface SiteConfig {
  customer: {
    name: string;
    slug: string;
    website: string | null;
  };
  poc: {
    name: string;
    slug: string;
    productArea: string;
    personas: string;
    integrations: string;
    deployTarget: string;
    repoUrl: string;
    seName: string;
    year: string;
  };
  theme: SiteThemeConfig;
  companyTagline: string | null;
}
