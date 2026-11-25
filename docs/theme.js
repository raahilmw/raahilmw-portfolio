// Apply the saved appearance before the styles paint to avoid a theme flash.
(() => {
  const root = document.documentElement;
  const storageKey = 'raahilmw-appearance';
  const system = window.matchMedia('(prefers-color-scheme: light)');
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch { /* Storage is optional. */ }
  let hasPreference = saved === 'light' || saved === 'dark';
  function apply(theme) {
    root.dataset.theme = theme;
    const target = theme === 'dark' ? 'light' : 'dark';
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.setAttribute('aria-label', `Switch to ${target} mode`);
      button.setAttribute('title', `Switch to ${target} mode`);
    });
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#eef3f8' : '#0b111b');
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }
  apply(hasPreference ? saved : system.matches ? 'light' : 'dark');
  document.addEventListener('DOMContentLoaded', () => {
    apply(root.dataset.theme);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let transition, target = root.dataset.theme, pulseTimer;
    document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
      target = (transition ? target : root.dataset.theme) === 'dark' ? 'light' : 'dark';
      const next = target;
      hasPreference = true;
      try { localStorage.setItem(storageKey, next); } catch { /* Storage is optional. */ }
      transition?.skipTransition();
      if (reduced.matches) { apply(next); return; }

      const bounds = button.getBoundingClientRect();
      const x = bounds.left + bounds.width / 2, y = bounds.top + bounds.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.style.setProperty('--eclipse-center', x + 'px ' + y + 'px');
      root.style.setProperty('--eclipse-radius', Math.ceil(radius) + 'px');
      if (document.startViewTransition) {
        const active = document.startViewTransition(() => { if (next === target) apply(next); });
        transition = active;
        active.finished.finally(() => { if (transition === active) transition = null; });
      } else {
        apply(next);
        root.classList.remove('theme-pulse');
        void button.offsetWidth;
        root.classList.add('theme-pulse');
        clearTimeout(pulseTimer);
        pulseTimer = setTimeout(() => root.classList.remove('theme-pulse'), 480);
      }
    }));
  });
  system.addEventListener('change', event => { if (!hasPreference) apply(event.matches ? 'light' : 'dark'); });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    saved = event.key === null ? null : event.newValue;
    hasPreference = saved === 'light' || saved === 'dark';
    apply(hasPreference ? saved : system.matches ? 'light' : 'dark');
  });
})();
