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
  // Uses opacity fade — avoids clip-path which is janky on those engines.
  const newBg = next === 'dark' ? '#050506' : '#f8f9fc';

  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '9999',
    pointerEvents: 'none',
    background: newBg,
    opacity: '0',
    transition: 'opacity 280ms ease',
  });
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
  });

  overlay.addEventListener('transitionend', () => {
    applyTheme(next);
    overlay.style.opacity = '0';
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  }, { once: true });
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
}
