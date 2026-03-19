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
  // Uses CSS transitions — more reliable than Web Animations API for clip-path
  // in WebKit. Key: set initial state, force reflow, then set transition + end state.
  const newBg = next === 'dark' ? '#050506' : '#f8f9fc';
  const maxR = Math.ceil(
    Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  ) + 10;

  const start = `circle(0px at ${x}px ${y}px)`;
  const end   = `circle(${maxR}px at ${x}px ${y}px)`;
  const ease  = 'cubic-bezier(0.22,1,0.36,1)';

  const overlay = document.createElement('div');
  // Base styles — NO clip-path here yet, set via property to avoid prefix conflicts
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:9999', 'pointer-events:none',
    `background:${newBg}`,
    'will-change:clip-path',
    'transform:translateZ(0)',         // GPU layer
    '-webkit-transform:translateZ(0)', // WebKit GPU layer
  ].join(';');

  // Set both prefixed + unprefixed so WebKit picks the right one
  overlay.style.setProperty('-webkit-clip-path', start);
  overlay.style.setProperty('clip-path', start);

  document.body.appendChild(overlay);

  // Force layout — required before setting transition so WebKit registers start state
  void overlay.getBoundingClientRect();

  // Set transition on both properties
  overlay.style.transition = [
    `clip-path 1000ms ${ease}`,
    `-webkit-clip-path 1000ms ${ease}`,
  ].join(',');

  // Apply end state — triggers the transition
  overlay.style.setProperty('-webkit-clip-path', end);
  overlay.style.setProperty('clip-path', end);

  // Remove after transition (listen for whichever property fires first)
  overlay.addEventListener('transitionend', () => {
    applyTheme(next);
    overlay.remove();
  }, { once: true });
}

const THEME_COLORS: Record<Theme, string> = {
  dark: '#050506',
  light: '#f8f9fc',
};

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);

  // Sync browser chrome / mobile status-bar color
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => {
      meta.content = THEME_COLORS[theme];
    });
}
