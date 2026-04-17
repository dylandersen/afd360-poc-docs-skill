# Handoff checklist

What "done" looks like for a POC handoff. Use this when you, the SE, are writing `handoff.mdx` in the customer site. This doc lives in the skill (not in the scaffolded site) because it's guidance *for you*.

If any row below is unchecked, the POC is not handed off — it's just deployed. Those are different things.

## Artifacts delivered

- [ ] All metadata deployed to the customer sandbox and verified
- [ ] All sample data loaded (or a load script committed) and verified
- [ ] Docs site deployed to the customer-owned host (not your personal Vercel)
- [ ] Repo transferred to customer GitHub org (or forked with commit history preserved)
- [ ] All screenshots / Looms linked from the docs site have backup copies somewhere the customer controls

## Access

- [ ] Customer admin(s) have org access with the permsets they need
- [ ] Service accounts documented (name, purpose, owner, rotation date)
- [ ] API keys and connected app credentials rotated from whatever was used during build
- [ ] SE access removed from the sandbox or explicitly time-boxed with expiry
- [ ] MFA enforced on any account that has modify-metadata permissions

## Ownership

- [ ] Every component in `architecture.mdx` has a named primary owner on the customer side
- [ ] Every component has a named secondary / backup owner
- [ ] Escalation path documented (primary → secondary → vendor support → account exec)
- [ ] Customer owners have been walked through their components live (not just "here's the doc")

## Runbook

- [ ] Daily operational tasks documented (if any)
- [ ] Weekly tasks documented (monitoring, review queues)
- [ ] Monthly tasks documented (access review, usage review)
- [ ] Per-release tasks documented (what to test when Salesforce pushes a release)
- [ ] "What to do if X breaks" covers at least the three most likely failure modes

## Production readiness (if POC is going to prod)

- [ ] Load testing done at expected prod volume
- [ ] Error handling reviewed for agent actions and flows
- [ ] Apex test coverage ≥ 75% on anything touching prod
- [ ] Governor limits reviewed for worst-case customer data shape
- [ ] Data retention / privacy reviewed against customer policy
- [ ] Rollback plan documented
- [ ] Go / no-go criteria written down and agreed

If this is a sandbox-only POC, the customer still needs a written answer to "when and how would we graduate this to prod?" in the roadmap section.

## Knowledge transfer

- [ ] At least one live walkthrough session recorded
- [ ] Recording linked from `handoff.mdx`
- [ ] Customer team has asked at least three questions of the docs and the docs answered them (if not, revise the docs)
- [ ] SE has confirmed in writing: "I will respond to questions for N weeks, after that route to \<channel\>"

## Anti-patterns

- "The docs are the handoff" — no. The docs + a walkthrough + clear ownership + rotated credentials is the handoff.
- Leaving your personal Vercel deploy as the customer's production docs site.
- Naming yourself as the secondary owner for every component. You are leaving. Pick someone on the customer team.
- "TBD" in the escalation path. If it's TBD, it's a blocker — resolve it before marking handoff complete.
