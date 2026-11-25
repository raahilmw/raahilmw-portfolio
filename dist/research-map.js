// Draw the trail against the scroll range actually available before the footer.
(() => {
  const map = document.querySelector('.research-map');
  if (!map || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, listening = false, frame = 0;

  function draw() {
    frame = 0;
    const rect = map.getBoundingClientRect();
    const height = document.documentElement.clientHeight;
    const remaining = document.documentElement.scrollHeight - (rect.top + scrollY);
    const travel = Math.max(1, Math.min(height + rect.height, remaining) * .93);
    const progress = Math.min(1, Math.max(0, (height - rect.top) / travel));
    map.style.setProperty('--trail-reveal', (1 - progress).toFixed(3));
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }
  function sync() {
    const active = visible && !document.hidden && !reduced.matches;
    if (active === listening) return;
    listening = active;
    if (active) {
      schedule();
      window.addEventListener('scroll', schedule, {passive:true});
      window.addEventListener('resize', schedule);
    } else {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
      frame = 0;
      map.style.removeProperty('--trail-reveal');
    }
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(map);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
})();
