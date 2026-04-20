# afd360-poc-docs-skill

A Cursor skill that scaffolds a tailored [Fumadocs](https://fumadocs.dev) documentation site for a Salesforce Solutions Engineer handing off an Agentforce / Salesforce / Data 360 Proof-of-Concept.

Invoke `/setup-docs` in Cursor and the agent walks you through intake, scaffolds the site, installs dependencies, and starts the dev server.

## What you get

A Next.js 16 + Fumadocs 16 site with:

- Sidebar tuned for a POC handoff: **Overview → Architecture → Setup → Data Model → Agents & Flows → Handoff → Troubleshooting**
- Pages pre-filled with the customer + POC context
- **Auto-extracted customer branding** (optional). Point the scaffolder at the customer's public website and it pulls the logo, favicon, OG hero, primary/secondary colors, and detected font family (with a Google-Fonts neighbor for proprietary fonts) — all WCAG-contrast-nudged and fully overrideable in `site.config.ts`. Zero external runtime dependencies; respects `robots.txt`; degrades cleanly when a site is unreachable.
- Static client-side search (Orama), `llms-full.txt` route, Tailwind v4
- `pnpm` workflow, TypeScript strict

## Install

### Recommended — `npx skills add` (Vercel's open skills CLI)

```bash
npx skills add dylandersen/afd360-poc-docs-skill -g -a cursor
```

This uses the [Vercel Labs `add-skill` CLI](https://github.com/vercel-labs/add-skill) to fetch the skill directly from GitHub and register it with Cursor. Breakdown:

- `dylandersen/afd360-poc-docs-skill` — the public GitHub repo to pull from
- `-g` / `--global` — install to `~/.agents/skills/` so it's available in every project (drop this flag to install only into the current project's `./skills/`)
- `-a cursor` — target Cursor specifically (you can repeat `-a` for multiple agents, e.g. `-a cursor -a claude-code`)

Useful variations:

```bash
npx skills add dylandersen/afd360-poc-docs-skill --list                 # preview skills in the repo before installing
npx skills add dylandersen/afd360-poc-docs-skill --skill afd360-poc-docs-skill -g -a cursor  # install just this skill
npx skills add dylandersen/afd360-poc-docs-skill -g -a cursor -y        # non-interactive (CI / scripts)
npx skills add dylandersen/afd360-poc-docs-skill --copy                 # use a real copy instead of a symlink
```

After install, restart Cursor if the skill doesn't appear in chat. The `/setup-docs` and `/update-docs` triggers are discovered from `SKILL.md` — no separate slash-command file copy is needed.

### Alternative — manual clone / symlink

If you can't use `npx` (air-gapped, corporate proxy, etc.), clone the repo directly:

```bash
git clone https://github.com/dylandersen/afd360-poc-docs-skill ~/.cursor/skills/afd360-poc-docs-skill
```

Or, from inside a cloned copy of this repo:

```bash
./install.sh
# symlinks this directory to ~/.cursor/skills/afd360-poc-docs-skill
```

With the manual path, you'll also want to wire up the slash-command file so `/setup-docs` is auto-completed in Cursor's command palette:

```bash
cp commands/setup-docs.md ~/.cursor/commands/setup-docs.md
# or (project-scoped)
cp commands/setup-docs.md .cursor/commands/setup-docs.md
```

## Usage

In Cursor chat:

```
/setup-docs
```

The agent will:

1. Ask for: customer name, POC name, product area, personas, integrations, deploy target, repo URL, SE name, target directory, **and (optionally) the customer's public website URL for brand auto-extraction**.
2. Call `scripts/scaffold.mjs` to copy the template and substitute placeholders. If a customer URL was supplied, `scripts/brand-extractor/index.mjs` runs first: fetches the site, parses HTML/CSS for meta tags and custom properties, downloads `logo` / `favicon` / `og-hero` into `public/brand/`, runs WCAG contrast checks, and writes `data/brand-snapshot.json`.
3. Show a **brand review** so you can accept / edit / skip extracted values before the site boots.
4. Ask before running `pnpm install`.
5. Start `pnpm dev` and confirm [http://localhost:3000](http://localhost:3000) renders.
6. Print a handoff checklist.

## Brand extraction (the fastest way to not look generic)

The scaffolder can read the customer's public-facing website and bake their logo, favicon, OG hero image, primary/secondary colors, and font family straight into your docs site. It's the single highest-impact feature of this skill — the difference between "generic Fumadocs site" and "oh, this looks like Acme's product."

**When to use it:** anytime the customer has a public site (`acme.com`, `acme.io`, etc.). Skip it for stealth JVs, pre-launch products, or when the customer explicitly asks for a neutral theme.

### The happy path — in Cursor chat

1. Run `/setup-docs`.
2. Answer the normal questions (customer name, POC name, product area, etc.).
3. When the agent asks **"Customer's public website? (I'll grab their logo, colors, and fonts.)"**, paste the URL. `https://` is optional; the scaffolder adds it if missing.
4. The agent runs the brand extractor against the URL (~1–2 s for a typical site), shows you a review of what it found, and asks you to **accept / edit / refresh / skip**.
5. Accept → `pnpm dev` → your localhost:3000 is already themed. Done.

Example agent review output you'll see in chat:

```
Brand extracted from https://www.acme.com:

  Primary       #005fb2   (from <meta theme-color>)
  Secondary     #00a1e0   (from --brand-secondary CSS var)
  Font          "Salesforce Sans" → neighbor "Inter"
  Logo          public/brand/logo.svg
  Favicon       public/brand/favicon.png
  OG hero       public/brand/og-hero.png
  WCAG          primary vs. white: 4.63 (pass)   vs. dark: 3.83 (fail)

Anything to change before I boot the dev server?
```

### What ends up on disk

```
<your-scaffolded-site>/
├── site.config.ts              ← theme fields (primaryHex, fontSans, brandLogoFile, ...) pre-filled
├── public/
│   └── brand/                  ← assets downloaded from the customer site
│       ├── logo.svg            (header, if present)
│       ├── favicon.png
│       └── og-hero.png
└── data/
    └── brand-snapshot.json     ← full provenance: source URLs, confidence, WCAG ratios, timestamps
```

Everything is auditable. Every value has a `source` field. You can hand `brand-snapshot.json` to a customer legal team and they can see exactly what was pulled from where and when.

### Overriding anything the extractor picked

Edit `site.config.ts`. Any non-null value there **wins** over the snapshot. Leaving a field as `null` falls back to the snapshot (and then to Fumadocs defaults if the snapshot is missing too).

```ts
// site.config.ts
theme: {
  primaryHex: "#0040b0",          // ← forces blue, ignores whatever extractor picked
  secondaryHex: null,             // ← null → use snapshot value
  fontSans: null,                 // ← null → use snapshot value ("Inter" in the example above)
  brandLogoFile: "my-logo.svg",   // ← put your own file in public/brand/ and point at it
  // ...
},
```

Re-running the extractor later **does not** touch `site.config.ts` — manual overrides stay put. It only rewrites `data/brand-snapshot.json` and replaces files in `public/brand/`.

### Refreshing brand later (customer rebranded, you want better colors, etc.)

From inside your scaffolded site:

```bash
node <skill-dir>/scripts/brand-extractor/index.mjs \
  --url "https://www.<customer>.com" \
  --out ./data/brand-snapshot.json \
  --assets-out ./public/brand
```

Where `<skill-dir>` is the path to this skill on your machine:

- If you installed with `npx skills add ... -g`, it's `~/.agents/skills/afd360-poc-docs-skill/`.
- If you cloned manually, it's wherever you cloned to.

Or, in Cursor chat: *"refresh the brand extraction against https://www.acme.com"* — the agent will run the same command for you.

### Opting out — full and partial

**Full opt-out (never run the extractor for this POC):** skip the customer website question during intake. The site falls back to clean Fumadocs defaults and you can set `primaryHex` etc. by hand later.

**Scaffold with the URL but skip the network call** (e.g. air-gapped laptop, corporate proxy):

```bash
node scripts/scaffold.mjs ... --customer-url https://www.acme.com --no-brand-extract
```

The customer URL still lands in `site.config.ts`, but no fetch happens. You can run the extractor manually later.

**Partial opt-out — keep extracted colors but not the logo:** set `theme.brandLogoFile = null` in `site.config.ts` and delete `public/brand/logo.*`. The nav falls back to the customer name as a text wordmark.

**Hide the Salesforce mark in nav** (for strict customer-only branding): set `theme.salesforceLogo = false` in `site.config.ts`.

### When extraction fails gracefully

| What happened | What you'll see | What to do |
|---|---|---|
| `robots.txt` disallows us | `"brand extraction skipped: robots-disallow"` | Agent continues without extracted brand. Set colors by hand in `site.config.ts`. |
| Site is down / 404 / timeout | `"brand extraction skipped: unreachable"` | Same — try a different URL, or continue and fill in by hand. |
| Logo is a CSS background (not `<img>`) | `logo: null` in the review | Drop a `.svg` / `.png` into `public/brand/` manually and set `theme.brandLogoFile`. |
| Primary color fails WCAG AA on white | Review shows the raw + nudged hex, and an accessibility note | If you don't like the nudge, override `theme.primaryHex` in `site.config.ts`. |
| Proprietary font detected (Proxima Nova, Gotham, Salesforce Sans, ...) | Font name shown + "neighbor" (e.g. "Inter") | The neighbor is what the site actually uses. Licensing forbids us auto-hosting the original. |
| Weird color from a rainbow logo | Low confidence score in the review | Override `theme.primaryHex` in the review or in `site.config.ts`. |

The extractor **never** fails the scaffold. Worst case, you get a site with default theme that you can brand by hand.

### Power-user: run the extractor standalone

Useful for scripting, CI, or before scaffolding to preview what you'd get:

```bash
node scripts/brand-extractor/index.mjs \
  --url "https://www.acme.com" \
  --dry \
  --no-assets
```

`--dry` prints the full snapshot JSON to stdout instead of writing files. `--no-assets` skips the binary downloads. Combine them to get a quick read on what the extractor would produce without touching your filesystem. Exit codes are scriptable: `0` on success, `6` on robots-disallow, `7` on unreachable.

## Updating an existing site with `/update-docs`

Once you've scaffolded a site with `/setup-docs`, use `/update-docs` to add or refresh sections without re-scaffolding (which would blow away your edits).

In Cursor chat:

```
/update-docs
```

The agent asks for **two things**:

1. **Target directory** — absolute path to the already-scaffolded site
2. **Action** — one of:

| Action | What it does | When to use it |
|--------|--------------|----------------|
| `add-section <slug>` | Drops a new `.mdx` from the section library and appends the slug to `meta.json` | You need a new page (e.g. "Security", "FAQ") that wasn't in the original scaffold |
| `refresh-starter <slug>` | Re-copies the starter content into an existing section | You want the template's latest boilerplate back; **destructive** — warns before overwrite |
| `resync-config` | Regenerates `site.config.ts` from intake (interactive) | The customer name / personas / integrations changed and you want them propagated everywhere |

### Built-in section library

`add-section` pulls from `templates/fumadocs-poc/content/docs/_sections/`. Available slugs:

| Slug | Purpose |
|------|---------|
| `security` | Threat model, sharing rules, secrets handling, permset audit |
| `observability` | Logging, monitoring, alerting, agent transcript review |
| `rollout-plan` | Phased rollout, comms plan, training, success metrics |
| `faq` | Customer-facing frequently asked questions |
| `glossary` | Acronyms and terms specific to this POC |
| `release-notes` | Ongoing change log post-handoff |
| `runbook` | Standalone operational runbook (when `handoff.mdx` gets too long) |

To see what's actually on disk:

```bash
node scripts/scaffold.mjs --list-sections
```

### Natural-language invocation

`/update-docs` is also triggered by phrases like:

- "add a security section to my POC docs"
- "refresh the starter content for agents-and-flows"
- "I renamed the customer, resync the config"

The agent routes these to the same workflow. You don't have to remember the exact action names.

### What `/update-docs` won't do

- It **won't** touch unrelated `.mdx` files — only the one you target.
- It **won't** run `git commit` — review the diff yourself.
- It **won't** delete anything without `refresh-starter` (and even then it warns first).

## Manual scaffold (no Cursor)

```bash
node scripts/scaffold.mjs \
  --target /absolute/path/to/output \
  --customer "Acme Corp" \
  --poc "Service Cloud Agent POC" \
  --product-area "Agentforce + Data 360" \
  --personas "Service Agent, Supervisor, Admin" \
  --integrations "ServiceNow, Snowflake, Slack" \
  --deploy-target "Vercel" \
  --repo-url "https://github.com/acme/service-cloud-agent-poc" \
  --se-name "Dylan Andersen" \
  --customer-url "https://www.acme.com"      # optional — runs brand extractor
```

Flags:

- `--force` — overwrite a non-empty target directory.
- `--customer-url <url>` — runs `scripts/brand-extractor/index.mjs` against the URL before copy, fills theme placeholders, and installs brand assets into `<target>/public/brand/`.
- `--no-brand-extract` — keep the customer URL in `site.config.ts` but skip the network call (air-gapped / offline).
- `--brand-snapshot <path>` — reuse an existing `brand-snapshot.json` (and optional sibling `brand-assets/` dir) instead of running extraction. Useful for CI, deterministic rebuilds, or hand-edited snapshots.

## Repo layout

```
afd360-poc-docs-skill/
├── SKILL.md                     skill manifest + workflow for the agent
├── commands/
│   └── setup-docs.md            /setup-docs slash command file
├── scripts/
│   ├── scaffold.mjs             copy + placeholder substitution engine
│   └── brand-extractor/         zero-dep customer brand extractor
│       ├── index.mjs            CLI entry (used by scaffold + standalone)
│       ├── fetch.mjs            HTTP with timeouts / redirects / size caps
│       ├── html.mjs             head + header tag scanner
│       ├── css.mjs              CSS custom-property + @font-face parser
│       ├── color.mjs            sRGB / WCAG contrast / hue-preserving nudge
│       ├── fonts.mjs            font detection + Google Fonts neighbor map
│       ├── logo.mjs             logo + favicon candidate scoring
│       ├── robots.mjs           robots.txt compliance (RFC 9309)
│       └── util.mjs             image dimension sniffing, asset helpers
├── reference/
│   ├── intake.md                how to ask each intake question
│   ├── content-guide.md         what belongs in each section
│   └── handoff-checklist.md     "done" checklist for a POC handoff
├── templates/
│   └── fumadocs-poc/            the Fumadocs site template (placeholders)
│       ├── site.config.ts       central config + theme overrides
│       ├── lib/
│       │   ├── resolve-theme.ts   precedence resolver + CSS var emitter
│       │   └── site-config-types.ts
│       └── components/customer-logo.tsx
├── install.sh                   symlink this folder to ~/.cursor/skills/afd360-poc-docs-skill
├── DEEP_DIVE.md                 long-form spec + mini-PRDs (incl. brand)
├── README.md
└── LICENSE
```

## Placeholder tokens

Template files contain these tokens. The scaffolder replaces them from CLI flags or from the brand snapshot.

### Identity / POC (strings — replaced as-is)

| Token | Flag / source |
|-------|------|
| `__CUSTOMER_NAME__` | `--customer` |
| `__CUSTOMER_SLUG__` | derived (or `--customer-slug`) |
| `__POC_NAME__` | `--poc` |
| `__POC_SLUG__` | derived (or `--poc-slug`) |
| `__PRODUCT_AREA__` | `--product-area` |
| `__PERSONAS__` | `--personas` |
| `__INTEGRATIONS__` | `--integrations` |
| `__DEPLOY_TARGET__` | `--deploy-target` |
| `__REPO_URL__` | `--repo-url` |
| `__SE_NAME__` | `--se-name` |
| `__CUSTOMER_URL__` | `--customer-url` (raw string form) |
| `__YEAR__` | auto (current year) |

### Theme / brand (JS literals — `"string"` or `null`, for use in `site.config.ts`)

Filled from `data/brand-snapshot.json` when `--customer-url` is supplied; otherwise all `null`.

| Token | Meaning |
|-------|---------|
| `__CUSTOMER_URL_JS__` | JS-literal URL for `siteConfig.customer.website` |
| `__THEME_PRIMARY_HEX__` | Extracted primary color (WCAG-nudged) |
| `__THEME_SECONDARY_HEX__` | Extracted secondary color |
| `__THEME_FONT_SANS_NAME__` | Detected sans-serif family (e.g. `"Inter"`, `"Salesforce Sans"`) |
| `__THEME_FONT_SANS_PROVIDER__` | `"google" \| "typekit" \| "custom" \| "system"` |
| `__THEME_FONT_SANS_NEIGHBOR__` | Nearest Google Font when provider is `typekit`/`custom` |
| `__THEME_BRAND_LOGO_FILE__` | Basename within `public/brand/` (e.g. `"logo.svg"`) |
| `__THEME_BRAND_LOGO_ALT__` | Alt text for the logo `<img>` |
| `__THEME_FAVICON_FILE__` | Favicon basename |
| `__THEME_OG_HERO_FILE__` | OG hero basename |
| `__BRAND_EXTRACTED_FROM__` | Source URL (provenance) |
| `__BRAND_EXTRACTED_AT__` | ISO timestamp (provenance) |
| `__BRAND_COMPANY_TAGLINE__` | Tagline from `og:description` |

## Extend

- Add sections: drop new `.mdx` files in `templates/fumadocs-poc/content/docs/` and register them in `meta.json`.
- Add placeholders: update `scripts/scaffold.mjs` `replacements` map and document in `SKILL.md`.
- Change styling: edit `templates/fumadocs-poc/app/global.css`.

## License

MIT — see `LICENSE`.
