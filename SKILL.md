---
name: setup-docs
description: Scaffolds a tailored Fumadocs documentation site for a Salesforce Solutions Engineer delivering a post-sale Agentforce, Salesforce, or Data 360 Proof-of-Concept. Use when the user runs /setup-docs, asks to "spin up customer docs", "create POC docs site", or "scaffold Fumadocs for a customer". Generates a Next.js + Fumadocs project with sections for Overview, Architecture, Setup, Data Model, Agents & Flows, Troubleshooting, and Handoff, pre-populated with customer and POC details.
---

# setup-docs — Customer POC Documentation Site

Scaffolds a production-ready [Fumadocs](https://fumadocs.dev) site tailored for an SE handing off a Salesforce / Agentforce / Data 360 Proof-of-Concept to a customer.

## What it produces

A Next.js 16 + Fumadocs 16 site at a directory the SE chooses, with:

- Opinionated sidebar structure tuned for a POC handoff
- Pages pre-filled with the customer + POC context (substituted from intake)
- Static client-side search (Orama), llms-full.txt, OG image route
- `pnpm` workflow, Tailwind v4, TypeScript strict

## Invocation

Triggered by:

- `/setup-docs` slash command
- Natural phrases: "spin up customer docs", "scaffold POC docs", "create docs site for \<customer\>"

## Workflow

Follow these phases **in order**. Do not skip intake — the template relies on every placeholder.

### Phase 1 — Intake

Use the AskQuestion tool if available, otherwise ask conversationally. Collect:

1. **Customer name** — display name, e.g. "Acme Corp"
2. **POC name** — e.g. "Service Cloud Agent POC"
3. **Product area** — one of: `Agentforce`, `Data 360`, `Agentforce + Data 360`, `Salesforce Platform`
4. **Primary personas** — comma-separated, e.g. "Service Agent, Supervisor, Admin"
5. **Key integrations** — comma-separated, e.g. "ServiceNow, Snowflake, Slack"
6. **Deploy target** — one of: `Vercel`, `Heroku`, `Static export`, `Not decided`
7. **Repo URL** — target GitHub URL, or `skip` to leave blank
8. **SE name** — the Solutions Engineer's name (for the handoff page)
9. **Target directory** — absolute path where the site should be created. If the SE doesn't specify, default to `~/Documents/cursor_orgs/<customer-slug>-docs` and confirm.

Derive slugs from the names (lowercase, hyphenated, no special chars). Confirm all values back to the SE before scaffolding.

### Phase 2 — Scaffold

Run the Node scaffold script. It copies `templates/fumadocs-poc/` → target directory and substitutes every placeholder token.

```bash
node "<skill-dir>/scripts/scaffold.mjs" \
  --target "<ABSOLUTE_TARGET_DIR>" \
  --customer "<CUSTOMER_NAME>" \
  --customer-slug "<CUSTOMER_SLUG>" \
  --poc "<POC_NAME>" \
  --poc-slug "<POC_SLUG>" \
  --product-area "<PRODUCT_AREA>" \
  --personas "<PERSONAS>" \
  --integrations "<INTEGRATIONS>" \
  --deploy-target "<DEPLOY_TARGET>" \
  --repo-url "<REPO_URL_OR_EMPTY>" \
  --se-name "<SE_NAME>"
```

`<skill-dir>` is the skill's installation path (e.g. `~/.cursor/skills/setup-docs`). Resolve it from the absolute path of this `SKILL.md` file.

**Never** re-implement the copy/substitute logic inline — always call `scripts/scaffold.mjs`. It handles: directory creation, recursive copy, placeholder replacement across all text files, `.gitignore` generation, and idempotent re-runs.

### Phase 3 — Install & verify

After scaffold succeeds:

1. `cd` to the target directory.
2. Run `pnpm install` (the script does NOT run install automatically — ask the SE first; some prefer `npm` or want to inspect first).
3. Run `pnpm dev` in the background and confirm the site boots on `http://localhost:3000`.
4. Print a short summary: target path, dev URL, key pages to edit next, suggested git init steps.

If `pnpm` is not installed, fall back to `npm install` and `npm run dev`. Warn the SE that the template uses `pnpm` lockfile conventions.

### Phase 4 — Next steps message

End with a checklist the SE can hand to the customer team, including:

- Where to edit each section (`content/docs/*.mdx`)
- How to add new pages (update `meta.json`, drop `.mdx` file)
- How to swap the logo (`public/logo.png`)
- How to deploy to the chosen target

## Placeholder contract

The template files contain these tokens (all literal, uppercase, double-underscored). The scaffold script replaces them everywhere:

| Token | Source |
|-------|--------|
| `__CUSTOMER_NAME__` | Customer display name |
| `__CUSTOMER_SLUG__` | Lowercased, hyphenated customer name |
| `__POC_NAME__` | POC display name |
| `__POC_SLUG__` | Lowercased, hyphenated POC name |
| `__PRODUCT_AREA__` | Product area string |
| `__PERSONAS__` | Comma-separated personas |
| `__INTEGRATIONS__` | Comma-separated integrations |
| `__DEPLOY_TARGET__` | Deploy target string |
| `__REPO_URL__` | Git remote URL (empty allowed) |
| `__SE_NAME__` | SE display name |
| `__YEAR__` | Current calendar year (auto from script) |

If you need to add a new placeholder later, add it to `scripts/scaffold.mjs` `REPLACEMENTS` map and document it here.

## Idempotency & safety

- The scaffold script **refuses** to write into a non-empty directory unless `--force` is passed. Confirm with the SE before passing `--force`.
- Never run `rm -rf`. Let the script handle it.
- Never commit secrets. The template ships no `.env` files.

## Extending the template

To modify what every future scaffolded site looks like, edit files under `templates/fumadocs-poc/`. Keep placeholder tokens literal. Run a dry-run scaffold into `/tmp/foo` after edits to verify.

## Reference files

- [`reference/intake.md`](reference/intake.md) — suggested intake question wording + example answers
- [`reference/content-guide.md`](reference/content-guide.md) — what belongs in each POC section
- [`scripts/scaffold.mjs`](scripts/scaffold.mjs) — the one and only scaffolder

## Anti-patterns

- Don't generate MDX content inline inside the chat and write it file-by-file. Use the template.
- Don't hardcode customer values into template files during scaffold — always go through placeholders.
- Don't skip the intake phase "to save time". The template's defaults are intentionally generic and read poorly without substitution.
