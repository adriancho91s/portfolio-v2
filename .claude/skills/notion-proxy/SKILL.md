---
name: notion-proxy
description: Step-by-step guide for adding Notion data to the portfolio. Invoke when creating new API routes, updating data mappers, or connecting React islands to Notion content.
allowed-tools: Read, Write, Edit, Glob
---

## Golden rule

Notion SDK is **server-side only**. The pattern is always:

```
Notion DB → src/lib/notion.ts → src/pages/api/*.ts → RTK Query → React island
```

Never call `@notionhq/client` from a `.tsx` file.

## Step 1 — Add a typed query in `src/lib/notion.ts`

```typescript
export async function getProjects(): Promise<Project[]> {
  const res = await notion.databases.query({
    database_id: import.meta.env.NOTION_DB_PROJECTS,
    filter: { property: 'Published', checkbox: { equals: true } },
    sorts: [{ property: 'Order', direction: 'ascending' }],
  })
  return res.results.map(mapNotionToProject)
}

function mapNotionToProject(page: any): Project {
  const p = page.properties
  return {
    id: page.id,
    title: p.Title?.title[0]?.plain_text ?? '',
    description: p.Description?.rich_text[0]?.plain_text ?? '',
    tags: p.Tags?.multi_select?.map((t: any) => t.name) ?? [],
    url: p.URL?.url ?? null,
    github: p.GitHub?.url ?? null,
    featured: p.Featured?.checkbox ?? false,
  }
}
```

## Step 2 — Create the Astro API route

```typescript
// src/pages/api/projects.ts
import type { APIRoute } from 'astro'
import { getProjects } from '@lib/notion'

export const prerender = false  // required for SSR

export const GET: APIRoute = async () => {
  try {
    const data = await getProjects()
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), { status: 500 })
  }
}
```

## Step 3 — Add RTK Query endpoint

```typescript
// src/store/api/portfolioApi.ts
getProjects: builder.query<Project[], void>({
  query: () => 'projects',
}),
```

Export the generated hook: `useGetProjectsQuery`.

## Step 4 — Use in React island (skeleton while loading)

```tsx
const { data: projects, isLoading } = useGetProjectsQuery()
if (isLoading) return <ProjectsSkeleton />  // always skeleton, never spinner
```

## Step 5 — Add env vars

```bash
# .env (never commit)
NOTION_TOKEN=secret_...
NOTION_DB_PROJECTS=<database-id>
```

Get database ID from the Notion URL: `notion.so/<workspace>/<DATABASE_ID>?v=...`

## Adding a new Notion database (checklist)

- [ ] Add `NOTION_DB_<NAME>` to `.env`
- [ ] Add query function + mapper in `src/lib/notion.ts`
- [ ] Create `src/pages/api/<name>.ts`
- [ ] Add endpoint to `portfolioApi` in RTK Query
- [ ] Add type in `src/types/`
- [ ] Update Notion DB schema reference in `portfolio-v2.md`
