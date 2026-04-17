# afd360-poc-docs-skill

A Cursor skill that scaffolds a tailored [Fumadocs](https://fumadocs.dev) documentation site for a Salesforce Solutions Engineer handing off an Agentforce / Salesforce / Data 360 Proof-of-Concept.

Invoke `/setup-docs` in Cursor and the agent walks you through intake, scaffolds the site, installs dependencies, and starts the dev server.

## What you get

A Next.js 16 + Fumadocs 16 site with:

- Sidebar tuned for a POC handoff: **Overview → Architecture → Setup → Data Model → Agents & Flows → Handoff → Troubleshooting**
- Pages pre-filled with the customer + POC context
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

1. Ask for: customer name, POC name, product area, personas, integrations, deploy target, repo URL, SE name, target directory
2. Call `scripts/scaffold.mjs` to copy the template and substitute placeholders
3. Ask before running `pnpm install`
4. Start `pnpm dev` and confirm [http://localhost:3000](http://localhost:3000) renders
5. Print a handoff checklist

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
  --se-name "Dylan Andersen"
```

Pass `--force` to overwrite a non-empty target.

## Repo layout

```
afd360-poc-docs-skill/
├── SKILL.md                   skill manifest + workflow for the agent
├── commands/
│   └── setup-docs.md          /setup-docs slash command file
├── scripts/
│   └── scaffold.mjs           copy + placeholder substitution engine
├── reference/
│   ├── intake.md              how to ask each intake question
│   ├── content-guide.md       what belongs in each section
│   └── handoff-checklist.md   "done" checklist for a POC handoff
├── templates/
│   └── fumadocs-poc/          the Fumadocs site template (placeholders)
├── install.sh                 symlink this folder to ~/.cursor/skills/afd360-poc-docs-skill
├── README.md
└── LICENSE
```

## Placeholder tokens

Template files contain these tokens. The scaffolder replaces them from CLI flags:

| Token | Flag |
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
| `__YEAR__` | auto (current year) |

## Extend

- Add sections: drop new `.mdx` files in `templates/fumadocs-poc/content/docs/` and register them in `meta.json`.
- Add placeholders: update `scripts/scaffold.mjs` `replacements` map and document in `SKILL.md`.
- Change styling: edit `templates/fumadocs-poc/app/global.css`.

## License

MIT — see `LICENSE`.
