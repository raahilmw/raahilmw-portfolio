// Keep Scroll Craft scoped to the map. The links and the base route work without motion.
(() => {
  const map = document.querySelector('.research-map');
  if (!map || !window.ScrollCraft || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let instance, onScreen = false, pageActive = true;

  // This is the last section. Its scroll range ends at the footer, especially on tall screens.
  function measureRoute() {
    const rect = map.getBoundingClientRect();
    const remaining = document.documentElement.scrollHeight - (rect.top + window.scrollY);
    const lastProgress = Math.min(.68, remaining / (window.innerHeight + rect.height));
    map.style.setProperty('--trace-speed', (1.12 / Math.max(.08, lastProgress * .93)).toFixed(3));
  }
  function sync() {
    if (onScreen && pageActive && !reduced.matches && !document.hidden) {
      if (!instance) {
        measureRoute();
        instance = window.ScrollCraft.mount(map.parentElement);
      }
    } else if (instance) {
      instance.destroy();
      instance = null;
    }
  }
  const observer = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  observer.observe(map);
  window.addEventListener('resize', () => { if (instance) measureRoute(); }, { passive: true });
  document.fonts?.ready.then(() => { if (instance) measureRoute(); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => { pageActive = false; sync(); });
  window.addEventListener('pageshow', () => { pageActive = true; sync(); });
})();
