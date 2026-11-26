// Move the mask and the magnified film around the same optical centre.
(() => {
  const figure = document.querySelector('.inspection-lens');
  if (!figure) return;
  const stage = figure.querySelector('.optic-stage');
  const rows = [...stage.querySelectorAll(':scope > .sample-film .sample-row')];
  const stops = [...figure.querySelectorAll('.focus-stop input')];
  const intro = document.getElementById('site-intro');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const homeX = .54;
  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
  let rowY = [.384, .5, .616];
  let parked = 1;
  let x = homeX, y = .5, targetX = x, targetY = y;
  let visible = false, pendingReveal = true, raf = 0, lastTime = 0, glintTimer;
  let contact = null, bridges = [], found = false;

  function draw() {
    stage.style.setProperty('--lens-x', (x * 100).toFixed(3) + 'cqw');
    stage.style.setProperty('--lens-y', (y * 100).toFixed(3) + 'cqw');
  }

  function stopFrames() {
    cancelAnimationFrame(raf);
    raf = 0;
    lastTime = 0;
  }

  function advance(time) {
    const dt = lastTime ? Math.min(time - lastTime, 64) : 16;
    lastTime = time;
    const blend = 1 - Math.exp(-dt / 84);
    x += (targetX - x) * blend;
    y += (targetY - y) * blend;
    if (Math.abs(targetX - x) + Math.abs(targetY - y) < .00045) {
      x = targetX; y = targetY;
      stopFrames();
    } else {
      raf = requestAnimationFrame(advance);
    }
    draw();
  }

  function move(nextX, nextY) {
    targetX = nextX; targetY = nextY;
    if (reduced.matches || !visible || document.hidden) {
      stopFrames();
      x = targetX; y = targetY;
      draw();
    } else if (!raf && (x !== targetX || y !== targetY)) {
      raf = requestAnimationFrame(advance);
    }
  }

  function focusRow(index) {
    parked = index;
    stops[index].checked = true;
    move(homeX, rowY[index]);
  }

  function findDetail(pointerX, pointerY) {
    if (found || reduced.matches || !visible || document.hidden) return;
    if (Math.abs(pointerX - homeX) > .075 || Math.abs(pointerY - rowY[1]) > .05) return;
    found = true;
    stage.classList.add('is-found');
  }

  function measure() {
    const box = stage.getBoundingClientRect();
    if (!box.height) return;
    rowY = rows.map(row => {
      const rect = row.getBoundingClientRect();
      return (rect.top + rect.height / 2 - box.top) / box.height;
    });
    move(homeX, rowY[parked]);
  }

  function nearestRow(relativeY) {
    return rowY.reduce((best, center, i) =>
      Math.abs(relativeY - center) < Math.abs(relativeY - rowY[best]) ? i : best, 0);
  }

  function clearEffects() {
    clearTimeout(glintTimer);
    stage.classList.remove('is-revealing');
    for (const beam of bridges) {
      beam.getAnimations().forEach(animation => animation.cancel());
      beam.remove();
    }
    bridges = [];
  }

  function sweep() {
    stage.classList.add('is-revealing');
    clearTimeout(glintTimer);
    glintTimer = setTimeout(() => stage.classList.remove('is-revealing'), 1340);
  }

  // The modal and the page crossfade for 420 ms. Paint the same moving line
  // on both so the fingerprint can hand its last reflection to the metal rim.
  function passLight() {
    const reader = intro?.querySelector('.identity-glass');
    if (!reader || !stage.animate) return;
    const source = reader.getBoundingClientRect();
    const bench = stage.getBoundingClientRect();
    const startX = source.left, startY = source.bottom - 2;
    const endX = bench.left + bench.width * (homeX - .18);
    const endY = bench.top + bench.height * rowY[1] - bench.width * .203;
    const length = Math.min(200, source.width);
    function pose(cx, cy, angle, scale, opacity, offset) {
      return {transform:'translate3d(' + cx + 'px,' + cy + 'px,0) rotate(' + angle + 'deg) scaleX(' + scale + ')',
        opacity,offset};
    }
    const frames = [
      pose(startX, startY, 0, 1, 0, 0),
      pose(startX, startY, 0, 1, .85, .12),
      pose(startX + (endX - startX) * .76, startY + (endY - startY) * .78, -15, .48, .72, .55),
      pose(endX, endY, -38, .17, 0, 1)
    ];
    for (const parent of [document.body, intro]) {
      const beam = document.createElement('i');
      beam.className = 'optic-bridge';
      beam.setAttribute('aria-hidden', 'true');
      beam.style.width = length + 'px';
      parent.appendChild(beam);
      bridges.push(beam);
      const animation = beam.animate(frames, {duration:790,easing:'cubic-bezier(.33,0,.2,1)',fill:'forwards'});
      animation.onfinish = () => {
        beam.remove();
        bridges = bridges.filter(item => item !== beam);
      };
    }
  }

  function reveal(fromScan = false) {
    if (!pendingReveal || !visible || document.hidden) return;
    if (intro?.open && !fromScan) return;
    pendingReveal = false;
    if (reduced.matches) return;
    x = .48; y = rowY[0];
    draw();
    move(homeX, rowY[parked]);
    if (fromScan) passLight();
    sweep();
  }

  for (const [i, stop] of stops.entries()) {
    stop.addEventListener('change', () => {
      if (stop.checked) { focusRow(i); findDetail(homeX, rowY[i]); }
    });
  }
  stage.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || document.hidden) return;
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = (event.clientX - r.left) / r.width;
    const py = (event.clientY - r.top) / r.height;
    move(clamp(px, .285, .715), clamp(py, rowY[0], rowY[2]));
    findDetail(px, py);
  }, {passive:true});
  stage.addEventListener('pointerleave', () => { if (!contact) focusRow(parked); });
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    contact = {id:event.pointerId, x:event.clientX, y:event.clientY};
  });
  stage.addEventListener('pointerup', event => {
    const start = contact;
    contact = null;
    if (!start || event.pointerId !== start.id || Math.hypot(event.clientX-start.x, event.clientY-start.y) > 11) return;
    const r = stage.getBoundingClientRect();
    const index = nearestRow((event.clientY-r.top) / r.height);
    focusRow(index);
    findDetail(homeX, rowY[index]);
  });
  stage.addEventListener('pointercancel', () => { contact = null; focusRow(parked); });
  window.addEventListener('pointerup', () => { contact = null; });

  function visibility(inView) {
    visible = inView;
    if (!visible || document.hidden) {
      clearEffects();
      contact = null;
      focusRow(parked);
      return;
    }
    reveal();
  }

  function viewportCheck() {
    const rect = stage.getBoundingClientRect();
    visibility(rect.bottom > 0 && rect.top < window.innerHeight);
  }

  document.addEventListener('arrivalstart', () => {
    clearEffects(); stopFrames();
    pendingReveal = true;
    found = false;
    stage.classList.remove('is-found');
  });
  document.addEventListener('arrivalreveal', () => reveal(true));
  document.addEventListener('arrivalcomplete', () => reveal());
  document.addEventListener('visibilitychange', viewportCheck);
  reduced.addEventListener('change', () => {
    clearEffects();
    focusRow(parked);
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => visibility(entry.isIntersecting)).observe(stage);
  } else {
    window.addEventListener('scroll', viewportCheck, {passive:true});
  }
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(stage);
  else window.addEventListener('resize', measure, {passive:true});
  window.addEventListener('pageshow', viewportCheck);
  window.addEventListener('pagehide', () => visibility(false));
  figure.querySelector('.focus-stops').hidden = false;
  figure.querySelector('.optic-hint').hidden = false;
  stage.classList.add('is-interactive');
  measure();
  viewportCheck();
})();
