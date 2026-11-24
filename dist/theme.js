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
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#eef3f9' : '#080f18');
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }
  apply(hasPreference ? saved : system.matches ? 'light' : 'dark');
  document.addEventListener('DOMContentLoaded', () => {
    apply(root.dataset.theme);
    document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      hasPreference = true;
      try { localStorage.setItem(storageKey, next); } catch { /* Still works for this visit. */ }
      apply(next);
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
