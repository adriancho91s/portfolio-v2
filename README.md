# portfolio-v2

Personal portfolio for Adrian Gaitan — Full Stack Engineer & AI Systems.

Built with Astro 5, React Islands, React Three Fiber, and Tailwind CSS v4. Features a scroll-morphing 3D neural network, dual dark/light theme with View Transitions, and a fully animated timeline.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 5 |
| UI Islands | React 19 |
| 3D | React Three Fiber + Three.js |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion + CSS scroll-driven |
| Fonts | Inter + JetBrains Mono |
| Deploy | Vercel |

## Features

- **Scroll-morphing 3D scene** — neural network cluster that transforms into a DNA helix, atomic orbits, and icosahedron crystal as you scroll. Desktop only; mobile gets a CSS fallback.
- **Dual theme** — dark and light mode with a circular clip-path reveal transition originating from the toggle button. Uses the View Transitions API with a CSS fallback.
- **Animated timeline** — scroll-fill connector line with pulse animations and a parallel track visualizing concurrent engagements.
- **Color-coded tech tags** — backend and infrastructure tags use distinct accent colors with hover glow.
- **Scroll-spy navigation** — active section highlighted in the navbar via IntersectionObserver.
- **Full SEO** — Open Graph, Twitter Card, JSON-LD structured data, canonical URLs, favicons.
- **Accessibility** — skip link, reduced-motion support, keyboard navigation, ARIA labels.

## Dev

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build
pnpm preview
pnpm astro check
```

## Project structure

```
src/
├── components/
│   ├── Hero/           # Static layout + R3F scene (HeroScene.tsx)
│   ├── Timeline/       # Static wrapper + Framer Motion interactive (TimelineInteractive.tsx)
│   ├── Skills/         # Static + animated skill grid (SkillsInteractive.tsx)
│   ├── Projects/       # Project showcase grid
│   ├── About/          # Bio section
│   ├── Contact/        # Contact + socials
│   ├── Navigation/     # Glassmorphism navbar with scroll-spy
│   ├── Footer/         # Footer with social links
│   ├── ThemeToggle/    # Dark/light toggle with propagation animation
│   └── ui/             # Shared primitives (ShimmerCard)
├── layouts/
│   └── BaseLayout.astro  # HTML shell, SEO meta, theme flash prevention
├── lib/
│   ├── theme.ts          # Theme toggle logic + View Transitions
│   └── utils.ts          # cn() helper
├── styles/
│   └── global.css        # Design tokens, dual theme, base styles
└── pages/
    └── index.astro       # Single-page entry
```

## Design tokens

Theme is defined entirely via CSS custom properties in `global.css`. Never hardcode colors in components — always use `var(--token-name)` or the corresponding Tailwind utility (`text-accent`, `bg-surface-elevated`, etc.).

Key tokens: `--accent` (indigo), `--accent-secondary` (cyan), `--bg-deep`, `--bg-elevated`, `--foreground`, `--border`.
