# TO TEST

This document is the practical walkthrough for verifying the skill end-to-end.
It focuses on the things this project now does:

- scaffolds a Fumadocs site
- optionally extracts customer branding from a public website
- writes a brand snapshot plus downloaded assets
- wires the extracted theme into the generated site
- supports manual overrides
- supports `/update-docs` and refresh-style workflows

Use it as a checklist any time you change the skill, template, or extractor.

## 1. What to test first

Before testing the feature itself, confirm the local environment can run the workflow:

```bash
node --version
git --version
pnpm --version
```

Expected:

- Node should be 22+.
- `git` should be available.
- `pnpm` should be available if you want the fastest template install.

If any of those are missing, fix the machine first. The skill cannot compensate for a broken runtime.

## 2. Baseline scaffold test

This checks the normal no-brand path.

### Command

```bash
rm -rf /tmp/afd360-test-baseline
node scripts/scaffold.mjs \
  --target /tmp/afd360-test-baseline \
  --customer "Acme Corp" \
  --poc "Service Cloud Agent POC" \
  --product-area "Agentforce + Data 360" \
  --personas "Service Agent, Supervisor, Admin" \
  --integrations "ServiceNow, Snowflake, Slack" \
  --deploy-target "Vercel" \
  --repo-url "https://github.com/acme/service-cloud-agent-poc" \
  --se-name "Dylan Andersen"
```

### What should happen

- The scaffold completes without asking for a customer website.
- The output directory is created.
- `site.config.ts` is written with `null` theme fields.
- No `data/brand-snapshot.json` is created.
- No `public/brand/` assets are copied in.

### Validate

```bash
cd /tmp/afd360-test-baseline
ls
sed -n '1,120p' site.config.ts
```

Look for:

- `primaryHex: null`
- `secondaryHex: null`
- `fontSans: null`
- `brandLogoFile: null`
- `faviconFile: null`

### Build check

```bash
pnpm install
pnpm build
```

Expected:

- build succeeds
- no type or runtime errors are introduced by the new theme code

## 3. Brand extraction test

This checks the new path that reads a customer website and auto-fills the theme.

### Command

Use a public site that has obvious branding. A good test is a site with:

- a visible logo
- a favicon
- an `og:image`
- a `theme-color` meta tag

Example:

```bash
rm -rf /tmp/afd360-test-brand
node scripts/scaffold.mjs \
  --target /tmp/afd360-test-brand \
  --customer "Acme Corp" \
  --poc "Agentforce Service POC" \
  --product-area "Agentforce" \
  --personas "Service Agent,Manager" \
  --integrations "Data Cloud,Jira" \
  --deploy-target "internal" \
  --se-name "Test SE" \
  --customer-url "https://www.vercel.com"
```

### What should happen

- The scaffolder runs the brand extractor before copying the template.
- A `data/brand-snapshot.json` file is created.
- A `public/brand/` folder is created with downloaded assets.
- `site.config.ts` is populated with theme values from the snapshot.
- The scaffold output includes a short brand review summary.

### Validate the output

```bash
cd /tmp/afd360-test-brand
ls data
ls public/brand
sed -n '1,200p' data/brand-snapshot.json
sed -n '1,120p' site.config.ts
```

Check for:

- `extractedFrom`
- `extractedAt`
- `colors.primary`
- `colors.secondary`
- `fonts.sans`
- `favicon`
- `og.image`

### Validate the generated site

```bash
pnpm install
pnpm build
```

Then inspect the build output:

- the production build should succeed
- the rendered HTML should include the resolved brand CSS vars
- the favicon should point at the brand asset
- the OG image should point at the brand asset when one was extracted

## 4. Verify the extractor directly

This is the best test when you only changed brand extraction logic.

### Dry run

```bash
node scripts/brand-extractor/index.mjs \
  --url "https://www.vercel.com" \
  --dry \
  --no-assets
```

What to inspect:

- JSON prints to stdout
- `schemaVersion` exists
- `extractedFrom` is the normalized URL
- `colors.primary` exists when the site exposes brand color hints
- `fonts.sans.family` is populated when detectable
- `accessibility.notes` includes nudges when the extracted color is too light or too dark

### Full write test

```bash
rm -rf /tmp/afd360-brand-only
node scripts/brand-extractor/index.mjs \
  --url "https://www.vercel.com" \
  --out /tmp/afd360-brand-only/brand-snapshot.json \
  --assets-out /tmp/afd360-brand-only/assets
```

Expected:

- snapshot file exists
- assets directory exists
- filenames are stable and usable by the scaffold
- asset paths in the snapshot are basename-style values, not long relative paths

### Failure path tests

Test these separately:

1. `robots.txt` disallows access.
2. The site is down or unreachable.
3. The site responds but does not expose obvious brand signals.

Expected behavior:

- the extractor exits cleanly for disallowed or unreachable sites
- the scaffold does not crash
- the SE gets a plain-English explanation
- the site still scaffolds with defaults

## 5. Theme wiring test

This verifies the theme values actually affect the generated site.

### After a brand-extracted scaffold

Open the generated project and inspect:

```bash
cd /tmp/afd360-test-brand
sed -n '1,120p' app/layout.tsx
sed -n '1,120p' app/global.css
sed -n '1,120p' lib/resolve-theme.ts
sed -n '1,120p' lib/layout.shared.tsx
```

### What to verify

- `app/layout.tsx` injects the CSS variable block.
- `app/layout.tsx` sets favicon metadata from the resolved theme.
- `app/global.css` maps brand variables onto Fumadocs tokens.
- `lib/resolve-theme.ts` merges defaults, snapshot values, and `siteConfig.theme` overrides.
- `components/customer-logo.tsx` shows the logo when present and text fallback when not.

### Visual sanity checks

Run the dev server:

```bash
pnpm dev
```

Then verify in the browser:

- nav title reflects the customer/POC
- customer logo appears when extracted
- sidebar active state uses the brand color
- links use the extracted primary color
- favicon matches the extracted brand asset

## 6. Manual override test

This proves the snapshot does not override explicit human edits.

### Edit the scaffolded `site.config.ts`

Change one or more of these:

- `primaryHex`
- `secondaryHex`
- `fontSans`
- `brandLogoFile`
- `faviconFile`

### Re-run build

```bash
pnpm build
```

### Expected

- your manual values win
- the site still builds
- the theme remains stable even if the snapshot is refreshed later

This is important because the skill should help the SE, not trap them in auto-generated branding.

## 7. Refresh-brand test

This tests the standalone extractor on an existing scaffolded site.

### Command

```bash
cd /path/to/an-existing-scaffolded-site
node <skill-dir>/scripts/brand-extractor/index.mjs \
  --url "https://www.acme.com" \
  --out ./data/brand-snapshot.json \
  --assets-out ./public/brand
```

### What to verify

- `data/brand-snapshot.json` changes.
- `public/brand/` assets update.
- `site.config.ts` does not get rewritten by the extractor.
- manual overrides in `site.config.ts` still remain in place.

### Good follow-up check

After refresh, run:

```bash
pnpm build
```

You want to make sure the refreshed assets still build cleanly and the theme variables resolve.

## 8. `/update-docs` test

This verifies the existing incremental workflow still works.

### Actions to try

- add a section
- refresh starter content
- resync config

### Example

```text
/update-docs
```

Then try:

- `add-section security`
- `refresh-starter agents-and-flows`
- `resync-config`

### Expected

- the requested file changes are applied only to the intended section
- unrelated files stay untouched
- the new brand features do not interfere with the update flow

## 9. Production build test

This is the strongest single test for the whole feature set.

### Commands

```bash
pnpm install
pnpm build
```

### Expected

- build succeeds
- no unresolved placeholders remain
- brand extraction output does not break Next.js metadata
- generated CSS variables are valid
- theme overrides remain type-safe

## 10. Regression checklist

Use this quick list after any code change:

- scaffold with no customer URL
- scaffold with customer URL
- run the extractor directly with `--dry`
- run the extractor directly with file output
- verify `site.config.ts` has the expected theme values
- verify `public/brand/` contains downloaded files
- verify `data/brand-snapshot.json` is written
- run `pnpm build`
- open the site and confirm the brand shows up
- change `site.config.ts` manually and confirm overrides win
- re-run the extractor and confirm the overrides persist

## 11. What can break and what that means

If a test fails, this is the usual diagnosis:

- **Build fails in `site.config.ts`**: placeholder replacement or JS-literal generation broke.
- **Brand snapshot is missing**: the extractor did not run, or it hit a skip path.
- **Assets are missing**: the extractor did not find a candidate or the write path is wrong.
- **Theme does not show in the browser**: CSS vars are not mapped correctly, or the resolved theme is not being injected.
- **Manual overrides are ignored**: precedence in `resolve-theme.ts` is wrong.
- **`pnpm build` passes but the UI looks generic**: the extractor returned `null` values, or the customer site did not expose enough signals.

## 12. Suggested order when debugging

If something goes wrong, debug in this order:

1. Check `data/brand-snapshot.json`.
2. Check `site.config.ts`.
3. Check `public/brand/`.
4. Check `app/layout.tsx` and `app/global.css`.
5. Run `pnpm build`.
6. Open the generated site in the browser and inspect the rendered HTML.

That order keeps you from chasing CSS before you know the data is correct.
