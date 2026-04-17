# Intake reference

How to ask each intake question, with example answers and validation tips. The scaffold needs **4 required** fields. Everything else has a default and can be edited after scaffold in `site.config.ts`.

## Required (ask these, one at a time)

### 1. Customer name

- **Prompt:** "What's the customer's display name? (e.g. Acme Corp)"
- **Example:** `Acme Corp`
- **Slug derivation:** lowercase, spaces → `-`, strip punctuation → `acme-corp`
- **Validation:** non-empty, < 64 chars

### 2. POC name

- **Prompt:** "What's the POC called?"
- **Example:** `Service Cloud Agent POC`
- **Slug:** `service-cloud-agent-poc`
- **Validation:** non-empty, < 80 chars

### 3. Product area

- **Prompt:** "Which product area?"
- **Options (pick one):**
  - `Agentforce`
  - `Data 360`
  - `Agentforce + Data 360`
  - `Salesforce Platform`
- **Validation:** must match one option exactly

### 4. Target directory

- **Prompt:** "Where should I create the site? (absolute path — default is `~/Documents/cursor_orgs/<customer-slug>-docs`)"
- **Validation:** absolute path, parent directory exists, target is empty or `--force` passed

## Optional (offer once, don't press)

After the 4 required fields, say:

> "I've got what I need to scaffold. Want to set personas / integrations / deploy target / repo / your name now, or fill those in later via `site.config.ts`?"

If the SE says "later," move on. If they say "now," walk through the five below. Never block scaffold on them.

### 5. Primary personas

- **Prompt:** "Who will use what we built? (comma-separated)"
- **Example:** `Service Agent, Supervisor, Admin`
- **Default:** `Admin, End User`

### 6. Key integrations

- **Prompt:** "What external systems does the POC touch?"
- **Example:** `ServiceNow, Snowflake, Slack`
- **Default:** `None`

### 7. Deploy target

- **Prompt:** "Where will this docs site be hosted? (comma-separated if you want setup.mdx to document more than one)"
- **Options (pick one or more):** `Vercel`, `Cloudflare Pages`, `Netlify`, `Static export`, `Self-hosted`, `Not decided`
- **Example:** `Vercel, Static export`
- **Default:** `Not decided`
- **Notes:** The first value is treated as the primary target; additional values render as extra tabs in `setup.mdx`. `Not decided` must appear alone.

### 8. Repo URL

- **Prompt:** "GitHub URL for the docs repo? (enter `skip` to leave blank)"
- **Example:** `https://github.com/acme/service-cloud-agent-poc-docs`
- **Default:** empty string

### 9. SE name

- **Prompt:** "Your name for the handoff page?"
- **Example:** `Dylan Andersen`
- **Default:** `os.userInfo().username` (so the handoff page is never empty)

## Confirmation

After all required fields collected (and optional ones if the SE opted in), echo as one block:

```
Customer:        Acme Corp  (slug: acme-corp)
POC:             Service Cloud Agent POC  (slug: service-cloud-agent-poc)
Product area:    Agentforce + Data 360
Target:          /Users/dylan/Documents/cursor_orgs/acme-corp-docs

Optional (defaults shown where not set):
Personas:        Service Agent, Supervisor, Admin
Integrations:    ServiceNow, Snowflake, Slack
Deploy target:   Vercel, Static export   (primary: Vercel)
Repo URL:        https://github.com/acme/service-cloud-agent-poc-docs
SE:              Dylan Andersen
```

Ask: **"Ready to scaffold? (yes / edit)"** before calling `scripts/scaffold.mjs`.

If the SE says `edit`, ask which field, update only that one, re-print the summary, re-ask. Do not re-walk the whole intake.

## Anti-patterns

- Asking all 9 fields up front.
- Restating a previous answer in the same message as the next question.
- Asking for optional fields before required ones are complete.
- Asking for the SE's name when we can read it from the OS — offer the OS default first.
- Treating `skip` or empty answers as errors for optional fields.
