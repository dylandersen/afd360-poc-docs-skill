# __CUSTOMER_NAME__ — __POC_NAME__ Docs

Customer handoff documentation for the **__POC_NAME__** Proof-of-Concept delivered by __SE_NAME__.

- **Product area**: __PRODUCT_AREA__
- **Primary personas**: __PERSONAS__
- **Key integrations**: __INTEGRATIONS__
- **Deploy target**: __DEPLOY_TARGET__

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
content/docs/
├── index.mdx            Overview + quick links
├── architecture.mdx     How it fits together
├── setup.mdx            Prereqs + install
├── data-model.mdx       Objects, fields, relationships
├── agents-and-flows.mdx Agentforce topics / Flows / automations
├── handoff.mdx          Ownership, ops, next steps
└── troubleshooting.mdx  Common issues + fixes (lives last so it's easy to find)
```

## Editing content

1. Open the `.mdx` file for the section you want to change.
2. Update frontmatter (`title`, `description`) and body as needed.
3. To add a new page, create `content/docs/<slug>.mdx` and add it to `content/docs/meta.json`.

## Components

Fumadocs ships `Callout`, `Card` / `Cards`, `Step` / `Steps`, `Tab` / `Tabs`, and more. Import them directly in MDX:

```mdx
import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
```

Lucide icons are available via `lucide-react`.

## Deploy

See [`./setup.mdx`](content/docs/setup.mdx) for deploy target __DEPLOY_TARGET__.

Repo: __REPO_URL__

---

&copy; __YEAR__ __CUSTOMER_NAME__ — documentation prepared by __SE_NAME__.
