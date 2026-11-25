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
