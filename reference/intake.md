# Intake reference

How to ask each intake question, with example answers and validation tips.

## 1. Customer name

- **Prompt**: "What's the customer's display name? (e.g. Acme Corp)"
- **Example**: `Acme Corp`
- **Slug derivation**: lowercase, spaces → `-`, strip punctuation → `acme-corp`

## 2. POC name

- **Prompt**: "What's the POC called?"
- **Example**: `Service Cloud Agent POC`
- **Slug**: `service-cloud-agent-poc`

## 3. Product area

- **Prompt**: "Which product area?"
- **Options** (pick one):
  - `Agentforce`
  - `Data 360`
  - `Agentforce + Data 360`
  - `Salesforce Platform`

## 4. Primary personas

- **Prompt**: "Who will use what we built? (comma-separated personas)"
- **Example**: `Service Agent, Supervisor, Admin`

## 5. Key integrations

- **Prompt**: "What external systems does the POC touch?"
- **Example**: `ServiceNow, Snowflake, Slack`
- If none, accept `None`.

## 6. Deploy target

- **Prompt**: "Where will this docs site be hosted?"
- **Options**: `Vercel`, `Heroku`, `Static export`, `Not decided`

## 7. Repo URL

- **Prompt**: "GitHub URL for the POC repo? (optional, enter `skip` to leave blank)"
- **Example**: `https://github.com/acme/service-cloud-agent-poc`

## 8. SE name

- **Prompt**: "Your name for the handoff page?"
- **Example**: `Dylan Andersen`

## 9. Target directory

- **Prompt**: "Where should the docs site be created? (absolute path)"
- **Default**: `~/Documents/cursor_orgs/<customer-slug>-docs`
- **Validate**: absolute path, parent exists, target empty or `--force`.

## Confirmation

After collecting, echo back as a single block:

```
Customer:        Acme Corp  (slug: acme-corp)
POC:             Service Cloud Agent POC  (slug: service-cloud-agent-poc)
Product area:    Agentforce + Data 360
Personas:        Service Agent, Supervisor, Admin
Integrations:    ServiceNow, Snowflake, Slack
Deploy target:   Vercel
Repo URL:        https://github.com/acme/service-cloud-agent-poc
SE:              Dylan Andersen
Target:          /Users/dylan/Documents/cursor_orgs/acme-corp-docs
```

Ask: "Ready to scaffold? (yes / edit)" before calling `scripts/scaffold.mjs`.
