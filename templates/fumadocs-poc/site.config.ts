// ---------------------------------------------------------------------------
// site.config.ts
// ---------------------------------------------------------------------------
// Central, hand-editable configuration for this POC documentation site.
//
// Theme values live here so you can override anything the brand extractor
// auto-filled. Precedence when the site builds:
//
//   defaults   ←   data/brand-snapshot.json (if present)   ←   siteConfig.theme
//
// Anything you set below to a non-null value wins.
//
// Auto-filled during scaffold by:
//   node scripts/brand-extractor/index.mjs --url <customer-url>
// Refresh at any time with:
//   node scripts/brand-extractor/index.mjs \
//     --url <customer-url> \
//     --out ./data/brand-snapshot.json \
//     --assets-out ./public/brand
// ---------------------------------------------------------------------------

import type { SiteConfig } from "./lib/site-config-types";

export const siteConfig: SiteConfig = {
  customer: {
    name: "__CUSTOMER_NAME__",
    slug: "__CUSTOMER_SLUG__",
    website: __CUSTOMER_URL_JS__,
  },
  poc: {
    name: "__POC_NAME__",
    slug: "__POC_SLUG__",
    productArea: "__PRODUCT_AREA__",
    personas: "__PERSONAS__",
    integrations: "__INTEGRATIONS__",
    deployTarget: "__DEPLOY_TARGET__",
    repoUrl: "__REPO_URL__",
    seName: "__SE_NAME__",
    year: "__YEAR__",
  },

  // Theme overrides. Any non-null value here trumps whatever the brand
  // extractor placed in data/brand-snapshot.json.
  theme: {
    primaryHex: __THEME_PRIMARY_HEX__,
    secondaryHex: __THEME_SECONDARY_HEX__,
    radius: "md",
    fontSans: __THEME_FONT_SANS_NAME__,
    fontSansProvider: __THEME_FONT_SANS_PROVIDER__,
    fontSansNeighbor: __THEME_FONT_SANS_NEIGHBOR__,
    fontMono: "Geist Mono",
    brandLogoFile: __THEME_BRAND_LOGO_FILE__,
    brandLogoAlt: __THEME_BRAND_LOGO_ALT__,
    salesforceLogo: true,
    faviconFile: __THEME_FAVICON_FILE__,
    ogHeroFile: __THEME_OG_HERO_FILE__,
    source: {
      extractedFrom: __BRAND_EXTRACTED_FROM__,
      extractedAt: __BRAND_EXTRACTED_AT__,
    },
  },

  // Surface the tagline the extractor picked from og:description. You can
  // override this with a line you'd rather say in the UI.
  companyTagline: __BRAND_COMPANY_TAGLINE__,
};

export default siteConfig;
