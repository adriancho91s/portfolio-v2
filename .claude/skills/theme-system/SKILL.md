---
name: theme-system
description: Enforces correct token usage and dual-theme patterns. Invoke before touching any colors, ThemeToggle, CSS variables, or dark/light mode logic.
allowed-tools: Read, Edit
---

## Step 1 — Use CSS custom properties, never hardcoded colors

```astro
<!-- ✅ Correct -->
<div style="background: var(--bg-elevated); color: var(--foreground)">

<!-- ❌ Wrong — will break the other theme -->
<div style="background: #0a0a0c; color: #EDEDEF">
```

## Step 2 — Pick the right token

| Token | Dark | Light | Use for |
|-------|------|-------|---------|
| `--bg-deep` | `#050506` | `#FAFAFA` | Page background |
| `--bg-elevated` | `#0a0a0c` | `#FFFFFF` | Cards, sections |
| `--bg-surface` | `rgba(255,255,255,0.05)` | `rgba(0,0,0,0.03)` | Subtle surfaces |
| `--foreground` | `#EDEDEF` | `#1A1A2E` | Primary text |
| `--foreground-muted` | `#8A8F98` | `#64748B` | Secondary text |
| `--accent` | `#5E6AD2` | `#4F46E5` | Primary accent |
| `--accent-glow` | `rgba(94,106,210,0.2)` | `rgba(79,70,229,0.15)` | Glow behind CTAs |
| `--accent-secondary` | `#00D4FF` | `#0891B2` | AI/tech highlights |
| `--border` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` | Card borders |
| `--radius` | `16px` | `16px` | Card border radius |

## Step 3 — Verify initial theme script is in BaseLayout.astro

This inline script must run before any CSS to prevent flash.
**Must use modern JS (ES2018+):** `const`/`let`, arrow functions — NEVER `var`.

```html
<script is:inline>
  (function () {
    const COLORS = { dark: '#050506', light: '#f8f9fc' };
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored === 'light' || stored === 'dark'
      ? stored
      : prefersDark ? 'dark' : 'light';

    document.documentElement.dataset.theme = theme;
    syncThemeColor(theme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        const t = e.matches ? 'dark' : 'light';
        document.documentElement.dataset.theme = t;
        syncThemeColor(t);
      }
    });

    function syncThemeColor(t) {
      document.querySelectorAll('meta[name="theme-color"]')
        .forEach((m) => { m.content = COLORS[t]; });
    }
  })();
</script>
```

## Step 4 — Theme toggle calls `toggleTheme()` from `src/lib/theme.ts`

The propagation animation:
1. Get toggle button coordinates
2. Calculate radius to cover viewport diagonal
3. Create overlay div with `clip-path: circle(0px at x y)`
4. Check `prefers-reduced-motion` — if true, skip animation, just set attribute
5. Animate `clip-path` to `circle(maxRadius at x y)` over 500ms
6. On `transitionend`: set `data-theme`, save to `localStorage`, remove overlay
7. **Sync `<meta name="theme-color">`** — `applyTheme()` updates all theme-color meta tags so browser chrome/status bar matches the active theme

## Step 5 — Verify `prefers-reduced-motion` is in global.css

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Step 6 — Test both themes after any visual change

Dark mode and light mode must both be checked — what looks right in dark can fail contrast ratios in light.
