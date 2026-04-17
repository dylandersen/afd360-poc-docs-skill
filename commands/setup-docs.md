---
name: setup-docs
description: For AFD360 SEs to build a quick documentation site using Fumadocs and initiates onboarding.
---

Invoke the `afd360-poc-docs-skill` skill.

Follow the skill's four-phase workflow exactly:

1. **Intake** — Collect the setup details one question at a time. Do not ask for multiple fields in the same message.
   - Talk directly to the SE in a conversational tone.
   - Start with: "What is your name?"
   - Then ask: "What is your customer's name?"
   - Continue in this order with conversational prompts: POC name, product area (Agentforce / Data 360 / Agentforce + Data 360 / Salesforce Platform), primary personas, key integrations, deploy target (Vercel / Heroku / Static / Not decided), repo URL (optional), SE name, and target directory.
   - Derive slugs from the customer name and POC name once you have them.
   - If the SE does not provide a target directory, offer the default `~/Documents/cursor_orgs/<customer-slug>-docs` and ask for confirmation before using it.
   - After all fields are collected, summarize them back and ask for confirmation before scaffolding.

2. **Scaffold** — Call `scripts/scaffold.mjs` from the skill directory with the collected values. Do not reimplement the copy/replace logic.

3. **Install & verify** — Ask before running `pnpm install`. Start the dev server in the background and confirm `http://localhost:3000` renders.

4. **Next steps** — Print a handoff checklist: where to edit content, how to add pages, how to swap the logo, how to deploy.

Default target directory if the SE doesn't supply one: `~/Documents/cursor_orgs/<customer-slug>-docs`. Confirm before using.

If the skill directory is unclear, resolve it from the absolute path of this command's parent skill (`SKILL.md`). Typical locations: `~/.cursor/skills/afd360-poc-docs-skill/` or `.cursor/skills/afd360-poc-docs-skill/`.
