# Content guide

What belongs in each section of the scaffolded POC docs site. Use this as a prompt when helping the SE fill in content after scaffold.

## `index.mdx` — Overview

- One-paragraph elevator pitch for the POC
- At-a-glance table (customer, product area, personas, integrations, deploy target)
- Cards linking into each section
- 5-step "where to start" for the reader

## `architecture.mdx`

- System context diagram (Mermaid or image)
- Component table (name, responsibility, notes)
- Data flow narrative (1-4 bullet steps)
- Design decisions (what, why, alternatives)
- Explicit out-of-scope items
- Open questions

## `setup.mdx`

- Prereqs (org, CLI, Node, perms, integrations, personas)
- Install in numbered `<Steps>` — clone, auth, deploy metadata, assign permsets, load data, configure integrations, smoke test
- Deploy-target tabs (primary target first, then alternatives)
- Verify checklist

## `data-model.mdx`

- Mermaid ERD
- Standard objects used + fields of note
- Custom objects (API name, purpose, fields, validation, sharing, triggers)
- Identity & access (personas, permsets, profile deltas)
- Data Cloud mapping table (if Data 360)
- Sharing & governance
- Open items

## `agents-and-flows.mdx`

- Agent(s) overview
- Topics (classification, scope, instructions, actions)
- Actions table (type, inputs, outputs)
- Flows table (type, trigger, purpose)
- Apex class table
- Prompt templates (if any)
- Example conversation transcripts (happy path / edge case / escalation)
- Test coverage checklist

## `troubleshooting.mdx`

- One entry per issue: **Symptom → Likely cause → Fix**
- Group by area: Agentforce / Deployment / Data 360 / Integrations / Docs site
- Keep entries short and copy-paste-able
- Escalation path at the bottom

## `handoff.mdx`

- Delivered artifacts checklist
- Ownership matrix (area, primary, secondary)
- Operational runbook (daily / weekly / monthly / per-release)
- Go / no-go checklist for production
- Roadmap (non-POC items)
- Contacts table

## Style notes

- Write to the customer's admin + architect. Assume Salesforce fluency.
- Prefer tables and checklists over prose.
- Every "TODO" in the template is a hand-off note to the SE; strip them before sharing with the customer.
- Keep each section under ~300 lines. Split into sub-pages if it grows.
