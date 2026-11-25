// The document stays a working image link without scripting.
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const intro = document.querySelector('#site-intro');
  const sections = [...document.querySelectorAll('.credential-feature,.course-notes')];
  const active = new Set();
  const show = element => element.classList.add('is-seen');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          active.add(entry.target);
          if (!intro?.open) show(entry.target);
        } else active.delete(entry.target);
      });
    }, { threshold: .12 });
    sections.forEach(section => observer.observe(section));
  } else sections.forEach(show);
  document.addEventListener('arrivalcomplete', () => active.forEach(show));
  reduced.addEventListener('change', () => { if (reduced.matches) sections.forEach(show); });

  const viewer = document.querySelector('#certificate-viewer');
  const trigger = document.querySelector('[data-certificate-open]');
  if (!viewer || !trigger || typeof viewer.showModal !== 'function') return;
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', viewer.id);
  trigger.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (viewer.open) { event.preventDefault(); return; }
    try { viewer.showModal(); } catch { return; }
    event.preventDefault();
    root.classList.add('certificate-open');
    viewer.querySelector('[data-certificate-close]')?.focus({ preventScroll: true });
  });
  function close() { if (viewer.open) viewer.close(); }
  viewer.querySelector('[data-certificate-close]').addEventListener('click', close);
  viewer.addEventListener('cancel', event => { event.preventDefault(); close(); });
  viewer.addEventListener('close', () => {
    root.classList.remove('certificate-open');
    trigger.focus({ preventScroll: true });
  });
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const rect = viewer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
  });
})();
