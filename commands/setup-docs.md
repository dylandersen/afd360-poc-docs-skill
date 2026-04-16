---
description: Scaffold a Fumadocs POC documentation site for a Salesforce / Agentforce / Data 360 customer handoff.
---

Invoke the `setup-docs` skill.

Follow the skill's four-phase workflow exactly:

1. **Intake** — Ask the SE for: customer name, POC name, product area (Agentforce / Data 360 / Agentforce + Data 360 / Salesforce Platform), primary personas, key integrations, deploy target (Vercel / Heroku / Static / Not decided), repo URL (optional), SE name, and target directory. Derive slugs from names. Confirm back before scaffolding.

2. **Scaffold** — Call `scripts/scaffold.mjs` from the skill directory with the collected values. Do not reimplement the copy/replace logic.

3. **Install & verify** — Ask before running `pnpm install`. Start the dev server in the background and confirm `http://localhost:3000` renders.

4. **Next steps** — Print a handoff checklist: where to edit content, how to add pages, how to swap the logo, how to deploy.

Default target directory if the SE doesn't supply one: `~/Documents/cursor_orgs/<customer-slug>-docs`. Confirm before using.

If the skill directory is unclear, resolve it from the absolute path of this command's parent skill (`SKILL.md`). Typical locations: `~/.cursor/skills/setup-docs/` or `.cursor/skills/setup-docs/`.
