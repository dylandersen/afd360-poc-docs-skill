---
name: update-docs
description: Add or refresh a section in an already-scaffolded AFD360 POC docs site.
---

Invoke the `afd360-poc-docs-skill` skill in **update mode**.

Follow the `/update-docs` workflow described in `SKILL.md`:

1. **Locate the site** — Ask the SE for the target directory (absolute path to a previously scaffolded Fumadocs site). Confirm it exists and contains `content/docs/meta.json`. If not, suggest they run `/setup-docs` instead.

2. **Pick the action** — Offer three choices:
   - `add-section <slug>` — drop a new page from the section library (e.g. `security`, `observability`, `rollout-plan`, `faq`, `glossary`, `release-notes`, `runbook`).
   - `refresh-starter <slug>` — re-copy starter content into an existing section (destructive; confirm before overwrite).
   - `resync-config` — regenerate `site.config.ts` from a new intake pass.

3. **Execute** — Run the relevant `scripts/scaffold.mjs` flag(s) to perform the action. Never hand-edit MDX or `meta.json` inline — always go through the script so placeholders stay consistent.

4. **Verify** — Run `scripts/verify-placeholders.mjs <target>` afterward to make sure no `__*__` tokens leaked through.

5. **Next steps** — Print what changed and remind the SE to restart `pnpm dev` if it's running.

If the skill directory is unclear, resolve it from the absolute path of this command's parent skill (`SKILL.md`). Typical locations: `~/.cursor/skills/afd360-poc-docs-skill/` or `.cursor/skills/afd360-poc-docs-skill/`.
