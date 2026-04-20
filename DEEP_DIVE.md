# afd360-poc-docs-skill — Deep Dive, Gap Analysis, and Roadmap PRD

> A long-form, verbose strategy document for turning `afd360-poc-docs-skill` from a Fumadocs template with placeholders into a **full-featured, repo-aware, org-aware customer handoff platform** that a brand-new SE can point at their local Salesforce POC repo and produce a beautiful, accurate, customer-ready documentation site — with minimal typing and maximum accuracy.
>
> **Audience:** the skill's maintainers (us), future contributors, and the SE org leadership deciding how much to invest in this tool.
>
> **Reading time:** ~40–60 minutes. Skim the table of contents, stop in the sections that matter for your next sprint.

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [The "north star" we're building toward](#2-the-north-star-were-building-toward)
3. [Honest current-state audit (what exists vs. what we claim)](#3-honest-current-state-audit-what-exists-vs-what-we-claim)
4. [The conceptual shift: from template to "repo-aware generator"](#4-the-conceptual-shift-from-template-to-repo-aware-generator)
5. [Primary persona and the SE's day-in-the-life](#5-primary-persona-and-the-ses-day-in-the-life)
6. [Gap inventory (at-a-glance list of ~30 missing capabilities)](#6-gap-inventory-at-a-glance-list-of-30-missing-capabilities)
7. [Mini-PRDs — foundation fixes (P0)](#7-mini-prds--foundation-fixes-p0)
  - 7.1 [Ship the scripts SKILL.md already promises](#71-ship-the-scripts-skillmd-already-promises)
  - 7.2 [Introduce `site.config.ts` as the single source of truth](#72-introduce-siteconfigts-as-the-single-source-of-truth)
  - 7.3 [Ship the `_sections/` library](#73-ship-the-_sections-library)
  - 7.4 [Conditional rendering via `<ProductArea>` and `__INCLUDE_*`__ booleans](#74-conditional-rendering-via-productarea-and-__include__-booleans)
  - 7.5 [Replace ASCII diagrams with Mermaid starters](#75-replace-ascii-diagrams-with-mermaid-starters)
  - 7.6 [Scaffold CI: make the scaffolder itself testable](#76-scaffold-ci-make-the-scaffolder-itself-testable)
8. [Mini-PRDs — the repo-aware generator (P1, the "wow" tier)](#8-mini-prds--the-repo-aware-generator-p1-the-wow-tier)
  - 8.1 [The `sfdx-inspector` module: reading a local Salesforce repo](#81-the-sfdx-inspector-module-reading-a-local-salesforce-repo)
  - 8.2 [Auto-generated Custom Object / Field / Validation Rule pages](#82-auto-generated-custom-object--field--validation-rule-pages)
  - 8.3 [Auto-generated ERD (Mermaid) from metadata](#83-auto-generated-erd-mermaid-from-metadata)
  - 8.4 [Apex class + test coverage inventory](#84-apex-class--test-coverage-inventory)
  - 8.5 [Flow inventory table](#85-flow-inventory-table)
  - 8.6 [Permission Set / Permission Set Group audit](#86-permission-set--permission-set-group-audit)
  - 8.7 [Named Credential / External Service / Connected App inventory](#87-named-credential--external-service--connected-app-inventory)
  - 8.8 [Agentforce agent / topic / action enumeration](#88-agentforce-agent--topic--action-enumeration)
  - 8.9 [Data Cloud (Data 360) asset inventory](#89-data-cloud-data-360-asset-inventory)
  - 8.10 [The `/generate-from-repo` super-command](#810-the-generate-from-repo-super-command)
9. [Mini-PRDs — the "org-aware" tier (P2)](#9-mini-prds--the-org-aware-tier-p2)
  - 9.1 [Live org pull: using `sf` to enrich or override repo data](#91-live-org-pull-using-sf-to-enrich-or-override-repo-data)
  - 9.2 [Agent test run importer (transcripts & scores)](#92-agent-test-run-importer-transcripts--scores)
  - 9.3 [Debug log / governor limit import](#93-debug-log--governor-limit-import)
  - 9.4 [Drift detection: site vs. org](#94-drift-detection-site-vs-org)
10. [Mini-PRDs — site polish and beauty (P1/P2)](#10-mini-prds--site-polish-and-beauty-p1p2)
  - 10.1 [Marketing landing page (no more redirect to /docs)](#101-marketing-landing-page-no-more-redirect-to-docs)
    - 10.2 [Theme system (logo, colors, typography, favicon, OG)](#102-theme-system-logo-colors-typography-favicon-og)
    - 10.3 [Co-branding: customer + Salesforce + SE](#103-co-branding-customer--salesforce--se)
    - 10.4 [OG image generation per page](#104-og-image-generation-per-page)
    - 10.5 [Screenshot & Loom embed components](#105-screenshot--loom-embed-components)
    - 10.6 [Diagram-as-code components (Mermaid + Excalidraw)](#106-diagram-as-code-components-mermaid--excalidraw)
11. [Mini-PRDs — operations, delivery, and compliance (P2/P3)](#11-mini-prds--operations-delivery-and-compliance-p2p3)
  - 11.1 [Deploy automation (Vercel / Cloudflare / Netlify / static)](#111-deploy-automation-vercel--cloudflare--netlify--static)
    - 11.2 [Access control (preview links, password gate, SSO)](#112-access-control-preview-links-password-gate-sso)
    - 11.3 [PDF export of the whole site](#113-pdf-export-of-the-whole-site)
    - 11.4 [Analytics & customer feedback widget](#114-analytics--customer-feedback-widget)
    - 11.5 [Changelog / release notes automation](#115-changelog--release-notes-automation)
    - 11.6 [Internationalization (i18n)](#116-internationalization-i18n)
    - 11.7 [Accessibility & print stylesheet](#117-accessibility--print-stylesheet)
12. [Mini-PRDs — power-user and maintainer quality of life (P3)](#12-mini-prds--power-user-and-maintainer-quality-of-life-p3)
  - 12.1 [Industry / vertical sub-templates](#121-industry--vertical-sub-templates)
    - 12.2 [Content quality linter (Vale + custom rules)](#122-content-quality-linter-vale--custom-rules)
    - 12.3 [Placeholder-safety: linting and type guards](#123-placeholder-safety-linting-and-type-guards)
    - 12.4 [Interactive intake TUI for the manual path](#124-interactive-intake-tui-for-the-manual-path)
    - 12.5 [First-run tour inside the scaffolded site](#125-first-run-tour-inside-the-scaffolded-site)
    - 12.6 [Telemetry about the skill itself (opt-in)](#126-telemetry-about-the-skill-itself-opt-in)
13. [Cross-cutting concerns](#13-cross-cutting-concerns)
14. [Suggested phased roadmap](#14-suggested-phased-roadmap)
15. [Success metrics](#15-success-metrics)
16. [Open questions for the team](#16-open-questions-for-the-team)
17. [Appendix A — File-by-file inventory and verdict](#17-appendix-a--file-by-file-inventory-and-verdict)
18. [Appendix B — Proposed final directory layout](#18-appendix-b--proposed-final-directory-layout)
19. [Appendix C — Data contracts and JSON shapes](#19-appendix-c--data-contracts-and-json-shapes)

---

## 1. Executive summary

`afd360-poc-docs-skill` has a solid, well-thought-through skeleton. `SKILL.md` describes a surprisingly mature workflow — preflight → intake → scaffold → smoke test → next steps — and the template it copies (`templates/fumadocs-poc/`) is a working Fumadocs 16 site that builds on Node 22 with Tailwind v4, Orama search, and `llms-full.txt`.

But there is a **material gap between what `SKILL.md` promises and what's actually checked in**, and a **bigger gap between what the skill does today and what the user (a Salesforce SE handing off a POC) actually needs**.

The promise gap is a trust problem:

- `SKILL.md` repeatedly references `scripts/preflight.mjs`, `scripts/verify-placeholders.mjs`, a `_sections/` library, a `site.config.ts`, a `<ProductArea>` helper, `__INCLUDE_DATA_CLOUD`__/`__INCLUDE_AGENTFORCE_`_ boolean placeholders, and `__DEPLOY_TARGETS__`/`__DEPLOY_TARGET_PRIMARY__` tokens. **None of these exist on disk.** `SKILL.md` even flags this under "Status" — but until we ship them, `/setup-docs` and `/update-docs` will partially fail and we'll erode SE trust on first contact.

The vision gap is where the upside is:

- The skill today is a **glorified `cp -r` with string substitution**. The SE still hand-writes every table (objects, fields, Apex classes, flows, agents, permsets, integrations), draws every diagram, and copies every transcript.
- The user's stated goal — *"have it explain to the customer what the new SE did and what did they build for them in their Salesforce org"* — implies a **repo-aware and (ideally) org-aware generator** that reads `force-app/main/default/`, parses metadata, and pre-fills tables, ERDs, and inventories the SE can then narrate rather than transcribe.
- Fumadocs is a perfect canvas for this because MDX lets us ship React components (`<AgentforceTable>`, `<ERD mermaid={...} />`, `<PermsetAudit data={...}/>`) that render introspection data with zero SE effort.

The proposal in this document:

1. **Fix integrity first (P0, ~1–2 weeks).** Ship everything `SKILL.md` already claims. This is a credibility tax we need to pay before anything else matters.
2. **Build the `sfdx-inspector` core (P1, ~2–4 weeks).** A Node module that reads a Salesforce DX project and emits a single `poc-snapshot.json` consumed by MDX components. This is the wedge that unlocks auto-generated content.
3. **Layer in the site-polish features (P1/P2, rolling).** Marketing landing, theme, co-branding, OG images, deploy automation.
4. **Add org-aware enrichment (P2, ~4–6 weeks).** Live org pulls via `sf`, transcript import, drift detection.
5. **Ship delivery-grade features (P2/P3).** Access control, PDF export, analytics, i18n.

The rest of this document is the detailed case for each piece.

---

## 2. The "north star" we're building toward

Imagine a new SE has just finished a 4-week Agentforce + Data 360 POC for Acme Corp. The metadata lives in `~/projects/acme-agent-poc/force-app/main/default/`. The org is `acme-agent-poc.sandbox.my.salesforce.com`.

In the old world, producing a customer-ready handoff site is a 1–2 day task of MDX-wrangling, screenshot taking, and transcript copying.

In the new world we want, the SE:

```bash
cd ~/projects/acme-agent-poc
# in Cursor chat:
/setup-docs --from-repo . --org acme-agent-poc --customer "Acme Corp" --poc "Service Cloud Agent POC"
```

…and 90 seconds later they have a docs site where:

- **Overview** is pre-filled with the customer's name, POC name, product area, personas (derived from permsets found in the repo), integrations (derived from Named Credentials), and deploy target.
- **Architecture** ships a Mermaid system-context diagram auto-generated from which features appear in `force-app/` (Agentforce bundles, Data Cloud metadata, external services, Flows, Apex).
- **Data Model** ships a Mermaid ERD auto-generated from `objects/*/fields/*.field-meta.xml`, plus tables of custom objects, custom fields (only non-obvious ones), validation rules, and record types.
- **Agents & Flows** ships a full inventory: every `.bot-meta.xml`, `.genAiFunction-meta.xml`, `.genAiPlugin-meta.xml`, `.flow-meta.xml`, `.cls` / `.trigger`, with descriptions pulled from XML `<description>` tags and test coverage merged in from the last `sf apex run test` output.
- **Setup** ships a tailored `sf project deploy start` sequence and permset assignments inferred from what's in the repo.
- **Handoff** ships with the ownership matrix pre-seeded with integration names and permset names so the SE only has to fill in people.
- **Troubleshooting** ships a skeleton with relevant tabs shown/hidden based on what features are in scope.

The SE then spends their time doing the thing only they can do — **writing narrative**: why decisions were made, what alternatives were rejected, what's out of scope, what the customer's team should watch for. The skill handles the mechanical parts.

That is the north star. The rest of this document is how we get there.

---

## 3. Honest current-state audit (what exists vs. what we claim)

### 3.1 What actually works today

- `scripts/scaffold.mjs` — works. Copies the template, substitutes placeholders, renames `_gitignore`, prints a JSON summary. Safe defaults (`--force` required to overwrite a non-empty directory). No `rm -rf`. Good.
- `templates/fumadocs-poc/` — a real, complete Next.js 16 + Fumadocs 16 app. `package.json` pins modern deps (Next 16, React 19, Fumadocs 16.7.9, Tailwind v4, Orama 3). It builds (assuming Node 22 and pnpm).
- `content/docs/*.mdx` — seven starter pages with thoughtful structure: index, architecture, setup, data-model, agents-and-flows, handoff, troubleshooting. Each has tables, callouts, and `TODO(SE)` markers.
- `app/api/search/route.ts` and `components/search-dialog.tsx` — Orama search wiring exists.
- `app/llms-full.txt/route.ts` — LLM-friendly export exists.
- `reference/intake.md`, `reference/content-guide.md`, `reference/handoff-checklist.md` — strong editorial guidance for the SE.
- `install.sh` — symlinks the skill into `~/.cursor/skills/`.
- `commands/setup-docs.md` and `commands/update-docs.md` — slash command specs exist.

### 3.2 What `SKILL.md` promises but isn't on disk

This is the most important section to read. Every item below is a ticking time bomb — the moment an SE triggers it, they get an error.


| Claimed in `SKILL.md`                                                      | Reality on disk                   | Impact                                                                                                                                                                                                      |
| -------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/preflight.mjs`                                                    | missing                           | Phase 0 (Node/package-manager/network check) can't run. SKILL.md says "until they land, `/setup-docs` and `/update-docs` will fail at Phase 0." Shipping this is table stakes.                              |
| `scripts/verify-placeholders.mjs`                                          | missing                           | Post-scaffold lint that catches leftover `__*__` tokens. Without it, a forgotten placeholder ships to the customer.                                                                                         |
| `templates/fumadocs-poc/content/docs/_sections/`                           | missing                           | `/update-docs add-section <slug>` has no library to pull from. The entire `add-section` feature is broken.                                                                                                  |
| `site.config.ts`                                                           | not generated                     | SKILL.md calls this "the one file that centralizes every knob an SE typically wants to change." It's also where `__INCLUDE_*__` booleans are supposed to be exported. Without it, MDX can't cleanly branch. |
| `<ProductArea>` helper component                                           | missing                           | Conditional rendering for Data 360 / Agentforce sections falls back to comment-based TODOs.                                                                                                                 |
| `__INCLUDE_DATA_CLOUD__`, `__INCLUDE_AGENTFORCE__`                         | not emitted                       | `scaffold.mjs` doesn't derive or substitute these. SKILL.md's "Conditional rendering contract" is aspirational.                                                                                             |
| `__DEPLOY_TARGETS__`, `__DEPLOY_TARGET_PRIMARY__`                          | not emitted                       | Scaffold only substitutes `__DEPLOY_TARGET__`. SKILL.md documents multi-target tabs that currently can't render.                                                                                            |
| `--list-sections` flag                                                     | not implemented in `scaffold.mjs` | Section discovery command documented but absent.                                                                                                                                                            |
| `/update-docs` actions (`add-section`, `refresh-starter`, `resync-config`) | not implemented                   | `scaffold.mjs` only knows how to do a full scaffold.                                                                                                                                                        |
| `public/logo.png`                                                          | missing                           | "Swap the logo" recipe in the README doesn't work — there's no file to replace.                                                                                                                             |
| Mermaid diagrams in starter MDX                                            | not present                       | `architecture.mdx` and `data-model.mdx` ship ASCII art. SKILL.md claims Mermaid.                                                                                                                            |
| OG image route                                                             | missing                           | Neither a static OG image nor a dynamic `/og` route ships in `app/`.                                                                                                                                        |
| Theme primary color variable                                               | no hook                           | `site.config.ts` doesn't exist and `global.css` doesn't expose a brand variable beyond Fumadocs' neutral preset.                                                                                            |


### 3.3 Correctness / consistency nits

- `package.json` in the template declares `"engines": { "node": ">=20" }`. `SKILL.md` says Fumadocs 16 requires Node 22+. These should agree. Pick one (22).
- `reference/intake.md` mentions `__DEPLOY_TARGET_PRIMARY__` / `__DEPLOY_TARGETS__` but the current `scaffold.mjs` only reads `--deploy-target` (singular). A user following the reference doc will get a CLI mismatch.
- `commands/setup-docs.md` tells the agent to ask "What is your name?" first and then "What is your customer's name?" — `SKILL.md` in contrast documents 4 required fields and 5 optional, ordered differently, with SE name default-coming-from-OS. These two contradict each other. Pick one source of truth (SKILL.md is the newer, better one).
- `architecture.mdx` says "Mermaid is intentionally not used here — drop a PNG/SVG into `public/`." `data-model.mdx` says the same. Meanwhile `SKILL.md` claims starter MDX ships "Mermaid diagrams." The template chose one direction and the docs chose another. (This doc proposes we go Mermaid.)
- `handoff.mdx` says "Agentforce" and "Data 360" sections are conditional on product area, but they are unconditionally rendered. This is exactly what `<ProductArea>` would fix.
- `app/llms-full.txt/route.ts` is referenced but not inspected here; verify it emits merged MDX (including all `_sections/` pages) and doesn't stale.
- There's no `.vercelignore` / `vercel.json` / `netlify.toml` in the template. Deploy advice is aspirational until we ship target-specific config.

### 3.4 Editorial state

`reference/content-guide.md` and `reference/handoff-checklist.md` are genuinely good. They're more valuable than the template MDX itself — they encode the SE playbook. As we add auto-generation features, we should be careful not to cannibalize them; they remain the "why / how to think" guide even when we automate the "what goes where."

---

## 4. The conceptual shift: from template to "repo-aware generator"

The single largest lever in this doc. Everything else is footnote-sized compared to this.

Today the skill's mental model is:

```
intake fields → scaffold.mjs (string replace) → Fumadocs site
```

The proposed mental model is:

```
intake fields
     +
repo introspection (force-app/*)
     +
(optional) live org pull (sf CLI)
     ↓
poc-snapshot.json   ←— a single, versioned JSON artifact
     ↓
scaffold.mjs (copy template, substitute placeholders, write snapshot)
     ↓
Fumadocs site that reads poc-snapshot.json at build time via MDX components
```

Key design choices this unlocks:

- **Regeneration is safe and useful.** The SE re-runs `/update-docs --refresh-snapshot` after any metadata change and the tables re-render. Their narrative sits in `.mdx` files and survives.
- **The template stays thin.** Every table that's tedious to maintain (objects, fields, flows, Apex) becomes `<SomeInventory />` reading the JSON. The `.mdx` reduces to prose + one component tag + `{/* TODO: add decision rationale */}`.
- **The site is still plain MDX under the hood.** No forced dependency on our tools. If the SE wants to hand-edit, they can; components always have a "fallback" prop for manual rows.
- **LLMs can consume it.** `llms-full.txt` now includes the structured snapshot plus narrative, which makes the customer's own LLM answers about their POC dramatically better.
- **It's testable.** We can golden-file the JSON shape, and the scaffolder becomes a pure function of (template + snapshot + intake).

This separation — **data (snapshot) vs. narrative (MDX) vs. shell (template)** — is the idea the rest of this document assumes.

---

## 5. Primary persona and the SE's day-in-the-life

**Persona: "Jordan," a Salesforce SE, 1–3 years into the role.**

Jordan closed Acme Corp last quarter. The customer signed a 4-week POC for an Agentforce Service Agent integrated with ServiceNow + Snowflake. Jordan built it. Now Jordan has four days until the handoff meeting.

Jordan's constraints:

- They are not a professional technical writer.
- They know their way around `sf` CLI, `sfdx-project.json`, and VSCode. They don't know Fumadocs.
- They have no budget of time to hand-draw ERDs or transcribe agent topics.
- They *do* want the handoff site to look professional — the customer will forward it to their CIO.
- They have historically "handed off" via a Google Doc, which rots within weeks and is never updated.
- Their manager wants a consistent look across customers (no one-off branding per SE).

Success for Jordan = "I ran one command, wrote narrative for 3–4 hours, and the site is live on a customer-owned Vercel project at `docs.acme.com` before the handoff call."

Every PRD below should be tested against "does this make Jordan's life better, or does it make an edge case better for one SE at the expense of ten?" If unclear, cut the feature.

---

## 6. Gap inventory (at-a-glance list of ~30 missing capabilities)

Organized by theme. Priorities (P0/P1/P2/P3) are my recommendation; debate welcome.

### Integrity (P0)

1. `scripts/preflight.mjs` — ship.
2. `scripts/verify-placeholders.mjs` — ship.
3. `_sections/` library — ship with 7+ sections.
4. `site.config.ts` generation — ship.
5. `<ProductArea>` helper + `__INCLUDE_*__` booleans — ship.
6. Replace ASCII with Mermaid in `architecture.mdx` and `data-model.mdx` — ship.
7. CI that runs scaffold → build → `verify-placeholders` in a matrix of product areas — ship.

### Repo-aware generator (P1)

1. `sfdx-inspector` module reading `force-app/main/default/` into `poc-snapshot.json`.
2. Auto-generated ERD from `*.object-meta.xml` + fields.
3. Apex inventory + test-coverage merge.
4. Flow inventory.
5. Permission Set / PSG audit.
6. Named Credential / External Service / Connected App inventory.
7. Agentforce (agent/topic/action) enumeration.
8. Data Cloud (DLO/DMO/segment) enumeration.
9. `/generate-from-repo` super-command.

### Org-aware enrichment (P2)

1. `sf` live pull option.
2. Agent test run transcript importer.
3. Debug-log / governor-limit importer.
4. Drift detection vs. org.

### Site polish (P1/P2)

1. Marketing landing page (no redirect).
2. Theme system (logo, color, typography, favicon).
3. Co-branding.
4. OG image generation.
5. Screenshot + Loom embed components.
6. Mermaid + Excalidraw diagram components.

### Delivery-grade (P2/P3)

1. Deploy automation (Vercel / Cloudflare / Netlify / static).
2. Access control (preview + password gate + SSO).
3. PDF export.
4. Analytics + feedback.
5. Release notes automation.
6. i18n.
7. Accessibility + print stylesheet.

### Power-user / maintainer QoL (P3)

1. Industry sub-templates.
2. Content linter (Vale + custom).
3. Placeholder lint types.
4. Interactive intake TUI.
5. In-site first-run tour.
6. Opt-in skill telemetry.

The rest of the doc is mini-PRDs for each of these. I'll be more verbose on the ones that matter most.

---

## 7. Mini-PRDs — foundation fixes (P0)

These are "don't ship anything else until these are done." They pay off the credibility debt that `SKILL.md` has accumulated.

### 7.1 Ship the scripts `SKILL.md` already promises

**Problem.** `SKILL.md` repeatedly references `scripts/preflight.mjs` and `scripts/verify-placeholders.mjs`. Neither is on disk. `SKILL.md` even flags this at the top ("the implementing artifacts … are not yet checked in"). Until they land, the documented Phase 0 and the placeholder lint simply don't run, and the agent prose lies to the SE.

**User story.** As an SE invoking `/setup-docs` on a fresh laptop, I want the skill to detect that I have Node 20 (not 22) and tell me exactly how to fix it, *before* I answer any intake questions.

**Scope.**

- `scripts/preflight.mjs`:
  - Checks Node ≥ 22 via `process.versions.node`.
  - Detects package managers in order: `pnpm` → `npm` → `bun`. Exit with clear remediation if none.
  - Checks `git` on PATH via `which git`.
  - Checks network reachability to `https://registry.npmjs.org` with a 3-second timeout.
  - Returns a **structured JSON result** to stdout when called with `--json` so the agent can parse it, and a pretty-printed report to stderr otherwise.
  - Exit code `0` on pass, `2` on fail (distinct from `1` so the agent can distinguish "you had a bug" from "preflight failed; show this message").
- `scripts/verify-placeholders.mjs`:
  - Walks `<target>` recursively (ignoring `node_modules/`, `.next/`, `.source/`, `out/`).
  - Reports any remaining `__[A-Z0-9_]+__` tokens, grouped by file.
  - Maintains an allowlist (e.g. generated code comments in `.source/` artifacts) in a constant at the top of the file.
  - `--json` for programmatic consumption; human-readable by default.
  - Exit `0` clean, `3` if leftovers found.

**Non-goals.**

- Don't turn preflight into a cross-ecosystem language probe (no Python, no Ruby).
- Don't check "is Salesforce CLI installed"; that's handled by the repo-aware generator later.

**Acceptance criteria.**

- Running `node scripts/preflight.mjs --json` on a Node 20 machine returns JSON with `{ ok: false, checks: [...], remediation: "..." }`.
- Running it on Node 22 with pnpm installed returns `{ ok: true, ... }`.
- `node scripts/verify-placeholders.mjs /tmp/dirty-fixture` (a fixture containing `__CUSTOMER_NAME__`) fails with exit 3 and prints the offending file path.
- The agent's Phase 0 prompt in `SKILL.md` calls this script before intake.

**Risks.** Minor — a flaky network check failing an offline SE. Mitigation: allow `--skip-network` and print a warning.

**Effort.** ~1 day combined.

---

### 7.2 Introduce `site.config.ts` as the single source of truth

**Problem.** `SKILL.md` calls `site.config.ts` "the one file that centralizes every knob an SE typically wants to change." Today no such file is generated. Brand, customer, product-area booleans, deploy target, and contact info are sprinkled across `layout.tsx`, `layout.shared.tsx`, MDX headers, and `package.json`.

**User story.** As an SE whose customer renames their POC mid-engagement, I want to edit **one file** and have every page, nav, OG image, and sidebar reflect the change.

**Scope.** Generate `site.config.ts` during scaffold with a strict TypeScript shape:

```ts
// Generated by afd360-poc-docs-skill. You can hand-edit this file.
// Re-running /update-docs resync-config will re-generate it.
import type { SiteConfig } from '@/lib/site-config-types';

export const siteConfig = {
  customer: {
    name: '__CUSTOMER_NAME__',
    slug: '__CUSTOMER_SLUG__',
    logoUrl: null, // put a URL or drop public/customer-logo.png
  },
  poc: {
    name: '__POC_NAME__',
    slug: '__POC_SLUG__',
    productArea: '__PRODUCT_AREA__',
    handoffDate: '__HANDOFF_DATE__',
    engagementWeeks: __ENGAGEMENT_WEEKS__,
  },
  features: {
    includeAgentforce: __INCLUDE_AGENTFORCE__,
    includeDataCloud: __INCLUDE_DATA_CLOUD__,
    includePlatformOnly: __INCLUDE_PLATFORM_ONLY__,
  },
  personas: __PERSONAS_JSON__,        // string[] — pre-split by scaffolder
  integrations: __INTEGRATIONS_JSON__, // string[]
  deploy: {
    primary: '__DEPLOY_TARGET_PRIMARY__',
    targets: __DEPLOY_TARGETS_JSON__,   // string[]
  },
  repo: {
    url: '__REPO_URL__',
    default_branch: 'main',
  },
  se: {
    name: '__SE_NAME__',
    email: '__SE_EMAIL__',
  },
  theme: {
    primaryHex: '__THEME_PRIMARY__',     // default from a palette
    radius: 'md',
  },
  year: __YEAR__,
} as const satisfies SiteConfig;
```

`lib/site-config-types.ts` ships as a static file with the `SiteConfig` type so editors get autocomplete.

**Non-goals.**

- Don't try to be env-var driven. This is a build-time config. For runtime secrets, use Next env vars.
- Don't over-nest. Flat > deep for an artifact SEs will edit by hand.

**Acceptance criteria.**

- `layout.shared.tsx`, `app/layout.tsx`, `app/(home)/page.tsx`, `app/llms-full.txt/route.ts`, and all MDX header metadata pull from `site.config.ts`.
- Changing `siteConfig.customer.name` and re-running `pnpm build` updates every page, the HTML `<title>`, and the OG image.
- `tsc --noEmit` on a freshly scaffolded site succeeds.

**Risks.** MDX can't import TS by default — need `@/` alias resolution in MDX through Fumadocs's `mdx-components.tsx`. Already partially set up; verify the import path works.

**Effort.** ~1–2 days.

---

### 7.3 Ship the `_sections/` library

**Problem.** `SKILL.md` lists seven "available sections" (`security`, `observability`, `rollout-plan`, `faq`, `glossary`, `release-notes`, `runbook`). `README.md` repeats this list. Neither the files nor a `_list-sections` script exists. `/update-docs add-section <slug>` will fail immediately.

**User story.** As an SE who's just realized the customer will ask about SOC 2, I want to run `/update-docs add-section security` and get a well-written skeleton I can fill in in under 30 minutes.

**Scope.** Add `templates/fumadocs-poc/content/docs/_sections/` with one `.mdx` per slug. Each section should:

- Have a frontmatter `title`, `description`, `icon` (Lucide name).
- Ship substantive starter content: tables, callouts, checklists — not just `# TODO`.
- Use `<ProductArea>` where appropriate (e.g. `observability` shows Agentforce transcripts only if `includeAgentforce`).
- Include `TODO(SE):` markers consistent with the rest of the template.

Draft content for each section (one paragraph each to seed the skeleton):

- `**security.mdx`** — Threat model table (asset, risk, mitigation), sharing rules summary pulled from the snapshot, secrets/credential inventory, permset audit link, MFA status, data residency.
- `**observability.mdx`** — Salesforce Event Monitoring enablement, log channels, Agentforce session transcript review cadence, alert thresholds, SLO table.
- `**rollout-plan.mdx**` — Phased rollout (pilot → expand → all), comms plan, training per persona, success metrics, rollback plan.
- `**faq.mdx**` — Customer-facing Q&A with representative questions an admin will ask in week 2.
- `**glossary.mdx**` — Acronym table seeded with common Salesforce + POC-specific terms from the snapshot.
- `**release-notes.mdx**` — "Unreleased" section plus `v0.1.0` stub; see §11.5 for automation.
- `**runbook.mdx**` — Standalone ops runbook for when `handoff.mdx` grows past 300 lines.

Plus new candidates to discuss:

- `**security-questionnaire.mdx**` — answers to the common vendor questionnaires (SIG Lite / CAIQ-lite themes) — customers ask for this all the time.
- `**demo-script.mdx**` — 5-minute and 20-minute demo scripts with screenshots/Looms — helps the customer do their own internal walkthroughs.
- `**cost-model.mdx**` — Flex Credit / Agentforce prompt cost projections (ties to the `sf-flex-estimator` skill).

**Acceptance criteria.**

- `node scripts/scaffold.mjs --list-sections` prints the list.
- `/update-docs add-section security` copies `_sections/security.mdx` to `content/docs/security.mdx`, adds `"security"` to `meta.json`, runs placeholder substitution.
- Re-running the same command twice is a no-op (or prompts to `refresh-starter` if content diverged).

**Effort.** ~2–3 days including writing decent starter content for each.

---

### 7.4 Conditional rendering via `<ProductArea>` and `__INCLUDE_*__` booleans

**Problem.** Several pages have hand-written prose like "Skip this if `__PRODUCT_AREA__` does not include Agentforce." That's a comment, not code. The sections always render. An SE on a Data 360-only POC still has an empty, confusing Agentforce table in their delivered site.

**User story.** As an SE on a Data 360-only POC, I want the scaffolded site to *not* mention Agentforce anywhere unless I opt-in later.

**Scope.**

1. Scaffold derives:
  - `__INCLUDE_AGENTFORCE__` = product area matches `/agentforce/i`
  - `__INCLUDE_DATA_CLOUD__` = product area matches `/data 360|data cloud/i`
  - `__INCLUDE_PLATFORM_ONLY__` = product area === `"Salesforce Platform"`
2. These emit as **literal booleans** in `site.config.ts` (see §7.2). No string-matching in MDX.
3. `components/product-area.tsx`:
  ```tsx
   import { siteConfig } from '@/site.config';
   type Which = 'agentforce' | 'dataCloud' | 'platformOnly';
   export function ProductArea({
     only,
     except,
     children,
   }: {
     only?: Which | Which[];
     except?: Which | Which[];
     children: React.ReactNode;
   }) {
     const feats = siteConfig.features;
     const map = { agentforce: feats.includeAgentforce, dataCloud: feats.includeDataCloud, platformOnly: feats.includePlatformOnly };
     const wants = Array.isArray(only) ? only : only ? [only] : [];
     const hides = Array.isArray(except) ? except : except ? [except] : [];
     if (wants.length && !wants.some(w => map[w])) return null;
     if (hides.length && hides.some(h => map[h])) return null;
     return <>{children}</>;
   }
  ```
4. `mdx-components.tsx` auto-exposes `ProductArea` so MDX doesn't need imports.
5. Existing MDX updated:
  ```mdx
   <ProductArea only="agentforce">
     ## Agentforce inventory
     …
   </ProductArea>
  ```

**Non-goals.**

- Don't try to be a general feature-flag system; scope to product area.
- Don't build a server-gated version; static render is fine.

**Acceptance criteria.**

- Scaffolding a `Data 360`-only POC and running `pnpm build` produces a site with zero references to Agentforce in the HTML.
- The Data 360 mapping table in `data-model.mdx` renders only when `includeDataCloud` is true.
- `troubleshooting.mdx` auto-hides the Agentforce and Data 360 tabs out-of-scope for the chosen product area.

**Effort.** ~0.5 day once `site.config.ts` lands.

---

### 7.5 Replace ASCII diagrams with Mermaid starters

**Problem.** `architecture.mdx` and `data-model.mdx` ship ASCII box-drawings with a `TODO: replace me with a PNG/SVG` note. `SKILL.md` and `reference/content-guide.md` both say "Mermaid diagrams beat image uploads." The template contradicts the doc.

**User story.** As an SE who wants diagrams that diff cleanly in git and re-render when the theme changes, I want the starter to be Mermaid.

**Scope.**

1. Install `fumadocs-mdx` Mermaid integration (Fumadocs ships a Mermaid plugin; verify current version's API). Alternative: ship a thin client component that calls Mermaid on the client.
2. Replace ASCII blocks in `architecture.mdx` and `data-model.mdx` with Mermaid starters:
  ```mdx
   ```mermaid
   flowchart LR
     subgraph Users
       U["__PERSONAS__"]
     end
     U --> SF["Salesforce<br/>__PRODUCT_AREA__"]
     SF --> I["__INTEGRATIONS__"]
  ```
3. For the ERD, ship a starter `erDiagram` block with Account / Contact / Case / Interaction / Agent edges the SE can hand-tune, and a TODO pointing at §8.3 (auto-ERD once the inspector lands).
4. `global.css` adds overrides so Mermaid inherits Fumadocs light/dark colors.

**Non-goals.**

- Don't auto-generate diagrams yet; that's §8.3.
- Don't ship D3 / reactflow; Mermaid is sufficient and low-dep.

**Acceptance criteria.**

- A freshly scaffolded site shows a Mermaid system diagram that references the customer, product area, personas, and integrations.
- Toggling light/dark mode re-renders the diagram in matching colors.

**Effort.** ~0.5 day.

---

### 7.6 Scaffold CI: make the scaffolder itself testable

**Problem.** There is no CI for the skill repo. Every change to `scaffold.mjs` or the template is tested by hand. That's how `_sections/` went missing for a release and nobody caught it.

**User story.** As a maintainer opening a PR that edits `architecture.mdx`, I want a GitHub Actions run that confirms scaffold + build + placeholder-check passes across all product areas.

**Scope.**

- `.github/workflows/scaffold-ci.yml`:
  - Matrix over product areas: `Agentforce`, `Data 360`, `Agentforce + Data 360`, `Salesforce Platform`.
  - Steps: `node scripts/preflight.mjs` → `node scripts/scaffold.mjs --target /tmp/ci-$MATRIX ...` → `pnpm --dir /tmp/ci-$MATRIX install` → `pnpm --dir /tmp/ci-$MATRIX build` → `node scripts/verify-placeholders.mjs /tmp/ci-$MATRIX`.
  - Artifact: upload the built `out/` (static export) so PR reviewers can eyeball screenshots.
- `scripts/test-scaffold.mjs` wraps the above for local dry-runs.
- Optional: Playwright smoke test that loads `/` and `/docs` in the built site.

**Acceptance criteria.**

- Breaking `scaffold.mjs` to miss `__CUSTOMER_NAME__` substitution fails CI in under 4 minutes.
- Deleting a file from `_sections/` fails CI because `--list-sections` drifts.

**Risks.** Matrix builds are minutes. Cache `node_modules` via `pnpm-store` action.

**Effort.** ~1 day.

---

## 8. Mini-PRDs — the repo-aware generator (P1, the "wow" tier)

This is the heart of the user's actual request. Everything else is incremental; this is a category shift.

### 8.1 The `sfdx-inspector` module: reading a local Salesforce repo

**Problem.** Today the SE hand-writes every table. The repo already has the answer — it's in `force-app/main/default/objects/`, `flows/`, `classes/`, `bots/`, etc. We need a module that reads these, normalizes them into a JSON object, and hands that to the site at build time.

**User story.** As Jordan, I want the skill to look at `~/projects/acme-agent-poc/` and produce a `poc-snapshot.json` that I hand the site, so all my inventory tables come pre-filled.

**Scope.**

- New module at `scripts/inspector/`:
  ```
  scripts/inspector/
    index.mjs              # entry: inspect(projectRoot) -> snapshot object
    objects.mjs            # parse *.object-meta.xml and fields/**
    flows.mjs              # parse *.flow-meta.xml
    apex.mjs               # parse *.cls / *.trigger
    permsets.mjs           # parse *.permissionset-meta.xml / *.permissionsetgroup-meta.xml
    named-creds.mjs        # parse *.namedCredential-meta.xml
    external-services.mjs  # parse *.externalServiceRegistration-meta.xml
    connected-apps.mjs     # parse *.connectedApp-meta.xml
    bots.mjs               # parse *.bot-meta.xml + related .genAiFunction / .genAiPlugin / .genAiPromptTemplate
    data-cloud.mjs         # parse Data Cloud metadata (DLOs, DMOs, segments, identity)
    sfdx-project.mjs       # parse sfdx-project.json for package directories
    git.mjs                # parse .git for lastCommit, authors, counts
    util.mjs               # XML parser wrapper, logging, caching
    schema.ts              # TypeScript types for the full snapshot
  ```
- XML parsing via `fast-xml-parser` (already fast, stable, tiny).
- Output shape sketched in [Appendix C](#19-appendix-c--data-contracts-and-json-shapes). Versioned via `snapshot.schemaVersion`.
- CLI: `node scripts/inspector/index.mjs --project ~/projects/acme --out ./poc-snapshot.json`.
- Exits `0` on success, `4` if no `sfdx-project.json` found.
- `--dry` prints the JSON to stdout instead of writing.
- `--redact` removes any literal `email`, `phone`, or field values it found in `customMetadata/` records (paranoia default for customer-shared handoff).

**Design notes.**

- **Metadata discovery walks multiple package directories** from `sfdx-project.json.packageDirectories[*].path`. Don't hardcode `force-app/main/default/`.
- **XML → JSON is lossy if you're not careful.** Keep `description`, `label`, `type`, `fullName`, `protected`, `active` fields. Keep one level of references (e.g. `picklist.values`), but don't try to round-trip everything.
- **Preserve XML ordering via `attributeNamePrefix`** so the output JSON is deterministic — important for caching and diff-friendly snapshots.
- **Support both full SFDX and MDAPI-style projects.** If `src/` exists, fall back to that layout.
- **Git enrichment is optional.** `git log --format="%H %an %ad %s"` over each file is nice-to-have; skip if `git` not on path.
- **Namespaces.** Detect `vlocity_cmt`, `vlocity_ins` prefixes for Industries Common Core and annotate them in the snapshot; downstream components can show a 🏷️ namespace badge.

**Non-goals.**

- Don't try to be a full metadata linter (sf-scanner, CodeAnalyzer exist).
- Don't attempt to *run* flows or compile Apex; static parse only.
- Don't hit the org (that's §9.1).

**Acceptance criteria.**

- Running the inspector on an internal test fixture repo produces deterministic JSON (byte-for-byte equal across two runs).
- Snapshot size for a reasonable POC (~100 files) is under 500 KB.
- TypeScript types in `schema.ts` are imported by site components so MDX has autocomplete for snapshot fields.

**Risks.** Fixture maintenance is ongoing. Mitigation: pin fixtures as submodules or copies under `test/fixtures/`.

**Effort.** ~5–8 days for a solid v1 covering objects / flows / apex / permsets / named creds. Agentforce + Data Cloud add another 3–4 days.

---

### 8.2 Auto-generated Custom Object / Field / Validation Rule pages

**Problem.** `data-model.mdx` has a tedious table of custom objects. Jordan will either leave it as template placeholder (customer sees TODOs) or spend 2 hours transcribing.

**User story.** As Jordan, I want `data-model.mdx` to render a real table of custom objects with fields, just from `poc-snapshot.json`.

**Scope.**

- New MDX component `<CustomObjectsTable />`:
  ```tsx
  // reads snapshot.objects.custom
  // renders: name, apiName, description, fieldCount, hasValidationRules, sharingModel
  // each row expandable to show field list (name, type, required, description)
  ```
- New MDX component `<CustomFieldsTable object="MyObject__c" />` for drilldown.
- New MDX component `<ValidationRulesTable />`.
- Revised `data-model.mdx`:
  ```mdx
  ## Custom objects

  <CustomObjectsTable />

  ## Standard objects with customizations

  <StandardObjectsTable />

  ## Validation rules

  <ValidationRulesTable />
  ```
- Manual override pattern: `<CustomObjectsTable only={['Case__c', 'Interaction__c']} />` or `<CustomObjectsTable rows={[{ ... }]} />` for hand-curated lists.

**Acceptance criteria.**

- For a repo with 5 custom objects and 42 custom fields, the scaffolded site renders them all with correct types and descriptions.
- Removing `data-model.mdx` manual edits and re-running scaffold is a clean no-op (snapshot re-reads, MDX unchanged).

**Effort.** ~2 days including components + styles.

---

### 8.3 Auto-generated ERD (Mermaid) from metadata

**Problem.** ERDs are the #1 thing customers say "we need that in our docs." SEs rarely have time to draw one.

**User story.** As Jordan, I want a Mermaid `erDiagram` to appear in `data-model.mdx` showing all custom objects and their lookup/master-detail relationships, with standard objects included as stubs.

**Scope.**

- `scripts/inspector/` produces `snapshot.relationships[]` — a list of `{ from: "Contact__c", to: "Account", type: "Lookup" | "MasterDetail" }`.
- New MDX component `<ERD />` that:
  - Reads `snapshot.objects` and `snapshot.relationships`.
  - Emits a Mermaid `erDiagram` with correct cardinality.
  - Collapses standard objects to a "Standard" cluster if there are more than N.
  - Accepts an `include` prop to pin specific objects.
- Fallback: if Mermaid is disabled or the diagram is empty, render a graceful "no relationships detected" message.
- Theme: custom CSS to make entity colors match `siteConfig.theme.primaryHex`.

**Non-goals.**

- Don't attempt picklist / RT-level relationships (out of scope).
- Don't render formula-field dependencies (interesting but a different diagram).

**Acceptance criteria.**

- A sample fixture with 6 custom objects generates a 6-node ERD with correct edge labels (`1 --` *, `1 -- 1`).
- The diagram respects light/dark theme.

**Effort.** ~2 days.

---

### 8.4 Apex class + test coverage inventory

**Problem.** Customers routinely ask "what Apex did you write, and is it covered?" Today that's a hand-maintained table.

**User story.** As Jordan, I want Apex classes and triggers listed automatically with their cyclomatic complexity, LoC, and test coverage pulled from the last `sf apex run test` run.

**Scope.**

- Inspector parses `.cls` / `.trigger` for:
  - `fullName`, `apiVersion`, class/trigger type (`global`, `public`, `with sharing`), `description` comment if first line matches `/^\/\*\* \s*([^*]+)\*\//`.
  - LoC (non-blank, non-comment).
  - Test class detection (name ends in `Test` or annotated `@IsTest`).
- Inspector optionally merges coverage JSON from `coverage/coverage.json` if the SE has run `sf apex run test --code-coverage --result-format json --output-dir coverage`.
- New MDX component `<ApexTable kind="classes" />` and `<ApexTable kind="triggers" />`.
- Coverage badge: green ≥ 85%, yellow 75–84%, red < 75%.

**Acceptance criteria.**

- A repo with 12 Apex classes shows all 12 in the table; if coverage file is absent, shows "coverage not imported" with a link to the `sf apex` command.
- Re-running inspector after fixing a test updates the coverage badge on the next build.

**Effort.** ~2 days.

---

### 8.5 Flow inventory table

**Problem.** Customers inherit flows they can't easily audit.

**User story.** As Jordan, I want every flow with its type, trigger, object, and whether it's active listed automatically.

**Scope.**

- Inspector parses `.flow-meta.xml` for:
  - `label`, `processType` (`AutoLaunchedFlow`, `RecordTriggered`, `ScreenFlow`, `ScheduledTriggered`), `triggerType`, `triggerObject`, `status`, `description`.
- New MDX component `<FlowTable />` with optional filters (`kind="record-triggered"`).
- Stretch: a very basic flow graph using `@xyflow/react` showing element types and connections.

**Acceptance criteria.**

- Five flows in a fixture render in the table.
- Inactive flows get a gray badge; active flows green.

**Effort.** ~1.5 days (table). Flow graph is +2 days.

---

### 8.6 Permission Set / Permission Set Group audit

**Problem.** "Who can do what" is a handoff-killer — the customer's SecOps team will ask for a permission matrix and SEs scramble.

**User story.** As Jordan, I want a clean table per permset showing object access, field-level security exceptions, system permissions, and custom permissions, auto-generated.

**Scope.**

- Inspector parses `.permissionset-meta.xml` and `.permissionsetgroup-meta.xml`.
- Derives:
  - Per-object CRUD matrix.
  - FLS exceptions (any field-level denial or grant outside default).
  - System permissions enabled (ApiEnabled, EditTask, etc.).
  - Custom permissions granted.
  - Apex class access.
  - VF page access.
- New MDX components:
  - `<PermsetSummary />` — high-level table: permset name, # objects, # fields, target personas.
  - `<PermsetDetail name="Service_Agent" />` — deep dive page-per-permset (optional; generate as subpages under `content/docs/permissions/<slug>.mdx`).
- Derive `siteConfig.personas` from permset labels if SE didn't supply any — useful default.

**Non-goals.**

- Don't include profile analysis (profiles are deprecated for this kind of work).
- Don't attempt to resolve permset *groups* into a flat set at build time — show hierarchy.

**Acceptance criteria.**

- A fixture with 3 permsets + 1 PSG generates one summary page plus 4 detail pages.
- The SE can link "Customer Service Agent" persona in `handoff.mdx` to the permset detail.

**Effort.** ~3 days.

---

### 8.7 Named Credential / External Service / Connected App inventory

**Problem.** "What external systems does this POC talk to?" is intake field #6. We ask the SE, but it's also literally in the repo.

**User story.** As Jordan, I want integrations auto-discovered from `*.namedCredential-meta.xml` and derived, so I don't have to remember them.

**Scope.**

- Inspector emits `snapshot.integrations`:
  - Named Credentials: name, endpoint, auth protocol.
  - External Services: name, registration, OpenAPI schema path.
  - Connected Apps: name, OAuth scopes, callback URL (non-secret portions only).
- New MDX component `<IntegrationsTable />`.
- **Secret hygiene.** Do not render any `<password>`, `<clientSecret>`, or `<consumerSecret>` values even if present in XML; inspector strips these at parse time.
- Auto-populate `siteConfig.integrations` if the SE didn't provide it (and print a note: "auto-detected — confirm or edit in `site.config.ts`").

**Acceptance criteria.**

- Named Credentials render with endpoint + auth mode visible.
- No secret values present anywhere in `.source/`, `.next/`, or the built `out/`.

**Effort.** ~1.5 days.

---

### 8.8 Agentforce agent / topic / action enumeration

**Problem.** Agentforce metadata is the spider-web of `.bot-meta.xml`, `.bot` bundles, `.genAiFunction-meta.xml`, `.genAiPlugin-meta.xml`, `.genAiPromptTemplate-meta.xml`, and referenced Apex `@InvocableMethod`. Customers get the most value out of understanding the agent, and SEs get the least help describing it.

**User story.** As Jordan on an Agentforce POC, I want `agents-and-flows.mdx` to render every agent, its topics, the classification text, the actions each topic can invoke, and where each action is implemented.

**Scope.**

- Inspector emits `snapshot.agentforce`:
  - `agents[]`: name, type, language, attached topics.
  - `topics[]`: label, classification description, scope, instructions, actions[].
  - `actions[]`: name, kind (`Apex` | `Flow` | `PromptTemplate`), ref (fully-qualified target), inputs/outputs.
  - `promptTemplates[]`: name, type (`SalesEmail`, `FieldGeneration`, `Flex`), variables.
- New MDX components:
  - `<AgentOverview />`
  - `<TopicsTable />`
  - `<ActionsTable />`
  - `<PromptTemplatesTable />`
- Cross-links: clicking an Apex action row deep-links to the Apex table row in data-model.

**Non-goals.**

- Don't try to render Agent Script `.agent` DSL files here; those are a separate flow (see `sf-ai-agentscript` skill).

**Acceptance criteria.**

- For a 1-agent / 4-topic / 12-action POC, all 4 topics and 12 actions render with correct cross-links.
- If `includeAgentforce === false`, none of this renders anywhere.

**Effort.** ~3 days.

---

### 8.9 Data Cloud (Data 360) asset inventory

**Problem.** Data Cloud POCs ship with data streams, DLOs, DMOs, identity resolution, calculated insights, and segments. Zero SEs enjoy documenting this by hand.

**User story.** As Jordan on a Data 360 POC, I want the data-model page to render all DLOs, DMOs, ID resolution rules, and segments automatically.

**Scope.**

- Inspector emits `snapshot.dataCloud`:
  - `dataStreams[]`: name, source, DLO target.
  - `dlos[]`: name, fields, DMO mapping.
  - `dmos[]`: name, source DLOs, primary key.
  - `identityResolutions[]`: ruleset, match rules.
  - `segments[]`: name, target DMO, rule summary.
  - `calculatedInsights[]`: name, SQL or expression, target DMO.
  - `activations[]`: name, activation target.
- New MDX components: `<DataCloudDLOs />`, `<DataCloudDMOs />`, `<IdentityResolutionTable />`, `<SegmentsTable />`, `<CalculatedInsightsTable />`, `<ActivationsTable />`.
- All wrapped in `<ProductArea only="dataCloud">`.

**Non-goals.**

- Don't try to enumerate row counts (that requires hitting the org — §9.1).
- Don't attempt search-index metadata.

**Acceptance criteria.**

- A fixture Data Cloud project renders all section types.
- Toggling `includeDataCloud` hides everything.

**Effort.** ~4 days (Data Cloud metadata is fiddly).

---

### 8.10 The `/generate-from-repo` super-command

**Problem.** Once all the above exists, the SE still has to choose to opt in. We want the simplest possible UX.

**User story.** As Jordan, I want to run `/generate-from-repo` from inside my Salesforce POC repo and get a fully populated docs site without any more thinking.

**Scope.**

- New slash command `/generate-from-repo`.
- New `SKILL.md` section describing the combined workflow:
  1. Detect `sfdx-project.json` in the current directory (or `--project` flag).
  2. Run inspector, write `poc-snapshot.json`.
  3. Derive intake defaults from the snapshot where possible:
    - `customer`: prompt (no way to infer).
    - `poc`: default to snapshot's sfdx project name.
    - `productArea`: derive from presence of Agentforce / Data Cloud metadata.
    - `personas`: derive from permset labels.
    - `integrations`: derive from Named Credentials.
    - `deployTarget`: prompt once (keep as `Vercel` default).
  4. Run `scaffold.mjs` with derived values.
  5. Copy `poc-snapshot.json` into the scaffolded site at `data/poc-snapshot.json`.
  6. Wire `lib/snapshot.ts` to import it.
- The SE confirms the derived values before scaffold; they can edit any.

**Acceptance criteria.**

- `/generate-from-repo` run in a fixture repo completes in under 90 seconds (inspector + scaffold + install + build).
- The resulting site has zero `TODO:` placeholders in tables (every inventory is auto-populated).

**Effort.** ~2 days once the inspector and components are in.

---

## 9. Mini-PRDs — the "org-aware" tier (P2)

Repo-aware gets you 80% there. The remaining 20% is things that only exist in a live org.

### 9.1 Live org pull: using `sf` to enrich or override repo data

**Problem.** Some data isn't in metadata: record counts, actual Data Cloud row counts, governor limit usage, recent deploys, which flows are actually active in *this* org. Without these, the docs describe the *repo* but not the *deployed state*.

**User story.** As Jordan, I want to pass `--org acme-agent-poc` and have the inspector enrich the snapshot with live org data.

**Scope.**

- `scripts/inspector/org.mjs` runs `sf`/`sfdx` shell commands:
  - `sf org display --json` → org identity.
  - `sf data query --query "SELECT COUNT(Id) FROM <CustomObject__c>" --json` → counts for each custom object (concurrent with a small pool).
  - `sf limits api --json` → governor limits snapshot.
  - `sf data query --use-tooling-api --query "SELECT ApexClassOrTriggerId, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate"` → coverage (alternative to local file).
  - Agentforce test results via `sf agent test run`.
- Data Cloud queries via REST (via `sf org open`) to get actual DLO/DMO row counts.
- Gated behind `--org`. Never runs by default.
- Secret hygiene: same rules as §8.7; strip any obvious secrets.

**Non-goals.**

- Don't try to be a monitoring product. One-shot enrichment only.
- Don't store session tokens.

**Acceptance criteria.**

- Snapshot has populated `orgSnapshot: { counts: {...}, limits: {...}, lastDeploy: {...} }` when `--org` is passed.
- A `<OrgStats />` component on `overview` surfaces "as of , 1,234 Cases, 89% Apex coverage."

**Effort.** ~3–5 days.

---

### 9.2 Agent test run transcript importer

**Problem.** `reference/content-guide.md` says "if there are no transcripts, the customer will not trust the agent." SEs have transcripts from `sf agent test run` but they're in awkward CLI output format.

**User story.** As Jordan, I want to run `sf agent test run --output-format json > test-output.json`, then have the skill import representative transcripts into `agents-and-flows.mdx` as `<Tabs>`.

**Scope.**

- New command `/import-transcripts <path-to-json>`.
- Parses the Agentforce test output.
- Picks representative transcripts using heuristics: one success per topic (happy path), one failure (edge case), one escalation (handoff path).
- Emits `<AgentConversation />` MDX that renders the turns nicely.
- Optionally appends a scores table: topic, expected outcome, actual, score.

**Acceptance criteria.**

- Given a fixture `test-output.json`, generates at least 3 transcripts.
- SEs can hand-edit or add their own transcripts.

**Effort.** ~2 days.

---

### 9.3 Debug log / governor limit import

**Problem.** Troubleshooting sections age poorly because SEs forget what actually broke during the build. We can mine `sf apex list log` output.

**User story.** As Jordan, I want to dump the last N debug logs, the skill finds distinct error signatures, and drafts new entries for `troubleshooting.mdx`.

**Scope.**

- Inspector includes a `logs` submodule reading a logs folder or piped-in JSON.
- Dedupes by normalized error signature (strip object IDs, line numbers).
- Generates skeleton accordions matching the template's Symptom/Cause/Fix pattern.
- SE reviews and edits before committing.

**Acceptance criteria.**

- Given 20 debug logs with 4 distinct errors, produces 4 new skeleton entries.

**Effort.** ~2 days.

---

### 9.4 Drift detection: site vs. org

**Problem.** Docs rot. A month after handoff, the customer added fields, changed flows, rotated a Named Credential. The docs silently diverge.

**User story.** As a customer admin running `pnpm run check-drift --org my-sandbox`, I want a report of anything in the org that isn't in the docs.

**Scope.**

- `scripts/check-drift.mjs`:
  - Re-runs the inspector with `--org`.
  - Diffs the new snapshot against `data/poc-snapshot.json`.
  - Emits a markdown report: new/removed/changed objects, fields, flows, agents, named credentials.
  - Exit `0` if no drift, `5` if drift (so CI can fail).
- A GitHub Action workflow `drift-check.yml` (opt-in) that runs weekly.
- Optionally auto-opens a PR with the updated snapshot.

**Acceptance criteria.**

- Adding a field in the org and running the check produces a report that names it.

**Effort.** ~3 days.

---

## 10. Mini-PRDs — site polish and beauty (P1/P2)

### 10.1 Marketing landing page (no more redirect to /docs)

**Problem.** `app/(home)/page.tsx` is a redirect to `/docs`. The first impression on the customer is the docs sidebar, which is fine but not beautiful. A customer who clicks the share link expects a hero: customer name, POC name, SE name, one-line summary, CTAs.

**User story.** As an exec at Acme landing on the docs URL, I want a branded page that tells me what this is and links me to the right section for my role.

**Scope.**

- Replace `app/(home)/page.tsx` with a hero:
  - `<CustomerLogo />` + `<SalesforceLogo />` co-branding (see §10.3).
  - Headline: `__POC_NAME__`.
  - Sub-headline: `Delivered to __CUSTOMER_NAME__ by __SE_NAME__ · __HANDOFF_DATE__`.
  - Role-tailored CTAs: "I'm an exec" → `/docs#business-outcomes`, "I'm an architect" → `/docs/architecture`, "I'm an admin" → `/docs/setup`, "I'm a developer" → `/docs/data-model`.
  - At-a-glance stats row: `<AtAGlance />` pulling from snapshot — e.g. "5 custom objects · 12 Apex classes · 4 flows · 2 Agentforce agents · 7 integrations".
  - Deploy badge: "Deployed to **DEPLOY_TARGET_PRIMARY**".
  - "What we built" carousel: tiled screenshots/Looms for each major capability (see §10.5).
  - Footer: `Source: __REPO_URL__ · Questions: __SE_NAME`__.
- Use Tailwind v4 tokens from `siteConfig.theme`.
- Include a print-friendly mode so it renders nicely in PDF export.

**Non-goals.**

- Don't build a generic marketing site builder. Keep the hero opinionated.

**Acceptance criteria.**

- Scaffolded site home page has the hero populated from intake + snapshot.
- Lighthouse score ≥ 95 on the home page.

**Effort.** ~2 days.

---

### 10.2 Theme system with auto-extracted customer branding

> This section was expanded from the original "set a hex color in `site.config.ts`" scope into a fully-featured **auto-brand-extraction** pipeline. The manual-hex path is still supported and is the fallback when extraction is skipped or fails.

**Problem.** All sites look the same out of the box. Some customers forward the docs URL to their CIO and expect *their* brand, not a generic Fumadocs skin. Manually eyedropping colors, downloading logos, and guessing font stacks is a 1–2 hour chore SEs will skip — so nobody does it.

We can do better: **ask the SE for the customer's public-facing website during intake, and have the skill auto-extract brand signals** (logo, favicon, primary/secondary colors, typography, OG imagery, `theme-color` hint), surface them to the SE for review, and bake the approved pieces into `site.config.ts`. The SE spends 30 seconds confirming; the site looks like the customer's own product.

This is the single highest "wow" per unit of effort in the polish tier. Customers *notice* when their shade of blue shows up in the sidebar and their logo sits next to the Salesforce mark in the nav.

#### User stories

1. **Happy path.** Jordan pastes `https://www.acme.com` during intake; the scaffolded site nav shows Acme's logo, the sidebar-active and link colors use Acme's blue, and the favicon is Acme's — no manual CSS editing.
2. **Review path.** Jordan sees what was extracted (logo, three color swatches, font name, favicon) and approves / tweaks / rejects each before it's committed.
3. **Skip path.** Jordan is on a POC for a stealth JV with no public brand site; the field is empty; the site falls back to a clean default theme with no degraded UX.
4. **Regenerate path.** The customer rebrands mid-engagement (it happens); Jordan runs `/update-docs refresh-brand` and the extractor re-runs against the new URL.
5. **Override path.** Jordan doesn't love the extracted secondary color and sets `siteConfig.theme.secondaryHex` by hand. Re-running extraction does **not** overwrite that override.
6. **Compliance path.** Customer legal asks how brand assets were obtained; `data/brand-snapshot.json` records the source URL, timestamp, and per-asset provenance so we can show a clean audit trail.

#### Concept: `brand-snapshot.json` as a first-class artifact

Mirrors the §8 snapshot pattern. The extractor writes a versioned, reviewable JSON at `data/brand-snapshot.json`. The site renders theme as a pure function of `(defaults ← brand-snapshot.json ← siteConfig.theme overrides)` — the SE's manual edits always win.

#### Intake addition

Add one optional intake field (place it after Product Area or just before SE Name):

- **Prompt:** "Customer's public website? (I'll grab their logo, colors, and fonts. Enter to skip.)"
- **Validation:** if provided, must parse as a URL; auto-prepend `https://` if scheme is missing.
- **Default:** empty (skip extraction).
- **Anti-pattern:** never bounce a bad URL back to the SE — run extraction opportunistically and surface failures in the review step.

Document in `reference/intake.md` as intake field #10.

#### What the extractor pulls

Listed in rough order of reliability. Each asset is stamped with `source`, `confidence` (`0..1`), and `extractedAt`. Anything low-confidence is flagged in the review UX.

| Asset | Primary source | Fallbacks |
|---|---|---|
| Favicon | `<link rel="icon">`, `<link rel="shortcut icon">`, `<link rel="apple-touch-icon">` | `/favicon.ico` |
| Header logo | first `<img>` in `<header>` with `alt`/`title` matching company name; inline `<svg>` in header | topmost image in viewport screenshot |
| OG logo | `<meta property="og:image">`, `<meta name="twitter:image">` | — |
| Theme color | `<meta name="theme-color">` | — |
| Primary color | dominant non-neutral from logo (k-means via `node-vibrant`) | CSS custom properties named `--primary*`, `--brand*`, `--color-primary*` |
| Secondary color | second dominant from logo / hero | `--accent*`, `--secondary*` |
| Neutral palette | CSS custom properties (text/bg/border) | derive from screenshot grays |
| Font (sans) | Google Fonts link in `<head>`; Typekit `<link rel="preconnect">`; computed `font-family` on `<body>` / `<h1>` | system stack |
| Company name | `<meta property="og:site_name">`, `<title>` | `<h1>` |
| Tagline | `<meta property="og:description">`, `<meta name="description">` | — |

#### Extraction pipeline

New module at `scripts/brand-extractor/`:

```
scripts/brand-extractor/
  index.mjs         # CLI + orchestrator
  fetch.mjs         # HTTP(S) fetch with redirect following, UA, timeout
  html.mjs          # tag-level HTML scanner (meta, link, title, img, svg, style)
  css.mjs           # CSS custom-property + @font-face extraction
  color.mjs         # palette + WCAG contrast nudging
  logo.mjs          # logo selection heuristics + normalization
  fonts.mjs         # Google Fonts / Typekit / system detection + neighbor map
  accessibility.mjs # AA / AAA contrast checks
  robots.mjs        # robots.txt compliance
  schema.ts         # BrandSnapshot type
  util.mjs
```

Pipeline stages:

1. **Normalize URL** — add `https://` if missing; follow `<link rel="canonical">` if present.
2. **Robots check** — fetch `robots.txt`; abort cleanly on `Disallow: /` for our UA.
3. **Static fetch** — GET HTML with a clear UA (`afd360-poc-docs-skill/<version> brand-extractor`). 8 s timeout. ≤5 redirects.
4. **JS fallback** — if no candidates found, retry with headless Playwright (Chromium). 15 s cap. Playwright is an **optional** dep; graceful degradation to static-only.
5. **Parse HTML** — extract all candidates for every asset class.
6. **Fetch assets** — download logo(s), favicon(s), OG image. 5 MB per-asset / 20 MB total caps.
7. **Parse CSS** — fetch linked stylesheets (domain-local only); pull `--primary*`, `--brand*`, `--accent*`, `--color-*` custom properties.
8. **Compute palette** — run Vibrant on header logo (preferred) and fall back to screenshot. Confidence scored.
9. **Pick fonts** — Google / Typekit / computed family → normalized family name + provider.
10. **Accessibility nudge** — WCAG AA contrast of primary against white and near-black; if it fails, snap to nearest in-hue color that passes (`ΔE CIEDE2000 ≤ 4`). Record raw + nudged.
11. **Write snapshot** to `data/brand-snapshot.json` + assets to `data/brand-assets/`.
12. **Emit review payload** for the agent.

Caching: `~/.cache/afd360-poc-docs-skill/brand/` keyed by hostname + ETag; 24 h TTL; `--no-cache` bypass.

#### Review UX in the agent

Inline review shown after scaffold but before first dev server start:

```
Brand extracted from https://www.acme.com (confidence shown)

  Logo            ✔ customer-logo.svg     (0.94) [ open ]
  Favicon         ✔ favicon.ico            (0.99)
  Theme color     ✔ #005fb2   (meta theme-color)
  Primary         ✔ #005fb2   (from logo, nudged from #0060b5 for WCAG)
  Secondary       ✔ #00a1e0   (from logo)
  Font (sans)     ✔ 'Salesforce Sans' → Google Fonts fallback 'Inter'
  OG image        ✔ customer-hero.jpg     (0.88)
  Company name    ℹ "Acme Corp"  (matches intake)
  Tagline         ℹ "Better work, everywhere."  (og:description)

  [a]ccept all  [e]dit  [s]kip  [m]anual override
```

`edit` walks the SE through each field with keep/override prompts. `skip` deletes the snapshot and leaves defaults. `manual override` jumps to the hand-edit-`site.config.ts` flow.

#### `site.config.ts` theme schema (extended)

```ts
theme: {
  primaryHex: '#005fb2' | null,       // null → inherit from brand-snapshot
  secondaryHex: '#00a1e0' | null,
  radius: 'sm' | 'md' | 'lg',
  fontSans:
    | 'auto'                           // resolve from brand-snapshot
    | 'Geist' | 'Inter' | 'System'
    | { name: string; googleFont?: boolean },
  fontMono: 'Geist Mono' | 'JetBrains Mono' | 'System',
  brandLogoPath: '/customer-logo.svg' | null,
  brandLogoAlt: 'Acme Corp',
  salesforceLogo: true,                // opt out for strict customer-only branding
  faviconPath: '/favicon.ico',
  ogHeroPath: '/customer-hero.jpg' | null,
  source: {                            // written by scaffolder; read-only for humans
    brandSnapshot: '/data/brand-snapshot.json' | null,
    extractedFrom: 'https://www.acme.com' | null,
    extractedAt: '2026-04-19T18:22:00Z' | null,
  },
},
```

Build-time precedence in `lib/resolve-theme.ts`:

```
defaults  ←  brand-snapshot.json (if present)  ←  siteConfig.theme (non-null fields)
```

#### CSS variable wiring

- `lib/resolve-theme.ts` returns the resolved theme record at build time.
- `app/layout.tsx` injects a `<style>` block on `:root` with `--brand-primary`, `--brand-primary-foreground`, `--brand-secondary`, `--brand-secondary-foreground`, `--brand-radius`, `--font-sans`, `--font-mono`.
- `global.css` maps these onto Fumadocs tokens (`--fd-primary`, `--fd-accent`).
- Mermaid adapter (`components/mermaid.tsx`) picks up `--brand-primary`.
- Dark mode: if the snapshot doesn't include explicit dark variants, derive them via HSL lightness adjustment.

#### Fonts, pragmatically

- On Google Fonts → import via `next/font/google` at build.
- On Typekit/Adobe → **do not** auto-import (licensing). Record the family, fall back to the closest Google Fonts neighbor, and tell the SE in the review: `"Proxima Nova" detected → using "Inter" (closest match). Add your Typekit kit ID to siteConfig.theme.fontSans to use the original.`
- Custom `@font-face` → never auto-host; fall back + note.
- Curated neighbor map: Proxima Nova ≈ Inter, Circular ≈ Nunito Sans, Gotham ≈ Montserrat, Graphik ≈ Inter, Salesforce Sans ≈ Inter.

#### Favicon pipeline

- Take the largest PNG/SVG found.
- `scripts/gen-favicon.mjs` (sharp) produces `favicon.ico`, 16/32/48/192/512 PNGs, `apple-touch-icon.png`, `safari-pinned-tab.svg`.
- If only a low-res `.ico` exists, ship it as-is with a warning.
- Wired via `metadata.icons` in `app/layout.tsx`.

#### Accessibility guardrails

- **AA large-text** (≥3:1) required for primary on light backgrounds.
- **AA body** (≥4.5:1) for foreground-on-background pairs.
- **Nudge rule:** nearest in-hue color within `ΔE CIEDE2000 ≤ 4` that passes; fall back to a safe darker sibling otherwise.
- **Never silent:** all nudges surfaced in review.
- **Dark mode independently checked.**

#### Legal, ethical, safety guardrails

- **robots.txt respected.** `Disallow: /` for our UA → clean skip.
- **Public pages only.** No auth, no form submission, no paywall bypass.
- **Host-locked redirects.** Only follow redirects to the same apex domain; never chase to third-party CDNs except for plainly asset URLs.
- **No cookies persisted.** Single-shot fetch.
- **Strip credentials.** Query-string secrets removed before logging.
- **Snapshot disclaimer.** `brand-snapshot.json` includes: `"Automatically extracted from <url> on <date>. Customer should review trademark usage before external publication."`
- **Opt-out.** `/setup-docs --no-brand-extract` skips entirely.
- **Dep attribution.** README lists extractor deps and licenses.
- **No external upload.** Assets land in the customer's own scaffolded repo; we never send them anywhere.

#### Failure modes matrix

| Scenario | Behavior | SE experience |
|---|---|---|
| 404 / 500 / timeout | skip with `unreachable` | "Couldn't reach acme.com. Using defaults — set colors later in `site.config.ts`." |
| robots disallow | skip with `robots-disallow` | "acme.com's robots.txt disallows automated fetch. Want to set the primary color manually?" |
| SPA with no SSR + no OG | Playwright retry; if empty → `unreachable` | same as unreachable, with note |
| CSS-background logo | Playwright screenshot + crop | lower confidence, clearly flagged |
| Gradient / photo logo | low-confidence palette | review UX shows `0.42`, SE can edit |
| Proprietary font | neighbor substitution | called out in review |
| WCAG fail | nudged primary | raw + nudged both shown |
| Cookie banner covers hero | try ad-blocker heuristic; else static fallback | hero asset may be skipped |
| URL is Salesforce Experience Cloud | extracted brand = Salesforce blue | safe default; SE overrides if boring |
| Customer has no public site | SE skips | no extraction runs |

#### Libraries and trade-offs

| Concern | Pick | Why |
|---|---|---|
| HTML parse | `cheerio` (for v2) — v1 uses built-in regex scanner | avoid dep for initial ship |
| Headless render fallback | `playwright` (Chromium) | better than Puppeteer for Next-15-era SPAs |
| HTTP | `undici` / built-in `fetch` | no extra dep |
| CSS parse | `css-tree` (for v2) — v1 uses regex for custom properties | avoid dep for v1 |
| Color extraction | `node-vibrant` (v2) — v1 uses CSS + `<meta theme-color>` only | v1 ships without image decoding |
| Image processing | `sharp` (v2 favicon pipeline) | v1 passes images through unmodified |
| Color math (ΔE, WCAG) | `culori` (v2) — v1 inlines simple sRGB luminance math | pure math is short |
| Robots | hand-written | 30 lines |
| Google Fonts match | `google-fonts-list` JSON (v2) — v1 detects by URL pattern | |

**v1 ships with zero external dependencies** (Node 22 built-ins only). That's what we're coding below. `node-vibrant`, `sharp`, `culori`, `cheerio`, `playwright` all arrive in v2.

#### `BrandSnapshot` data contract

```ts
interface BrandSnapshot {
  schemaVersion: '1.0.0';
  extractedFrom: string;
  extractedAt: string;
  strategies: Array<'static' | 'playwright' | 'screenshot' | 'manifest'>;
  company: { name?: string; tagline?: string };
  colors: {
    themeColor?: { value: string; source: 'meta:theme-color' };
    primary?:   { value: string; raw?: string; nudged?: boolean; source: string; confidence: number };
    secondary?: { value: string; source: string; confidence: number };
    neutrals?:  Array<{ value: string; source: string }>;
  };
  logo?:   { path: string; format: string; width: number; height: number; hasTransparency: boolean; source: string; confidence: number };
  favicon?: { path: string; generatedSet: string[] };
  og?:     { image?: { path: string; source: string }; hero?: { path: string; source: string } };
  fonts:   { sans?: { family: string; provider: 'google'|'typekit'|'custom'|'system'; neighbor?: string };
             mono?: { family: string; provider: 'google'|'system' } };
  accessibility: {
    primaryAgainstLight: { ratio: number; pass: boolean };
    primaryAgainstDark:  { ratio: number; pass: boolean };
    notes: string[];
  };
  notes: string[];
  disclaimer: string;
}
```

#### CLI surface

```bash
node scripts/brand-extractor/index.mjs \
  --url "https://www.acme.com" \
  --out "./data/brand-snapshot.json" \
  --assets-out "./data/brand-assets" \
  [--no-playwright] \
  [--no-cache] \
  [--timeout-ms 15000] \
  [--dry] \
  [--json]
```

Wrapper for `/update-docs`:

```bash
node scripts/scaffold.mjs --refresh-brand \
  --target "<ABSOLUTE_TARGET_DIR>" \
  --url "https://www.acme.com"
```

Re-runs extraction on an existing scaffolded site. Updates `data/brand-snapshot.json` + `public/` assets; never touches `site.config.ts` (SE overrides preserved).

#### Acceptance criteria

- `node scripts/brand-extractor/index.mjs --url https://www.salesforce.com --dry` produces a `BrandSnapshot` JSON with primary color, logo, favicon, and font family, every field stamped with `source` + `confidence`.
- `/setup-docs` with `Customer website: https://www.acme.com` scaffolds a site whose nav shows the extracted logo, whose sidebar-active and link colors are the extracted primary, and whose favicon is the customer's.
- `/update-docs refresh-brand --url https://www.acme.com` on a site with a manual `primaryHex = '#ff0000'` **does not** overwrite that override; logo and favicon do refresh.
- A URL with `robots.txt: Disallow: /` produces a clean skip with a plain-English message and non-zero exit.
- A site with inaccessible primary (<4.5:1 on white) produces a nudged value + visible note.
- Lighthouse accessibility on a scaffolded site with extracted brand ≥ 95.
- Snapshot + assets total ≤ 5 MB for a typical Fortune 500 brand.
- `siteConfig.theme.salesforceLogo = false` hides the Salesforce mark without hiding the customer logo.
- `/setup-docs --no-brand-extract` skips the feature entirely.

#### Risks and mitigations

| Risk | Mitigation |
|---|---|
| Trademark concerns on customer assets | disclaimer field; assets live only in customer's repo |
| Customer blocks our UA | identifiable UA; skip gracefully; `--user-agent` override |
| Proprietary font licenses | never import Typekit/Adobe; suggest neighbors only |
| Low-confidence color from a rainbow logo | confidence in review; SE can edit pre-commit |
| Playwright heavy | optional dep; degrade to static |
| WCAG nudging changes "vibe" | show raw + nudged in review; `--no-contrast-nudge` |
| Customer rebrands; docs look old | `refresh-brand` one-liner |
| Stale cache | ETag-keyed cache; `--no-cache` |
| Slow sites | 15 s hard cap; parallelize with scaffold I/O |
| Cookie banners obscure screenshots | ad-block heuristic; skip hero on low confidence |

#### Effort

~5–7 SWE-days for a credible **v2** (Playwright + Vibrant + Sharp + Culori + Cheerio). A zero-dep **v1** shippable in ~2 SWE-days — exactly what gets implemented in the skill right now (see `scripts/brand-extractor/`).

---

### 10.3 Co-branding: customer + Salesforce + SE

**Problem.** Customers feel ownership when they see their logo. SEs building ten POC sites for different customers need a way to vary the logo per site without editing React.

**User story.** As Jordan, I want to drop `public/customer-logo.png` and have it show alongside the Salesforce mark on the nav and hero.

**Scope.**

- Template includes a slot `<CustomerLogo />` that reads `siteConfig.customer.logoUrl` or falls back to `public/customer-logo.png` if present.
- A tasteful default when absent: text-only "Acme Corp" in customer's primary color.
- Salesforce logo ships in `public/salesforce-logo.svg` (official SVG) with an opt-out flag.
- Footer shows "Delivered by `__SE_NAME__`, Solutions Engineer, Salesforce" with optional SE photo.

**Acceptance criteria.**

- The nav bar shows `[customer logo] — [POC name] · Salesforce`.

**Effort.** ~1 day.

---

### 10.4 OG image generation per page

**Problem.** When a customer shares a link in Slack, the preview is blank. This is a tiny thing that makes the docs site feel like a product.

**User story.** As anyone pasting a link into Slack / Teams / Notion, I want a rich preview showing customer name, page title, and brand color.

**Scope.**

- Add `app/og/[...slug]/route.tsx` using `next/og` (Satori/Resvg under the hood).
- Renders:
  - Left: customer logo + Salesforce mark.
  - Center: page `title` + short description.
  - Right: subtle abstract shape tinted with `theme.primaryHex`.
  - Footer: `docs.<customer>.com · delivered by <SE>`.
- `metadata.openGraph.images` in every MDX page points to `/og/<slug>`.
- For static export (`output: 'export'`), pre-bake the images at build time.

**Acceptance criteria.**

- Every page has a unique OG preview.
- Static export produces PNGs under `public/og/*.png`.

**Effort.** ~1.5 days.

---

### 10.5 Screenshot & Loom embed components

**Problem.** The `content-guide.md` says "screenshots should be the exception" but also "include a Loom." There's no easy way to do either. SEs either paste a raw `<img>` or drop a YouTube embed, which is ugly.

**User story.** As Jordan, I want `<Screenshot src="..." caption="..." />` and `<Loom id="..." />` components that look consistent.

**Scope.**

- `<Screenshot>`: lightbox on click, responsive sizes, dark/light theme swap (`src`, `srcDark`).
- `<Loom>`: responsive iframe, lazy, with a poster frame option (`posterPath`). Falls back to a link-only on print / PDF.
- `<VideoEmbed>` generic for YouTube / Vimeo.
- Conventions for storing screenshots: `public/screenshots/<section>/<name>.png`.

**Acceptance criteria.**

- Components render with consistent padding, rounded borders, and captions.
- Print mode replaces video with caption + link.

**Effort.** ~1 day.

---

### 10.6 Diagram-as-code components (Mermaid + Excalidraw)

**Problem.** Some diagrams Mermaid can't do well (architecture sketches with whimsical shapes). Excalidraw-as-code is a nice option.

**User story.** As Jordan, I want `<Excalidraw src="./diagram.excalidraw" />` to render a cached SVG and provide an "open in Excalidraw" link.

**Scope.**

- `<Mermaid>` component with copy-to-clipboard, syntax switch, and theme awareness.
- `<Excalidraw>` pre-renders to SVG at build via `excalidraw-export-utils` or similar.
- `<SequenceDiagram>`, `<GanttChart>` are just Mermaid wrappers with type guidance.

**Acceptance criteria.**

- Dropping an `.excalidraw` into `content/` and referencing it renders.

**Effort.** ~2 days.

---

## 11. Mini-PRDs — operations, delivery, and compliance (P2/P3)

### 11.1 Deploy automation (Vercel / Cloudflare / Netlify / static)

**Problem.** "Deploy this" is the last-mile paper cut. `setup.mdx` has terse tabs; there's no actual automation.

**User story.** As Jordan, I want `/setup-docs deploy vercel` to prompt for a Vercel token, set up a project linked to the customer's org, promote a preview, and print the URL.

**Scope.**

- `scripts/deploy/`:
  - `vercel.mjs`: uses the Vercel Marketplace / `vercel` CLI via `npx vercel link` + `vercel deploy --prod`. Handles env vars: `POC_SNAPSHOT_AT_BUILD=true`.
  - `cloudflare.mjs`: uses `wrangler pages deploy`.
  - `netlify.mjs`: uses `netlify deploy --prod`.
  - `static.mjs`: runs `pnpm build` with `output: 'export'`, tars `out/`, uploads nowhere (just produces the artifact for manual upload).
- Per target, a `DEPLOY.md` in the scaffolded site gets populated with target-specific steps (replacing the generic tabs).

**Non-goals.**

- Don't build a deploy CI orchestrator. Use existing platform CLIs.

**Acceptance criteria.**

- `/setup-docs deploy vercel` completes with a preview URL.

**Effort.** ~2–3 days for the three hosted targets.

---

### 11.2 Access control (preview links, password gate, SSO)

**Problem.** Customers often want docs private until go-live. Today the site is public-by-default.

**User story.** As Jordan, I want a config flag that puts the site behind a simple password, or behind the customer's SSO when they have one.

**Scope.**

- `siteConfig.access`:
  ```ts
  access: {
    mode: 'public' | 'password' | 'vercel-preview' | 'sso',
    password?: { envVar: 'DOCS_PASSWORD' },
    sso?: { provider: 'clerk' | 'workos' },
  }
  ```
- Password mode ships a tiny Next.js Middleware protecting everything except `/api/health`.
- Vercel-preview mode sets the project to deployment-protection (preview-only URLs).
- SSO mode wires an adapter — start with Clerk (Vercel Marketplace) because it's quickest.

**Acceptance criteria.**

- `mode: 'password'` with `DOCS_PASSWORD=x` locks the site behind a login form.

**Effort.** ~3 days (mostly SSO plumbing; password + preview are ~0.5 days each).

---

### 11.3 PDF export of the whole site

**Problem.** Some customer teams live in PDFs. Also useful as a point-in-time handoff artifact.

**User story.** As Jordan, I want to run `pnpm run export-pdf` and get `<customer-slug>-<poc-slug>-handoff.pdf` with a TOC.

**Scope.**

- `scripts/export-pdf.mjs`:
  - Starts the built site (or uses `output: 'export'`).
  - Uses Playwright to iterate pages in `meta.json` order and print-to-PDF each.
  - Merges with a cover page (customer logo, POC name, SE name, handoff date) and a TOC via `pdf-lib`.
- Print-specific CSS hides the sidebar, resets link underlines, breaks pages at `h2`.

**Acceptance criteria.**

- Running the command produces a single PDF under 20 MB for a typical site.

**Effort.** ~2 days.

---

### 11.4 Analytics & customer feedback widget

**Problem.** We have no idea if docs are read. Customers have no easy channel to leave feedback.

**User story.** As a docs owner on the customer side, I want to see what pages are read and let readers leave inline feedback.

**Scope.**

- Pluggable analytics: Plausible (default, privacy-friendly), Vercel Web Analytics, PostHog.
- `siteConfig.analytics.provider = 'plausible' | 'vercel' | 'posthog' | null`.
- Feedback widget: simple thumbs up/down + optional comment per page, POSTing to a `feedback` endpoint the customer owns (or GitHub Issues via a PAT).

**Acceptance criteria.**

- Analytics events fire on page view.
- Feedback lands as a GitHub issue in the configured repo.

**Effort.** ~2 days.

---

### 11.5 Changelog / release notes automation

**Problem.** `_sections/release-notes.mdx` is a stub. Nobody maintains release notes manually.

**User story.** As Jordan, I want a git commit with a Conventional-Commits message (`feat: add X`) to be auto-appended to release notes on each merge.

**Scope.**

- Use `changesets` or a smaller bespoke `scripts/changelog.mjs`.
- `pnpm changeset` → writes a markdown fragment; `pnpm release-notes` concatenates fragments into `_sections/release-notes.mdx`.
- Optionally a GitHub Action that updates release notes on merge to `main`.

**Acceptance criteria.**

- Merging three commits generates three entries in the next release.

**Effort.** ~1.5 days (mostly wiring existing tools).

---

### 11.6 Internationalization (i18n)

**Problem.** Global customers sometimes want bilingual docs (English + Japanese, Spanish, French). Fumadocs has i18n; we don't wire it.

**User story.** As Jordan working on an EMEA customer, I want to mark pages as `en` and `fr` and have the switcher work.

**Scope.**

- Enable Fumadocs i18n in `source.config.ts`.
- `content/docs/{en,fr}/**/*.mdx` convention.
- A language switcher in the nav.
- i18n-aware OG images.

**Non-goals.**

- Don't auto-translate (machine translations erode trust).

**Acceptance criteria.**

- A fixture site with `en` and `fr` versions of `index.mdx` switches correctly.

**Effort.** ~2 days.

---

### 11.7 Accessibility & print stylesheet

**Problem.** Fumadocs is good out of the box, but our tables, code blocks, and Mermaid diagrams need review. Also, customers print docs; we should own that experience.

**User story.** As a reader with a screen reader, I want the ERD and flow diagrams to have text alternatives.

**Scope.**

- Every `<ERD>`, `<Mermaid>`, `<AgentOverview>` component exposes an `ariaLabel` and renders an `aria-describedby` table for screen readers below the diagram.
- `@media print` stylesheet: hide sidebar, dark mode off, collapse `<Accordion>`s open, linkify URLs.
- Add `eslint-plugin-jsx-a11y` to the template's ESLint config.

**Acceptance criteria.**

- axe-core CI run shows zero serious violations.
- `Cmd+P` on any page renders a readable page with the TOC.

**Effort.** ~2 days.

---

## 12. Mini-PRDs — power-user and maintainer quality of life (P3)

### 12.1 Industry / vertical sub-templates

**Problem.** Different verticals (CME, Financial Services, Health Cloud, Industries Common Core) have different expected sections. Today everyone gets the same template.

**User story.** As Jordan on a CME customer, I want a vertical-aware template that includes EPC modeling notes, an OmniStudio dependency diagram, and a Flex cards inventory.

**Scope.**

- `templates/fumadocs-poc/` becomes the default; add `templates/fumadocs-cme/`, `templates/fumadocs-fsc/`, etc. Shared bits live in `templates/shared/` and are inlined by the scaffolder.
- `--industry cme` flag.
- Cross-link into the existing `sf-industry-`* skills for deep dives.

**Acceptance criteria.**

- `--industry cme` produces a site with EPC/OmniStudio-specific pages and hides non-CME defaults.

**Effort.** ~4 days per vertical (most of it is editorial).

---

### 12.2 Content quality linter (Vale + custom rules)

**Problem.** SE writing varies wildly. Customers feel the difference.

**User story.** As an SE who wants a spellcheck + style check, I want `pnpm lint:content` to flag "please replace TODO before handoff" and "don't use 'utilize'."

**Scope.**

- Adopt [Vale](https://vale.sh/) with a custom style package `styles/SalesforceSE/`.
- Rules:
  - Banned: "TODO", "TBD", "XXX" — must be resolved before handoff.
  - Discouraged: "utilize", "leverage", "cutting-edge".
  - Required: every MDX has frontmatter `title` and `description`.
  - Required: product names are capitalized correctly (Agentforce, Data Cloud, Salesforce).
- Integrate into pre-commit hook and CI.

**Acceptance criteria.**

- `pnpm lint:content` finds a planted `TODO` in a test fixture.

**Effort.** ~1 day.

---

### 12.3 Placeholder-safety: linting and type guards

**Problem.** Adding a new `__PLACEHOLDER__` to a template file without updating the REPLACEMENTS map means the placeholder leaks to the customer.

**User story.** As a maintainer adding a new template file, I want the build to fail if I leaked a placeholder.

**Scope.**

- `verify-placeholders.mjs` already covers post-scaffold. Add:
  - `scripts/lint-template.mjs`: scans `templates/` for any `__*__` tokens and asserts each one is in `REPLACEMENTS` or an explicit allowlist.
  - TypeScript: `schema.ts` for `poc-snapshot.json` ensures downstream MDX components get compile-time safety.

**Acceptance criteria.**

- Adding a new `__NEW_TOKEN__` to the template without updating the map fails CI.

**Effort.** ~0.5 day.

---

### 12.4 Interactive intake TUI for the manual path

**Problem.** SEs who can't use Cursor (occasional) still want a friendly intake — today the manual path is a long shell command.

**User story.** As an SE on the CLI, I want `npx afd360-poc-docs-skill setup` to walk me through intake interactively.

**Scope.**

- A small CLI (e.g. using `[@clack/prompts](https://www.clack.cc/)`) at `bin/afd360.mjs`.
- Under the hood, calls the same `scaffold.mjs` + inspector + deploy.
- Published to npm.

**Acceptance criteria.**

- `npx afd360-poc-docs-skill setup` works without Cursor.

**Effort.** ~2 days.

---

### 12.5 First-run tour inside the scaffolded site

**Problem.** The SE scaffolds and stares at the site. Where do they edit? Which file controls the logo?

**User story.** As Jordan on `localhost:3000`, I want a floating "Start here" tour that fades away after I complete it.

**Scope.**

- `components/first-run-tour.tsx` checks `localStorage` for a completion flag.
- Tour steps: "edit `site.config.ts` to change the title", "replace `public/customer-logo.png` with your logo", "fill in `handoff.mdx`", "run `pnpm run check-drift`".
- Shown only in dev mode (`process.env.NODE_ENV === 'development'`).

**Acceptance criteria.**

- First `pnpm dev` run shows the tour; subsequent runs don't.

**Effort.** ~1 day.

---

### 12.6 Telemetry about the skill itself (opt-in)

**Problem.** We don't know which sections SEs actually add, which product areas dominate, whether the inspector fails in the field.

**User story.** As a maintainer, I want opt-in, non-PII telemetry to prioritize the next features.

**Scope.**

- Scaffolder prompts on first run: "Send anonymous usage metrics? (y/N)".
- Events: `scaffold_started`, `scaffold_completed{product_area,duration_ms}`, `inspector_failed{reason}`, `add_section_used{slug}`.
- Transport: a tiny endpoint (Vercel function or PostHog) — run by our team.
- Config cached in `~/.config/afd360-poc-docs-skill/config.json`.

**Non-goals.**

- No PII, no customer names, no repo contents.

**Acceptance criteria.**

- Opt-out is honored and persisted.

**Effort.** ~1.5 days.

---

## 13. Cross-cutting concerns

### 13.1 Versioning the skill

- The skill itself needs `package.json` or `skill.json` with a version. `SKILL.md` currently references "Fumadocs 16+" — tie this to a changelog the SE can read before updating.
- When the snapshot schema changes, bump `schemaVersion`. Old snapshots get migrated by `scripts/migrate-snapshot.mjs`.

### 13.2 Licensing & attribution

- The template imports Lucide icons and Geist fonts — both OK under MIT/OFL. Document upstream.
- If we embed the Salesforce logo, confirm brand guidelines (Salesforce Partner brand kit has rules).

### 13.3 Security posture

- Inspector must never surface secrets (`<password>`, `<clientSecret>`, OAuth tokens).
- `site.config.ts` should never accept a secret — if an SE tries, warn loudly and point at env vars.
- Drift detection runs read-only; never mutates org state.

### 13.4 Performance budget

- Scaffold to built-and-serving in under 120 seconds on a modern laptop.
- Built site first-load LCP under 1.5s on fast 3G.
- Snapshot JSON under 1 MB gzipped.

### 13.5 Windows / Linux parity

- The team uses macOS. Make sure preflight, scaffold, and inspector work on Windows (path separators, case sensitivity) and Ubuntu. CI matrix: macOS + Ubuntu + Windows.

### 13.6 Offline / air-gapped customers

- Preflight supports `--skip-network`.
- Optional "offline" mode that caches npm deps in a tarball for air-gapped reproduction.

### 13.7 Update story

- SEs on v1 should be able to upgrade to v2 via `/update-docs upgrade`. That script should:
  - Detect delta in template vs. their tree.
  - Apply safe updates (new components, CSS fixes).
  - Never touch `content/docs/*.mdx` (SE-owned narrative).
  - Regenerate `site.config.ts` after confirmation.

---

## 14. Suggested phased roadmap

Each phase is ~1–3 weeks and delivers a usable milestone.

### Phase 0 — "Pay the credibility tax" (Week 1)

- §7.1 preflight.mjs
- §7.2 site.config.ts
- §7.3 _sections/ library (initial 7)
- §7.4 `<ProductArea>` + *INCLUDE**_ booleans
- §7.5 Mermaid starters
- §7.6 Scaffold CI
- Fix placeholder drift (`__DEPLOY_TARGETS_`_ etc.)

**Exit:** `SKILL.md` and the repo agree. Every documented feature works. Green CI on PRs.

### Phase 1 — "Repo-aware MVP" (Weeks 2–4)

- §8.1 inspector core (objects, fields, apex, flows, permsets, named creds)
- §8.2 `<CustomObjectsTable>`, `<CustomFieldsTable>`
- §8.3 `<ERD>` (Mermaid)
- §8.4 `<ApexTable>`
- §8.5 `<FlowTable>`
- §8.6 `<PermsetSummary>` + `<PermsetDetail>`
- §8.7 `<IntegrationsTable>`
- §8.10 `/generate-from-repo` super-command
- §10.1 marketing landing page

**Exit:** Jordan runs one command on a real POC repo, 90 seconds later a populated site is live on localhost with zero manual table editing.

### Phase 2 — "Agentforce + polish" (Weeks 5–7)

- §8.8 Agentforce enumeration
- §8.9 Data Cloud enumeration
- §10.2 theme system
- §10.3 co-branding
- §10.4 OG image generation
- §10.5 screenshot + Loom components
- §11.1 deploy automation (Vercel first)

**Exit:** Customer gets a branded, deployed URL at `docs.<customer>.com`.

### Phase 3 — "Delivery-grade" (Weeks 8–10)

- §9.1 live org pull
- §9.4 drift detection
- §11.2 access control (password + Vercel preview)
- §11.3 PDF export
- §11.4 analytics + feedback
- §11.5 changelog automation

**Exit:** A fully operational post-sale experience — docs live, gated, monitored, drift-alerted.

### Phase 4 — "Nice-to-haves" (rolling)

- §9.2 transcript importer
- §9.3 debug log importer
- §11.6 i18n
- §12.1 industry sub-templates
- §12.2 content linter
- §12.4 interactive TUI
- §12.5 first-run tour
- §12.6 telemetry

---

## 15. Success metrics

- **Time-to-first-build**: from `/setup-docs` invocation to a browser showing the home page. Target: 90 seconds on a warm cache, 5 minutes cold.
- **Manual-table-rows-written** per handoff site. Target: drop from ~80 rows (today) to fewer than 10 (post-§8.x).
- **Handoff-to-share time**: from `git init` to customer receiving URL. Target: under 30 minutes including branding.
- **6-month doc freshness**: percentage of docs sites that still reflect the org (via drift detection). Target: ≥ 80% of sites have run drift-check within the last 30 days six months in.
- **Customer NPS on handoff docs** (optional feedback widget response). Target: ≥ 50.
- **SE satisfaction** (internal survey). Target: ≥ 8/10 "would use again."

---

## 16. Open questions for the team

1. **Who owns the scaffolded site post-handoff?** If the customer owns it, do we bake in a "cut cord" step that removes our analytics/drift action?
2. **Do we support multiple Salesforce orgs per POC** (e.g., sandbox + production parallel)? If yes, the snapshot needs to be a list and the UI needs an org switcher.
3. **How opinionated about branding?** Some SE managers want uniform look ("Salesforce blue only"); some want customer-first branding. Should `siteConfig.theme.primaryHex` default to Salesforce blue (`#005fb2`) or auto-derive from the customer logo?
4. **Do we publish the template to npm** as `create-afd360-poc-docs`? This would make `npx create-afd360-poc-docs` a viable install path outside Cursor.
5. **Legal review for Salesforce logo and Mermaid license.** Who signs off on the `public/salesforce-logo.svg` shipped with the skill?
6. **Where do we host the docs about the skill itself?** Should this very repo be a Fumadocs site dogfooding the skill?
7. **How do we handle multi-tenant SE teams?** A team might have 20 SEs, 80 POCs per quarter. Do we build a roll-up dashboard of all docs sites? (Probably not in-scope but worth deciding "no, that's another product.")
8. **Agentforce Script `.agent` DSL support.** §8.8 covers Builder-managed metadata. The script-based agents are a different beast (`sf-ai-agentscript` skill). Do we enumerate both, or punt and link out?
9. **Data Cloud's YAML vs. metadata.** Some Data Cloud assets are YAML (`apply_grid`), some are metadata. §8.9 assumes metadata. Should we also read YAML?
10. **CI cost.** If every product-area matrix runs `pnpm install`, GH Actions minutes add up. Should we pre-bake a Docker image with deps?

---

## 17. Appendix A — File-by-file inventory and verdict

(Based on a walk of the current repo at time of writing.)


| Path                                                       | State                                                    | Verdict                                                                                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SKILL.md`                                                 | good but aspirational in parts                           | Fix the "Status" block once P0 ships.                                                                                                                                 |
| `README.md`                                                | good                                                     | Update after §8 lands (sell the repo-aware story).                                                                                                                    |
| `LICENSE`                                                  | MIT                                                      | fine.                                                                                                                                                                 |
| `install.sh`                                               | symlinks into `~/.cursor/skills/`                        | fine; add `--force` handling.                                                                                                                                         |
| `commands/setup-docs.md`                                   | contradicts `SKILL.md` intake order                      | reconcile; make `SKILL.md` authoritative.                                                                                                                             |
| `commands/update-docs.md`                                  | good                                                     | add `upgrade`, `add-section --list`, etc.                                                                                                                             |
| `scripts/scaffold.mjs`                                     | works; singular `--deploy-target`                        | extend with `--deploy-targets`, list-sections, add-section, refresh-starter, resync-config.                                                                           |
| `scripts/preflight.mjs`                                    | **missing**                                              | ship per §7.1.                                                                                                                                                        |
| `scripts/verify-placeholders.mjs`                          | **missing**                                              | ship per §7.1.                                                                                                                                                        |
| `scripts/inspector/`                                       | **missing**                                              | ship per §8.1.                                                                                                                                                        |
| `reference/intake.md`                                      | strong                                                   | update when `site.config.ts` lands.                                                                                                                                   |
| `reference/content-guide.md`                               | strong                                                   | update when auto-generation lands (shift to "what narrative goes where").                                                                                             |
| `reference/handoff-checklist.md`                           | strong                                                   | add "drift-check scheduled" row after §9.4.                                                                                                                           |
| `templates/fumadocs-poc/package.json`                      | engines mismatch (Node ≥20 vs. SKILL says 22)            | bump to `>=22`.                                                                                                                                                       |
| `templates/fumadocs-poc/app/layout.tsx`                    | fine                                                     | read from `siteConfig`.                                                                                                                                               |
| `templates/fumadocs-poc/app/(home)/page.tsx`               | redirect only                                            | replace with landing hero per §10.1.                                                                                                                                  |
| `templates/fumadocs-poc/app/(home)/layout.tsx`             | fine                                                     | no change.                                                                                                                                                            |
| `templates/fumadocs-poc/app/docs/layout.tsx`               | fine                                                     | no change.                                                                                                                                                            |
| `templates/fumadocs-poc/app/docs/[[...slug]]/page.tsx`     | fine                                                     | add OG metadata.                                                                                                                                                      |
| `templates/fumadocs-poc/app/api/search/route.ts`           | fine                                                     | verify Orama is warming correctly on build.                                                                                                                           |
| `templates/fumadocs-poc/app/llms-full.txt/route.ts`        | exists                                                   | verify it pulls from all pages including `_sections/`.                                                                                                                |
| `templates/fumadocs-poc/lib/source.ts`                     | fine                                                     | no change.                                                                                                                                                            |
| `templates/fumadocs-poc/lib/layout.shared.tsx`             | hardcoded placeholder nav                                | read from `siteConfig`.                                                                                                                                               |
| `templates/fumadocs-poc/mdx-components.tsx`                | needs to expose `<ProductArea>` and inventory components | extend.                                                                                                                                                               |
| `templates/fumadocs-poc/components/search-dialog.tsx`      | fine                                                     | theme polish.                                                                                                                                                         |
| `templates/fumadocs-poc/content/docs/index.mdx`            | fine text                                                | add `<AtAGlance />` driven by snapshot.                                                                                                                               |
| `templates/fumadocs-poc/content/docs/architecture.mdx`     | ASCII diagram                                            | replace with Mermaid + `<ERD>` stub.                                                                                                                                  |
| `templates/fumadocs-poc/content/docs/setup.mdx`            | tabs for Vercel/Heroku/Static                            | regenerate tabs from `siteConfig.deploy.targets`.                                                                                                                     |
| `templates/fumadocs-poc/content/docs/data-model.mdx`       | ASCII ERD + TODO tables                                  | replace with `<ERD>`, `<CustomObjectsTable>`, `<CustomFieldsTable>`, `<ValidationRulesTable>`.                                                                        |
| `templates/fumadocs-poc/content/docs/agents-and-flows.mdx` | TODO tables                                              | wrap in `<ProductArea only="agentforce">`, replace with `<AgentOverview>`, `<TopicsTable>`, `<ActionsTable>`, `<PromptTemplatesTable>`, `<FlowTable>`, `<ApexTable>`. |
| `templates/fumadocs-poc/content/docs/handoff.mdx`          | solid                                                    | auto-seed integrations + permset rows from snapshot.                                                                                                                  |
| `templates/fumadocs-poc/content/docs/troubleshooting.mdx`  | solid skeleton                                           | hide per-product-area tabs conditionally.                                                                                                                             |
| `templates/fumadocs-poc/content/docs/meta.json`            | hardcoded page list                                      | generate from disk at build.                                                                                                                                          |
| `templates/fumadocs-poc/content/docs/_sections/`*          | **missing**                                              | ship per §7.3.                                                                                                                                                        |
| `templates/fumadocs-poc/public/`                           | empty                                                    | add `logo.png` placeholder, `customer-logo.png` slot, `salesforce-logo.svg`, favicon set.                                                                             |
| `templates/fumadocs-poc/eslint.config.mjs`                 | exists                                                   | add `jsx-a11y`.                                                                                                                                                       |
| `templates/fumadocs-poc/source.config.ts`                  | exists                                                   | verify Mermaid + i18n configs are in scope when enabled.                                                                                                              |
| `templates/fumadocs-poc/tsconfig.json`                     | exists                                                   | confirm path aliases include `@/site.config`.                                                                                                                         |
| `.github/workflows/`*                                      | **missing**                                              | ship per §7.6.                                                                                                                                                        |
| `bin/afd360.mjs`                                           | **missing**                                              | ship per §12.4.                                                                                                                                                       |


---

## 18. Appendix B — Proposed final directory layout

```
afd360-poc-docs-skill/
├── SKILL.md
├── README.md
├── DEEP_DIVE.md                        # this document
├── CHANGELOG.md
├── LICENSE
├── install.sh
├── package.json                        # skill itself becomes an npm package (for `npx`)
├── bin/
│   └── afd360.mjs                      # interactive TUI (§12.4)
├── commands/
│   ├── setup-docs.md
│   ├── update-docs.md
│   ├── generate-from-repo.md           # §8.10
│   ├── import-transcripts.md           # §9.2
│   └── check-drift.md                  # §9.4
├── scripts/
│   ├── preflight.mjs                   # §7.1
│   ├── scaffold.mjs                    # existing, extended
│   ├── verify-placeholders.mjs         # §7.1
│   ├── lint-template.mjs               # §12.3
│   ├── test-scaffold.mjs               # §7.6
│   ├── changelog.mjs                   # §11.5
│   ├── gen-favicon.mjs                 # §10.2
│   ├── export-pdf.mjs                  # §11.3
│   ├── check-drift.mjs                 # §9.4
│   ├── migrate-snapshot.mjs            # §13.1
│   ├── deploy/
│   │   ├── vercel.mjs
│   │   ├── cloudflare.mjs
│   │   ├── netlify.mjs
│   │   └── static.mjs
│   └── inspector/                      # §8.1
│       ├── index.mjs
│       ├── schema.ts
│       ├── objects.mjs
│       ├── flows.mjs
│       ├── apex.mjs
│       ├── permsets.mjs
│       ├── named-creds.mjs
│       ├── external-services.mjs
│       ├── connected-apps.mjs
│       ├── bots.mjs
│       ├── data-cloud.mjs
│       ├── org.mjs                     # §9.1
│       ├── logs.mjs                    # §9.3
│       └── util.mjs
├── reference/
│   ├── intake.md
│   ├── content-guide.md
│   └── handoff-checklist.md
├── templates/
│   ├── shared/                         # components reused across industries
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── public/
│   ├── fumadocs-poc/                   # default
│   │   ├── site.config.ts              # §7.2
│   │   ├── lib/
│   │   │   ├── site-config-types.ts    # strict SiteConfig type
│   │   │   └── snapshot.ts             # reads data/poc-snapshot.json
│   │   ├── data/
│   │   │   └── poc-snapshot.json       # dropped by scaffolder
│   │   ├── components/
│   │   │   ├── product-area.tsx        # §7.4
│   │   │   ├── custom-objects-table.tsx
│   │   │   ├── custom-fields-table.tsx
│   │   │   ├── erd.tsx
│   │   │   ├── apex-table.tsx
│   │   │   ├── flow-table.tsx
│   │   │   ├── permset-summary.tsx
│   │   │   ├── permset-detail.tsx
│   │   │   ├── integrations-table.tsx
│   │   │   ├── agent-overview.tsx
│   │   │   ├── topics-table.tsx
│   │   │   ├── actions-table.tsx
│   │   │   ├── prompt-templates-table.tsx
│   │   │   ├── data-cloud-dlos.tsx
│   │   │   ├── data-cloud-dmos.tsx
│   │   │   ├── identity-resolution-table.tsx
│   │   │   ├── segments-table.tsx
│   │   │   ├── activations-table.tsx
│   │   │   ├── at-a-glance.tsx
│   │   │   ├── screenshot.tsx
│   │   │   ├── loom.tsx
│   │   │   ├── first-run-tour.tsx      # §12.5
│   │   │   ├── feedback-widget.tsx     # §11.4
│   │   │   └── agent-conversation.tsx  # §9.2
│   │   ├── app/
│   │   │   ├── (home)/page.tsx         # §10.1 landing
│   │   │   ├── og/[[...slug]]/route.tsx # §10.4
│   │   │   └── ... (existing)
│   │   ├── content/
│   │   │   └── docs/
│   │   │       ├── _sections/          # §7.3
│   │   │       │   ├── security.mdx
│   │   │       │   ├── observability.mdx
│   │   │       │   ├── rollout-plan.mdx
│   │   │       │   ├── faq.mdx
│   │   │       │   ├── glossary.mdx
│   │   │       │   ├── release-notes.mdx
│   │   │       │   ├── runbook.mdx
│   │   │       │   ├── security-questionnaire.mdx
│   │   │       │   ├── demo-script.mdx
│   │   │       │   └── cost-model.mdx
│   │   │       └── ... (existing)
│   │   └── public/
│   │       ├── logo.png                # placeholder
│   │       ├── customer-logo.png       # slot; optional
│   │       └── salesforce-logo.svg
│   ├── fumadocs-cme/                   # §12.1
│   ├── fumadocs-fsc/
│   └── fumadocs-industries/
├── test/
│   ├── fixtures/
│   │   ├── minimal-sfdx/
│   │   ├── agentforce-poc/
│   │   ├── data-cloud-poc/
│   │   └── cme-poc/
│   └── golden/
│       └── *.snapshot.json
└── .github/
    └── workflows/
        ├── scaffold-ci.yml             # §7.6
        └── drift-check.yml             # §9.4
```

---

## 19. Appendix C — Data contracts and JSON shapes

### 19.1 `poc-snapshot.json` — top-level shape

```jsonc
{
  "schemaVersion": "1.0.0",
  "generatedAt": "2026-04-19T18:22:00Z",
  "project": {
    "name": "acme-agent-poc",
    "sfdxProjectPath": "/Users/jordan/projects/acme-agent-poc",
    "packageDirectories": ["force-app"],
    "namespace": null
  },
  "git": {
    "head": "abc1234",
    "branch": "main",
    "authors": ["jordan@salesforce.com"],
    "commitCount": 87,
    "firstCommit": "2026-03-10T10:00:00Z",
    "lastCommit": "2026-04-18T22:33:00Z"
  },
  "objects": {
    "custom": [ /* CustomObject[] */ ],
    "standard": [ /* StandardObjectRef[] */ ]
  },
  "relationships": [ /* Relationship[] */ ],
  "flows": [ /* Flow[] */ ],
  "apex": {
    "classes": [ /* ApexClass[] */ ],
    "triggers": [ /* ApexTrigger[] */ ],
    "coverage": { "byClass": { "MyClass": 0.87 }, "overall": 0.82 }
  },
  "permissions": {
    "permsets": [ /* PermSet[] */ ],
    "permsetGroups": [ /* PermSetGroup[] */ ]
  },
  "integrations": {
    "namedCredentials": [ /* NamedCredential[] */ ],
    "externalServices": [ /* ExternalService[] */ ],
    "connectedApps": [ /* ConnectedApp[] */ ]
  },
  "agentforce": {
    "agents": [ /* Agent[] */ ],
    "topics": [ /* Topic[] */ ],
    "actions": [ /* Action[] */ ],
    "promptTemplates": [ /* PromptTemplate[] */ ]
  },
  "dataCloud": {
    "dataStreams": [],
    "dlos": [],
    "dmos": [],
    "identityResolutions": [],
    "segments": [],
    "calculatedInsights": [],
    "activations": []
  },
  "orgSnapshot": null
}
```

### 19.2 `CustomObject` sample shape

```ts
interface CustomObject {
  apiName: string;              // "Acme_Interaction__c"
  label: string;
  description?: string;
  sharingModel: 'Private' | 'Read' | 'ReadWrite' | 'ControlledByParent' | 'FullAccess';
  fields: CustomField[];
  validationRules: ValidationRule[];
  recordTypes: RecordType[];
  hasTrigger: boolean;
  namespace?: string;
}

interface CustomField {
  apiName: string;
  label: string;
  type: 'Checkbox' | 'Text' | 'Number' | 'Date' | 'DateTime'
      | 'Picklist' | 'MultiselectPicklist' | 'Lookup' | 'MasterDetail'
      | 'Formula' | 'Reference' | 'TextArea' | /* ... */;
  required: boolean;
  description?: string;
  inlineHelp?: string;
  referenceTo?: string;         // present when type is Lookup / MasterDetail
  picklistValues?: string[];
  formula?: string;
}
```

### 19.3 `Agent`, `Topic`, `Action`

```ts
interface Agent {
  apiName: string;
  label: string;
  type: 'Employee' | 'Service' | 'Sales' | 'Custom';
  language: string;
  topics: string[];             // api names
}

interface Topic {
  apiName: string;
  label: string;
  classificationDescription: string;
  scope: string;
  instructions: string;
  actions: string[];            // api names
}

interface Action {
  apiName: string;
  label: string;
  kind: 'Apex' | 'Flow' | 'PromptTemplate' | 'Standard';
  ref: string;                  // e.g. "classes/MyService.cls#runThing"
  inputs: { name: string; type: string; description?: string }[];
  outputs: { name: string; type: string; description?: string }[];
}
```

### 19.4 Versioning and compatibility

- `schemaVersion` follows semver. Minor bumps are backward-compatible (new fields only).
- Components check `snapshot.schemaVersion` and render a warning banner if major is ahead of what they were built for.
- `scripts/migrate-snapshot.mjs` fills in missing fields with sensible defaults when upgrading a site to a newer skill.

---

## Closing

`afd360-poc-docs-skill` is a great starting point. Its bones — Fumadocs 16, Tailwind v4, TypeScript strict, thoughtful reference docs — are right. The editorial guidance in `reference/` is already better than most doc systems ship after three years.

But today it's a template with placeholders, not the tool we implicitly promised. Two investments change that:

1. **Pay the credibility tax** (Phase 0): ship everything `SKILL.md` claims. ~1–2 weeks.
2. **Build the repo-aware generator** (Phase 1): turn "point at a repo → get a site" into a 90-second command. ~3 weeks.

After those two, the skill becomes something the team will actively market inside the SE org, and that customers will notice as a qualitative step up from whatever doc handoff they got last year.

Everything else in this document — landing page, OG images, PDF export, drift detection, i18n, industry sub-templates — compounds on top of that foundation.

Ship Phase 0 next week. Hand this document to whoever picks up Phase 1 as the brief. See you at the handoff meeting.