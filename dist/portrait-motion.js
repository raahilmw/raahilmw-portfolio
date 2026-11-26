// The print remains fully composed without scripting. Only decorative layers track a pointer.
(() => {
  const section = document.querySelector('.profile-spread');
  const scene = section?.querySelector('.print-scene');
  if (!scene) return;

  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  if ('IntersectionObserver' in window) {
    const intro = document.querySelector('#site-intro');
    let inView = false;
    const reveal = new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting);
      showWhenReady();
    }, { threshold: .12 });
    function showWhenReady() {
      if (!inView || intro?.open) return;
      if (motion.matches) section.classList.add('profile-landed');
      reveal.disconnect();
      intro?.removeEventListener('close', showWhenReady);
    }
    intro?.addEventListener('close', showWhenReady);
    reveal.observe(section);
  }

  let frame = 0, x = 0, y = 0;
  function center() {
    cancelAnimationFrame(frame);
    frame = 0;
    scene.style.removeProperty('--mx');
    scene.style.removeProperty('--my');
  }
  function draw() {
    frame = 0;
    const rect = scene.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const normal = (value, start, size) => Math.max(-1, Math.min(1, 2 * (value - start) / size - 1));
    scene.style.setProperty('--mx', normal(x, rect.left, rect.width).toFixed(3));
    scene.style.setProperty('--my', normal(y, rect.top, rect.height).toFixed(3));
  }
  scene.addEventListener('pointermove', event => {
    if (!motion.matches || !finePointer.matches || event.pointerType === 'touch') return;
    x = event.clientX;
    y = event.clientY;
    if (!frame) frame = requestAnimationFrame(draw);
  }, { passive: true });
  scene.addEventListener('pointerleave', center);
  scene.addEventListener('pointercancel', center);
  finePointer.addEventListener('change', center);
  motion.addEventListener('change', () => {
    section.classList.remove('profile-landed');
    center();
  });
})();

// A short pulse follows the visible logos. Each seal can replay independently.
document.querySelectorAll('.experience-list').forEach(list => {
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const rows = Array.from(list.children);
  let observer;

  function trace(row, delay = 0) {
    if (!motion.matches || row.classList.contains('is-tracing')) return;
    row.style.setProperty('--delay', delay + 'ms');
    row.classList.add('is-tracing');
  }

  for (const row of rows) {
    const seal = row.querySelector('.experience-logo');
    seal.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') trace(row);
    });
    seal.addEventListener('click', () => trace(row));
    row.addEventListener('animationend', event => {
      if (event.animationName === 'experience-orbit') row.classList.remove('is-tracing');
    });
  }

  function syncMotion() {
    observer?.disconnect();
    for (const row of rows) {
      row.classList.remove('is-tracing');
      row.querySelector('.experience-logo').disabled = !motion.matches;
    }
    if (!motion.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting && entry.intersectionRatio >= .4);
      visible.forEach((entry, index) => {
        trace(entry.target, index * 260);
        observer.unobserve(entry.target);
      });
    }, { threshold: .4 });
    rows.forEach(row => observer.observe(row));
  }

  motion.addEventListener('change', syncMotion);
  syncMotion();
});
