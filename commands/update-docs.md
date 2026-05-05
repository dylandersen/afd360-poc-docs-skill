---
name: update-docs
description: Add or refresh a section in an already-scaffolded AFD360 POC docs site.
---

Invoke the `afd360-poc-docs-skill` skill in **update mode**.

Follow the `/update-docs` workflow described in `SKILL.md`:

1. **Locate the site** — Ask the SE for the target directory (absolute path to a previously scaffolded Fumadocs site). Confirm it exists and contains `content/docs/meta.json` and `.poc-docs-meta.json`. If `.poc-docs-meta.json` is missing, the site was scaffolded before the metadata feature; suggest re-running `/setup-docs` or pass intake values explicitly.

2. **Pick the action** — Offer:
   - `add-section <slug>` — drop a new page from the section library and update `meta.json`. To see available sections, run `node scripts/scaffold.mjs --list-sections`.
   - `refresh-starter <slug>` — re-copy starter content into an existing section (destructive; pass `--force` and warn before overwrite).
   - `resync-config` — regenerate intake metadata if intake values changed.

3. **Execute**:
   - For `add-section`: run `node <skill-dir>/scripts/scaffold.mjs --add-section <slug> --target <abs path>`. The script reads intake values from `.poc-docs-meta.json` automatically, performs placeholder substitution, and inserts the slug into `meta.json` (before `troubleshooting` so Troubleshooting stays last).
   - For `refresh-starter`: same command with `--force`.
   - Never hand-edit MDX or `meta.json` inline — always go through the script.

4. **Verify** — Confirm the new page appears in the sidebar (the SE may need to restart `pnpm dev`). If they want to see what's available without committing to anything, `node scripts/scaffold.mjs --list-sections` is read-only.

5. **Next steps** — Print what changed (which file was added/updated, whether `meta.json` was touched) and remind the SE to restart `pnpm dev` if it's running.

If the skill directory is unclear, resolve it from the absolute path of this command's parent skill (`SKILL.md`). Typical locations: `~/.cursor/skills/afd360-poc-docs-skill/` or `.cursor/skills/afd360-poc-docs-skill/`.
