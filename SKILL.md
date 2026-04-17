---
name: afd360-poc-docs-skill
description: Scaffolds a tailored Fumadocs documentation site for a Salesforce Solutions Engineer delivering a post-sale Agentforce, Salesforce, or Data 360 Proof-of-Concept. Use when the user runs /setup-docs, /update-docs, asks to "spin up customer docs", "create POC docs site", "scaffold Fumadocs for a customer", or "add a section to my POC docs". Generates a Next.js + Fumadocs site with sections for Overview, Architecture, Setup, Data Model, Agents & Flows, Handoff, and Troubleshooting, pre-populated with customer and POC details, and supports incremental updates to existing scaffolded sites.
---

# afd360-poc-docs-skill — Customer POC Documentation Site

Scaffolds a production-ready [Fumadocs](https://fumadocs.dev) site tailored for an SE handing off a Salesforce / Agentforce / Data 360 Proof-of-Concept to a customer. Also supports incremental updates to an already-scaffolded site.

## What it produces

A Next.js + Fumadocs site at a directory the SE chooses, with:

- Opinionated sidebar structure tuned for a POC handoff
- Pages pre-filled with customer + POC context and **starter content** (real tables, ASCII system/ERD sketches, example callouts) the SE can edit in place. Mermaid is intentionally **not** used in starter content because Fumadocs ships without a Mermaid renderer — SEs should drop a PNG/SVG into `public/` if they want a richer diagram.
- A single `site.config.ts` file that centralizes every knob an SE typically wants to change (title, colors, personas, integrations, repo URL)
- Static client-side search (Orama), `llms-full.txt`, OG image route
- Tailwind v4, TypeScript strict, works with `pnpm` (preferred), `npm`, or `bun`

The template tracks **Fumadocs 16+** and requires **Node 22+**. The template's `package.json` is the source of truth for versions — do not hardcode versions anywhere in this skill's prose.

> **Status:** The specification in this file is stable, but the implementing artifacts (`scripts/preflight.mjs`, `scripts/scaffold.mjs`, `scripts/verify-placeholders.mjs`, and `templates/fumadocs-poc/`) are not yet checked in. Until they land, `/setup-docs` and `/update-docs` will fail at Phase 0. Build order: template → scaffold.mjs → verify-placeholders.mjs → preflight.mjs.

## Invocation

Triggered by:

- `/setup-docs` — scaffold a new site (default)
- `/update-docs` — add or update sections in an existing scaffolded site
- Natural phrases: "spin up customer docs", "scaffold POC docs", "create docs site for \<customer\>", "add a \<section\> page to my POC docs"

## Workflow

Follow these phases **in order**. Phase 0 is non-negotiable — it catches 90% of "why didn't it work" issues before the SE has invested any time.

### Phase 0 — Preflight (always run first)

Run `scripts/preflight.mjs`. It checks, in order:

1. Node version ≥ 22 (Fumadocs 16 minimum)
2. A package manager is available (`pnpm` preferred, `npm` fallback, `bun` acceptable)
3. `git` is on PATH (needed for Phase 4's `git init`)
4. Network reachability to the npm registry (`https://registry.npmjs.org`)

If anything fails, **stop and print the exact install command** for the SE's platform. Do not proceed to intake. Example output:

```
✗ Node 20.11.0 detected. Fumadocs 16 requires Node 22+.
  Install via: brew install node@22   (macOS)
               nvm install 22          (any platform with nvm)
```

### Phase 1 — Intake

**Required fields (4):**

1. **Customer name** — e.g. "Acme Corp"
2. **POC name** — e.g. "Service Cloud Agent POC"
3. **Product area** — one of: `Agentforce`, `Data 360`, `Agentforce + Data 360`, `Salesforce Platform`
4. **Target directory** — absolute path. Default: `~/Documents/cursor_orgs/<customer-slug>-docs`

**Optional fields (fill in after scaffold by editing `site.config.ts`):**

5. Primary personas — defaults to `Admin, End User`
6. Key integrations — defaults to `None`
7. Deploy target — defaults to `Not decided`
8. Repo URL — defaults to empty
9. SE name — defaults to the OS user (`os.userInfo().username`)

Ask for the 4 required fields one at a time. **Do not ask optional fields unless the SE volunteers them.** At the end, offer: "I've got what I need. Want to set personas / integrations / deploy target / repo / your name now, or fill those in later via `site.config.ts`?"

Derive slugs from names: lowercase, hyphenate, strip punctuation. Confirm all values back in one compact summary before scaffolding.

Speak directly to the SE in second person. Keep the tone conversational.

#### Intake anti-duplication rules

- Ask only for the next unanswered required field.
- Never repeat the same prompt text after the user answers.
- Never restate the user's previous answer in the same message as the next question.
- If a field is already known from context (e.g., SE mentioned "Acme" in their first message), skip it and confirm it in the summary.
- Keep acknowledgments short: "Got it." Then ask the next question.
- If the current tool interface supports single-question prompts (like `AskQuestion`), submit one at a time — never a multi-field form.
- Do not echo the full summary until every required field is collected.

### Phase 2 — Scaffold

Call the Node scaffold script. Never re-implement copy/substitute logic inline.

```bash
node "<skill-dir>/scripts/scaffold.mjs" \
  --target "<ABSOLUTE_TARGET_DIR>" \
  --customer "<CUSTOMER_NAME>" \
  --customer-slug "<CUSTOMER_SLUG>" \
  --poc "<POC_NAME>" \
  --poc-slug "<POC_SLUG>" \
  --product-area "<PRODUCT_AREA>" \
  --personas "<PERSONAS_OR_DEFAULT>" \
  --integrations "<INTEGRATIONS_OR_DEFAULT>" \
  --deploy-targets "<COMMA_SEPARATED_DEPLOY_TARGETS_OR_DEFAULT>" \
  --repo-url "<REPO_URL_OR_EMPTY>" \
  --se-name "<SE_NAME_OR_OS_USER>"
```

Resolve `<skill-dir>` from the absolute path of this `SKILL.md` file.

The scaffold script handles: directory creation, recursive copy, placeholder replacement across all text files, `.gitignore` generation, `site.config.ts` generation, and idempotent re-runs. It also derives `__DEPLOY_TARGET_PRIMARY__` (first item in `--deploy-targets`) and the `__INCLUDE_*__` booleans from `--product-area` before substitution.

**After the script returns, run `scripts/verify-placeholders.mjs <target>`.** It scans the target for any leftover `__*__` tokens. If any remain, fail loudly — this means a template file was added without updating the REPLACEMENTS map.

### Phase 3 — Install & smoke test

1. `cd` to the target directory.
2. Ask once: "Install dependencies now? (recommended) [Y/n]". If yes, run `pnpm install` (or `npm install` / `bun install` based on what preflight found).
3. **Run `pnpm build` as a smoke test.** If build fails, print the first error and a note: "This is likely a template bug, not your fault. Please report to \<your team's skill maintainer\> with this error."
4. Start `pnpm dev` in the background and confirm `http://localhost:3000` responds.
5. Print a short summary: target path, dev URL, the 3 files the SE will edit first (`site.config.ts`, `content/docs/index.mdx`, `content/docs/architecture.mdx`), and suggested `git init` steps.

### Phase 4 — Next steps

End with a checklist the SE can hand to the customer:

- Where to edit each section (link `content/docs/*.mdx` paths)
- How to add new pages (update `meta.json`, drop `.mdx`)
- How to tune theme/title/personas (edit `site.config.ts` — one file, not ten)
- How to swap the logo (`public/logo.png`)
- How to deploy to the chosen target (or `/setup-docs deploy` in a future version)
- How to invoke `/update-docs` later to add sections

## `/update-docs` — incremental updates

Invoked when the SE already has a scaffolded site and wants to add or refresh a section.

**Required fields (2):**

1. Target directory (absolute path to existing scaffolded site)
2. Action — one of:
   - `add-section <slug>` — drop a new `.mdx` from the section library and update `meta.json`
   - `refresh-starter <slug>` — re-copy the starter content into an existing section (destructive; warns before overwrite)
   - `resync-config` — regenerate `site.config.ts` from intake (interactive)

The section library lives at `templates/fumadocs-poc/content/docs/_sections/`. `/update-docs` copies a single file, runs placeholder substitution, and appends the slug to `meta.json`. It does **not** touch unrelated files.

**Available sections** (canonical list — keep in sync with the library on disk):

| Slug | Purpose |
|------|---------|
| `security` | Threat model, sharing rules, secrets handling, perm audit |
| `observability` | Logging, monitoring, alerting, agent transcript review |
| `rollout-plan` | Phased rollout, comms plan, training, success metrics |
| `faq` | Customer-facing frequently asked questions |
| `glossary` | Acronyms and terms specific to this POC |
| `release-notes` | Ongoing change log post-handoff |
| `runbook` | Standalone operational runbook (when `handoff.mdx` gets too long) |

To discover what's actually on disk at runtime, run `node scripts/scaffold.mjs --list-sections`. The table above is authoritative for the skill's prose; the script is authoritative for the filesystem. If they disagree, update whichever is wrong.

## Placeholder contract

All template files contain these literal, uppercase, double-underscored tokens. `scripts/scaffold.mjs` replaces them everywhere.

| Token | Source | Default if missing |
|-------|--------|--------------------|
| `__CUSTOMER_NAME__` | Customer display name | *(required)* |
| `__CUSTOMER_SLUG__` | Lowercased, hyphenated customer name | *(derived)* |
| `__POC_NAME__` | POC display name | *(required)* |
| `__POC_SLUG__` | Lowercased, hyphenated POC name | *(derived)* |
| `__PRODUCT_AREA__` | Product area string | *(required)* |
| `__INCLUDE_DATA_CLOUD__` | `true` if `__PRODUCT_AREA__` contains `Data 360`, else `false` | *(derived)* |
| `__INCLUDE_AGENTFORCE__` | `true` if `__PRODUCT_AREA__` contains `Agentforce`, else `false` | *(derived)* |
| `__DEPLOY_TARGET_PRIMARY__` | First value from deploy-target list | `Not decided` |
| `__DEPLOY_TARGETS__` | Full comma-separated deploy-target list | `Not decided` |
| `__PERSONAS__` | Comma-separated personas | `Admin, End User` |
| `__INTEGRATIONS__` | Comma-separated integrations | `None` |
| `__REPO_URL__` | Git remote URL | *(empty)* |
| `__SE_NAME__` | SE display name | OS username |
| `__YEAR__` | Current calendar year | Auto from script |

### Conditional rendering contract

Starter MDX uses the boolean `__INCLUDE_DATA_CLOUD__` / `__INCLUDE_AGENTFORCE__` tokens to gate product-specific content (e.g., the Data Cloud mapping table in `data-model.mdx` only renders when Data 360 is in scope). The scaffolder emits these as literal `true` / `false` into a generated `site.config.ts` export; MDX reads them via a `<ProductArea>` helper component shipped with the template. **Do not** do string-matching on `__PRODUCT_AREA__` in MDX — always branch on the booleans so typos in the product-area label don't silently disable sections.

To add a new placeholder: update `scripts/scaffold.mjs` `REPLACEMENTS` map, update this table, update `scripts/verify-placeholders.mjs` allowlist.

## Idempotency & safety

- `scripts/scaffold.mjs` refuses to write into a non-empty directory unless `--force` is passed. Always confirm with the SE before passing `--force`.
- `scripts/scaffold.mjs` never runs `rm -rf`. The script handles collisions by refusing, not by deleting.
- The template ships **no** `.env` files and no secrets. If an SE asks you to add credentials to the template, decline and point them at `site.config.ts` + runtime env vars.

## Common customizations (recipes)

Paste these verbatim when an SE asks "how do I…":

**Change the logo:**
Replace `public/logo.png` with a 512×512 PNG. Fumadocs picks it up automatically.

**Change the primary color:**
Edit `site.config.ts`, update the `theme.primary` hex. One variable, propagates to sidebar / buttons / links.

**Add a new top-level section called "Security":**
```
/update-docs add-section security
```
This drops `content/docs/security.mdx`, adds `"security"` to `content/docs/meta.json`, and runs placeholder substitution.

**Switch from Vercel to static export:**
Edit `next.config.mjs`, set `output: 'export'`. Run `pnpm build`. Deploy the `out/` directory anywhere.

## Extending the template

- To change what every future site looks like, edit `templates/fumadocs-poc/`.
- Keep placeholder tokens literal.
- After edits, dry-run: `node scripts/scaffold.mjs --target /tmp/dry-run-$(date +%s) --customer Test --poc Test --product-area Agentforce`, then run `pnpm build` in that directory. If build fails, your template change broke something.

## Reference files

- [`reference/intake.md`](reference/intake.md) — prompt wording + example answers
- [`reference/content-guide.md`](reference/content-guide.md) — what belongs in each POC section (for the SE, not for scaffold)
- [`reference/handoff-checklist.md`](reference/handoff-checklist.md) — what "done" looks like for a POC handoff
- [`scripts/preflight.mjs`](scripts/preflight.mjs) — environment check
- [`scripts/scaffold.mjs`](scripts/scaffold.mjs) — the one and only scaffolder
- [`scripts/verify-placeholders.mjs`](scripts/verify-placeholders.mjs) — post-scaffold sanity check

## Anti-patterns

- Don't generate MDX content inline in chat and write files one-by-one. Use the template.
- Don't hardcode customer values into template files. Always go through placeholders.
- Don't skip Phase 0. A broken Node install will eat 15 minutes of an SE's day otherwise.
- Don't skip the smoke test in Phase 3. A template that scaffolds but doesn't build is worse than no template.
- Don't pin `Node.js 16` / `Fumadocs 16` in prose anywhere. Cite minimums (`Node 22+`, `Fumadocs 16+`) and let `package.json` be canonical.
- Don't ask the SE all 9 intake fields up front. Four required, the rest deferred to `site.config.ts`.
- Don't use Mermaid (```` ```mermaid ````) in starter content. Fumadocs does not render it by default and an MDX page will appear as a raw code block. Use ASCII diagrams or drop images into `public/`.
- Don't add duplicate `# Heading` lines at the top of an MDX page — the Fumadocs `DocsTitle` already renders the frontmatter `title` as an `h1`. Starter MDX should begin with a short lede paragraph or the first real section (`## ...`).
- Don't put smart quotes (`"` `"` `'` `'`) or un-escaped apostrophes inside single-quoted JSX attribute values. MDX parses attributes as JSX; use double quotes, a template literal `title={\`…'…\`}`, or an expression container.
