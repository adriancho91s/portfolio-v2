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

  // Fallback: expand new-theme circle from button, then swap — mirrors VTA direction
  const maxR = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  const newBg = next === 'dark' ? '#050506' : '#fafafa';

  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '9999',
    pointerEvents: 'none',
    background: newBg,
    clipPath: `circle(0px at ${x}px ${y}px)`,
    willChange: 'clip-path',
  });
  document.body.appendChild(overlay);

  // Double rAF: let the browser commit the initial clip before animating
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.transition = 'clip-path 900ms cubic-bezier(0.22, 1, 0.36, 1)';
      overlay.style.clipPath = `circle(${maxR}px at ${x}px ${y}px)`;
    });
  });

  // Apply theme once overlay fully covers — bg color matches so the swap is invisible
  overlay.addEventListener('transitionend', () => {
    applyTheme(next);
    overlay.remove();
  }, { once: true });
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
}
