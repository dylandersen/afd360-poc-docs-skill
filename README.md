# setup-docs

A Cursor skill that scaffolds a tailored [Fumadocs](https://fumadocs.dev) documentation site for a Salesforce Solutions Engineer handing off an Agentforce / Salesforce / Data 360 Proof-of-Concept.

Invoke `/setup-docs` in Cursor and the agent walks you through intake, scaffolds the site, installs dependencies, and starts the dev server.

## What you get

A Next.js 16 + Fumadocs 16 site with:

- Sidebar tuned for a POC handoff: **Overview → Architecture → Setup → Data Model → Agents & Flows → Troubleshooting → Handoff**
- Pages pre-filled with the customer + POC context
- Static client-side search (Orama), `llms-full.txt` route, Tailwind v4
- `pnpm` workflow, TypeScript strict

## Install

### Option A — Clone into your personal skills folder

```bash
git clone https://github.com/<your-org>/afd360Skills ~/.cursor/skills/setup-docs
```

Cursor auto-discovers `~/.cursor/skills/*/SKILL.md`. Restart Cursor if the skill doesn't show up.

### Option B — Project skill (ships with a repo)

```bash
git clone https://github.com/<your-org>/afd360Skills .cursor/skills/setup-docs
```

### Option C — Convenience installer

From inside this repo:

```bash
./install.sh
# symlinks this directory to ~/.cursor/skills/setup-docs
```

### Enable the slash command

Copy the slash command file to your commands folder:

```bash
cp commands/setup-docs.md ~/.cursor/commands/setup-docs.md
# or (project-scoped)
cp commands/setup-docs.md .cursor/commands/setup-docs.md
```

Then typing `/setup-docs` in Cursor chat invokes the skill.

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
afd360Skills/
├── SKILL.md                   skill manifest + workflow for the agent
├── commands/
│   └── setup-docs.md          /setup-docs slash command file
├── scripts/
│   └── scaffold.mjs           copy + placeholder substitution engine
├── reference/
│   ├── intake.md              how to ask each intake question
│   └── content-guide.md       what belongs in each section
├── templates/
│   └── fumadocs-poc/          the Fumadocs site template (placeholders)
├── install.sh                 symlink this folder to ~/.cursor/skills/setup-docs
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
