export type Theme = 'dark' | 'light';

export function getInitialTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'dark';
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function toggleTheme(buttonEl: HTMLElement): void {
  const current = (document.documentElement.dataset.theme as Theme) ?? 'dark';
  const next: Theme = current === 'dark' ? 'light' : 'dark';

  // Respect reduced motion — instant switch
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyTheme(next);
    return;
  }

  // Store origin for the CSS animation
  const rect = buttonEl.getBoundingClientRect();
  const x = Math.round(rect.left + rect.width / 2);
  const y = Math.round(rect.top + rect.height / 2);
  document.documentElement.style.setProperty('--vt-x', `${x}px`);
  document.documentElement.style.setProperty('--vt-y', `${y}px`);

  // View Transitions API: captures old state, applies new theme, animates the reveal
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(() => applyTheme(next));
    return;
  }

  // Fallback for browsers without View Transitions API (Safari < 18.2, Firefox).
  // Uses Web Animations API for a clip-path circle reveal — GPU-composited,
  // works on iOS Safari 13.4+. Falls back to opacity fade if animate() is absent.
  const newBg = next === 'dark' ? '#050506' : '#f8f9fc';
  const maxR = Math.ceil(
    Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  ) + 10;

  const overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:9999', 'pointer-events:none',
    `background:${newBg}`,
    `clip-path:circle(0px at ${x}px ${y}px)`,
    `-webkit-clip-path:circle(0px at ${x}px ${y}px)`,
    'will-change:clip-path',
    // Promote to GPU layer for smooth compositing on iOS
    'transform:translateZ(0)',
    '-webkit-transform:translateZ(0)',
  ].join(';');
  document.body.appendChild(overlay);

  if (typeof overlay.animate === 'function') {
    const anim = overlay.animate(
      [
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${maxR}px at ${x}px ${y}px)` },
      ],
      { duration: 1000, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
    );
    anim.onfinish = () => {
      applyTheme(next);
      overlay.remove();
    };
  } else {
    // Last-resort: opacity fade for very old browsers
    overlay.style.clipPath = '';
    (overlay.style as CSSStyleDeclaration & { webkitClipPath?: string }).webkitClipPath = '';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 280ms ease';
    requestAnimationFrame(() => requestAnimationFrame(() => { overlay.style.opacity = '1'; }));
    overlay.addEventListener('transitionend', () => {
      applyTheme(next);
      overlay.remove();
    }, { once: true });
  }
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
}
