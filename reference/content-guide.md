# Content guide

This is not a template — the template MDX files already contain starter content (real tables, example Mermaid diagrams, sample callouts). This guide tells you **how to think** about each section when you replace that starter content with POC specifics.

Use this as a prompt when helping the SE fill in content after scaffold. Every starter in the template is marked with `{/* TODO(SE): ... */}` MDX comments so they're easy to find with `rg "TODO\(SE\)" content/`.

## Guiding principle

Write for the customer's **admin + architect**, who will own this POC six months after you've moved on. Assume Salesforce fluency. Do not explain what an Apex class is. Do explain why *this* Apex class exists.

## `index.mdx` — Overview

**Job:** Let a new reader land here and know in 90 seconds whether this doc is relevant to them.

- One-paragraph elevator pitch (what was built, for whom, what problem it solves)
- At-a-glance table: customer, product area, personas, integrations, deploy target, SE contact, hand-off date
- Cards linking into each section (template ships these)
- 5-step "where to start" tailored to role (admin reads X, architect reads Y)

**Red flag:** if the overview describes *how* anything works, move it to `architecture.mdx`.

## `architecture.mdx`

**Job:** Let an architect understand the system boundaries without opening the org.

- System context diagram (Mermaid — template includes a starter)
- Component table: name, responsibility, owner, notes
- Data flow: 1-4 bullet steps in plain English. Not a code trace.
- Design decisions: what, why, what we considered and rejected, trade-offs we accepted
- Explicit out-of-scope items (most common omission)
- Open questions the customer needs to answer

**Red flag:** if this page has no "rejected alternatives," the customer will re-litigate every decision. Include them.

## `setup.mdx`

**Job:** Let a new admin reproduce the POC in a fresh sandbox.

- Prereqs: org edition, CLI versions, Node version, perms required, upstream integrations needed, personas provisioned
- Install in numbered `<Steps>`: clone → auth → deploy metadata → assign permsets → load data → configure integrations → smoke test
- Deploy-target tabs: primary target first, then alternatives (driven by `__DEPLOY_TARGET_PRIMARY__` / `__DEPLOY_TARGETS__` — if the SE picked only one, a single tab renders)
- Verify checklist: what success looks like at each step

**Red flag:** if the reader has to look up a command in another doc, copy the command in here.

## `data-model.mdx`

**Job:** Let a developer extend the data model without breaking the agent.

- Mermaid ERD (template starter)
- Standard objects used + fields of note (skip the obvious — focus on non-default)
- Custom objects: API name, purpose, key fields, validation rules, sharing model, triggers
- Identity & access: personas, permsets, profile deltas, permission rationale
- Data Cloud mapping table — renders only when `__INCLUDE_DATA_CLOUD__` is `true` (i.e., product area contains `Data 360`). Do not hand-edit the gate; change the intake answer instead.
- Sharing & governance rationale
- Open items

## `agents-and-flows.mdx`

**Job:** Let a Salesforce admin understand and modify the agent without re-reading Trailhead.

- Agent(s) overview: purpose, scope, guardrails
- Topics: classification, scope, instructions, actions each one can call
- Actions table: name, type (Apex / Flow / Prompt Template), inputs, outputs, where defined
- Flows table: name, type, trigger, purpose
- Apex class table: name, purpose, test class, coverage %
- Prompt templates: template name, variables, example render
- Example conversation transcripts: happy path, known edge case, escalation path
- Test coverage checklist

**Red flag:** if there are no transcripts, the customer will not trust the agent in prod. Include at least three.

## `handoff.mdx`

**Job:** Let the customer operate this POC without you.

This is **the single most important page** for the customer. See [`handoff-checklist.md`](handoff-checklist.md) for the full "what done looks like" list. At minimum:

- Delivered artifacts checklist (metadata, data, docs, access)
- Ownership matrix: area, primary owner, secondary owner, escalation
- Operational runbook: daily / weekly / monthly / per-release tasks
- Go / no-go checklist for production rollout
- Roadmap: what's explicitly *not* in this POC but was discussed
- Contacts: customer team + SE + account team + Salesforce support
- Credentials rotation log (any service accounts created)
- Access review log (who has permsets, with expiry dates)

**Red flag:** if the handoff page doesn't answer "what do I do if \<SE name\> is on PTO?", it's not done.

## `troubleshooting.mdx`

**Job:** Let a tier-1 admin unblock themselves at 2am without calling the SE.

This page ships **last** in the sidebar on purpose — it's the page the on-call admin reaches for most often, so it needs to be predictable to find.

- One entry per issue: **Symptom → Likely cause → Fix**
- Group by area using `<Tabs>`: Agentforce / Deployment / Data 360 / Integrations / Docs site
- Use `<Accordions>` for each issue so the page scans fast and expands on demand
- Keep entries short and copy-paste-able
- Escalation path at the bottom (who to call, when, with what information)

The template ships this as a **skeleton** with a few representative Salesforce entries per area. Treat those as examples — replace them with the issues you actually hit during the build. Remove entire tabs (Agentforce, Data 360) if they aren't in scope for this POC.

**Red flag:** if this section only has three entries, you haven't written down what broke during the build. Go back through your Slack DMs with the customer.

## Style notes

- Prefer tables and checklists over prose.
- Every `TODO(SE)` comment in the template is a hand-off note to you; strip them before sharing with the customer.
- Keep each section under ~300 lines. Split into sub-pages if it grows (use `/update-docs add-section <slug>`).
- Link liberally between sections. If `setup.mdx` mentions a permset, link to its row in `data-model.mdx`.
- Mermaid diagrams beat image uploads. They stay readable when the theme changes and they diff cleanly in git.
- Screenshots should be the exception, not the rule. They go stale the moment the org UI updates.
