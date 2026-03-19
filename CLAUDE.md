# CLAUDE.md — Portfolio v2

> Adrian Gaitan's personal portfolio — Astro 5 + React Islands + Three.js + Notion CMS
> Memory vault: `~/Obsidian/claude_memory/projects/portfolio-v2/`
> **Always read `board.md` at the start of each session.**

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 5 (View Transitions, server endpoints) |
| Islands | React 19 (interactive components only) |
| 3D | React Three Fiber + Drei (desktop hero only) |
| Styling | Tailwind CSS v4 (dark/light dual theme) |
| Animations | GSAP ScrollTrigger + CSS scroll-driven |
| State | RTK Query (React islands fetch from Astro API routes) |
| CMS | Notion API (server-side only — NEVER expose keys) |
| Deploy | Vercel SSR adapter |

---

## Critical Rules

- **Astro (.astro) for all static content** — React (.tsx) ONLY for interactive islands
- **`client:visible` or `client:idle`** on React islands — NEVER `client:load`
- **Three.js ONLY on desktop** — mobile gets CSS-only gradient orb (check `window.matchMedia('(hover: hover)')`)
- **All Notion calls go through `/api/` routes** — NEVER call Notion from client
- **Theme tokens via CSS custom properties** — NEVER hardcode hex colors in components
- **`prefers-reduced-motion` must disable ALL animations** — check at every animated component
- **Images via Astro `<Image />`** — NEVER raw `<img>` tags
- **pnpm only** — never npm

---

## Project Skills (`.claude/skills/`)

| Skill | When |
|-------|------|
| `astro-islands` | Before building any component — decides Astro vs React + hydration directive |
| `r3f-performance` | Before touching any Three.js/R3F code |
| `notion-proxy` | Before working with Notion data or API routes |
| `theme-system` | Before touching theme, colors, or ThemeToggle |

## Global Skills (auto-invoke)

| Situation | Invoke |
|-----------|--------|
| Any UI/component work | `ui-ux-pro-max` |
| Non-trivial feature planning | `everything-claude-code:planner` → wait for confirm |
| API route design | `everything-claude-code:api-design` |
| Security (API routes, contact form) | `everything-claude-code:security-review` |
| Before deploy | `everything-claude-code:verification-loop` |

---

## Agents (`.claude/agents/`)

| Agent | Purpose |
|-------|---------|
| `portfolio-reviewer` | Code review for Astro/React misuse, theme violations, R3F perf, a11y |
| `portfolio-planner` | Section planning considering animation budget + Notion schema |

---

## Commands

```bash
pnpm dev          # Dev server → http://localhost:4321
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm astro check  # Type check .astro files
```

---

## Content Privacy

- **KitchenSync** → Show by name as "KitchenSync" — AI-first back-office OS for restaurants (multi-agent orchestration, real-time streaming, voice interfaces). Never reveal internal code name "KAi".
- **Mi Cita** → "Full-stack SaaS platform for the Colombian market" (no AI scheduling mention)
- **Canary Clean** → excluded entirely
