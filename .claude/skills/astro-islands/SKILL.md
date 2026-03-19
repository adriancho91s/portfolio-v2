---
name: astro-islands
description: Decides whether a component should be Astro or React, and which hydration directive to use. Invoke before building any component in portfolio-v2.
allowed-tools: Read, Glob
---

Before writing any component, follow this decision tree:

## Step 1 — Astro or React?

Ask: does this component need client-side interactivity (state, events, Three.js, dynamic data rendering)?

- **No** → Write `.astro`. Examples: section wrappers, headings, bio text, navbar shell, footer.
- **Yes** → Write `.tsx` as a React island.

## Step 2 — Choose hydration directive (React only)

| Situation | Directive | Why |
|-----------|-----------|-----|
| Enters viewport (timeline, skills, projects) | `client:visible` | Only loads when user scrolls to it |
| Non-critical, after page load (contact form) | `client:idle` | Doesn't block TTI |
| Desktop-only Three.js (hero scene) | `client:only="react"` | Needs browser globals, skip SSR |
| **Never** | `client:load` | Blocks LCP — banned in this project |

## Step 3 — Structure the component pair

```
ComponentName/
├── ComponentName.astro              # Static wrapper, SSR content, SEO heading
└── ComponentNameInteractive.tsx     # React island with client: directive
```

Mount the island inside the Astro wrapper:
```astro
---
import ComponentNameInteractive from './ComponentNameInteractive.tsx'
---
<section id="section-id">
  <h2>Static heading (indexed by search engines)</h2>
  <ComponentNameInteractive client:visible />
</section>
```

## Step 4 — Mobile guard for Three.js

In `Hero.astro`, wrap the canvas island:
```astro
<div class="hidden md:block">
  <HeroScene client:only="react" />
</div>
<div class="md:hidden hero-orb" aria-hidden="true" />
```

In `HeroScene.tsx`, add a safety guard at the top:
```tsx
const isDesktop = typeof window !== 'undefined'
  && window.matchMedia('(hover: hover) and (min-width: 768px)').matches
if (!isDesktop) return null
```

## Anti-patterns to avoid

- `client:load` on any island
- Calling Notion or any API directly inside a React island (use `/api/` routes)
- Using `useEffect` to fetch data that could be server-rendered in Astro
- Putting a React island inside another React island — flatten the tree
