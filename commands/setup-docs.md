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
   - Continue in this order with conversational prompts: POC name, product area (Agentforce / Data 360 / Agentforce + Data 360 / Salesforce Platform), primary personas, key integrations, deploy target (Vercel / Heroku / Static / Not decided), repo URL (optional), SE name, target directory, and — last — **customer's public website** (optional).
   - Call out the customer website question plainly: "Customer's public website? If you share it, I'll grab their logo, colors, and font automatically. Press enter to skip." The skill auto-extracts brand from this URL during scaffold; it is the single highest-impact optional field, so make sure the SE sees it.
   - Derive slugs from the customer name and POC name once you have them.
   - If the SE does not provide a target directory, offer the default `~/Documents/cursor_orgs/<customer-slug>-docs` and ask for confirmation before using it.
   - After all fields are collected, summarize them back and ask for confirmation before scaffolding.

2. **Scaffold** — Call `scripts/scaffold.mjs` from the skill directory with the collected values. Pass `--customer-url <url>` when the SE provided one; the scaffolder invokes `scripts/brand-extractor/index.mjs` automatically. Do not reimplement the copy/replace logic, and do not invoke the brand extractor yourself.

3. **Brand review** (only when `--customer-url` was used) — Before starting the dev server, summarize what the extractor pulled (primary/secondary color, font + neighbor, logo, favicon, OG hero, WCAG contrast result, provenance URL). Offer accept-as-is / edit one field / refresh from URL / skip extracted branding. Never stall the scaffold on a `robots-disallow` or `unreachable` result — note it and continue with defaults.

4. **Install & verify** — Ask before running `pnpm install`. Start the dev server in the background and confirm `http://localhost:3000` renders.

5. **Next steps** — Print a handoff checklist: where to edit content, how to add pages, how to refresh brand from the customer URL, how to override theme values in `site.config.ts`, how to deploy.

Default target directory if the SE doesn't supply one: `~/Documents/cursor_orgs/<customer-slug>-docs`. Confirm before using.

If the skill directory is unclear, resolve it from the absolute path of this command's parent skill (`SKILL.md`). Typical locations: `~/.cursor/skills/afd360-poc-docs-skill/` or `.cursor/skills/afd360-poc-docs-skill/`.
