// The presenter only writes transforms in response to input.
(() => {
  const stage = document.querySelector('#artifact-stage');
  if (!stage) return;
  const surface = stage.querySelector('.chip-viewport');
  const inspect = stage.querySelector('#artifact-control');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  let point, frame = 0, touch = null;

  function rest() {
    cancelAnimationFrame(frame);
    frame = 0;
    touch = null;
    stage.style.removeProperty('--yaw');
    stage.style.removeProperty('--pitch');
  }
  function render() {
    frame = 0;
    const rect = surface.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const fraction = (p, start, span) => Math.max(-1, Math.min(1, 2*(p-start)/span-1));
    const yaw = fraction(point.x, rect.left, rect.width) * 14;
    const pitch = fraction(point.y, rect.top, rect.height) * -7;
    stage.style.setProperty('--yaw', yaw.toFixed(2) + 'deg');
    stage.style.setProperty('--pitch', pitch.toFixed(2) + 'deg');
  }
  surface.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' && event.isPrimary) touch = {id:event.pointerId, x:event.clientX, y:event.clientY};
  }, {passive:true});
  surface.addEventListener('pointermove', event => {
    if (reduced.matches || document.hidden) return;
    if (event.pointerType === 'touch') {
      if (!touch || touch.id !== event.pointerId || Math.abs(event.clientX-touch.x) < 8 ||
          Math.abs(event.clientX-touch.x) < Math.abs(event.clientY-touch.y)) return;
    } else if (!fine.matches) return;
    point = {x:event.clientX, y:event.clientY};
    if (!frame) frame = requestAnimationFrame(render);
  }, {passive:true});
  surface.addEventListener('pointerup', event => { if (event.pointerType === 'touch') rest(); });
  for (const name of ['pointercancel','pointerleave']) surface.addEventListener(name, rest);
  reduced.addEventListener('change', rest);
  fine.addEventListener('change', rest);
  window.addEventListener('blur', rest);
  inspect.addEventListener('click', () => {
    const open = stage.classList.toggle('is-open');
    inspect.setAttribute('aria-pressed', String(open));
  });
  inspect.hidden = false;
})();
