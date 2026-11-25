// The Blender turntable and its still share a camera. Sample the displayed pose
// so its face, buttons and case all return to their original positions.
(() => {
  const surface = document.querySelector('.device-plane');
  if (!surface) return;
  const canvas = surface.querySelector('.device-canvas');
  const context = canvas.getContext('2d', {willReadFrequently:true});
  if (!context) return;

  const toggle = document.querySelector('.rotation-toggle');
  const intro = document.querySelector('#site-intro');
  const inspector = document.querySelector('#flipper-inspector');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const atlas = new Image();
  const {width, height} = canvas;
  const frames = 72, columns = 9, turnDuration = 20000;
  let loaded = false, requested = false, visible = !('IntersectionObserver' in window);
  let paused = false, handle = 0, previous = null, frame = 0;
  let spread = 0, target = 0, releaseTimer, dots = [];

  function available() {
    return visible && !reduced.matches && !document.hidden && !intro?.open && !inspector?.open;
  }

  function tile(index, alpha) {
    context.globalAlpha = alpha;
    context.drawImage(atlas, index % columns * width, Math.floor(index / columns) * height,
      width, height, 0, 0, width, height);
  }

  function paintPose(opacity = 1) {
    context.clearRect(0, 0, width, height);
    if (!opacity) return;
    const first = Math.floor(frame);
    const fraction = frame - first;
    tile(first, (1 - fraction) * opacity);
    if (fraction) {
      context.globalCompositeOperation = 'lighter';
      tile((first + 1) % frames, fraction * opacity);
      context.globalCompositeOperation = 'source-over';
    }
    context.globalAlpha = 1;
  }

  function sample(originX, originY) {
    paintPose();
    const rgba = context.getImageData(0, 0, width, height).data;
    dots = [];
    for (let y = 0; y < height; y += 5) {
      for (let x = (y % 2) * 2; x < width; x += 5) {
        const i = (y * width + x) * 4;
        if (rgba[i + 3] < 128) continue;
        const dx = x - originX, dy = y - originY;
        const distance = Math.hypot(dx, dy);
        const grain = Math.random();
        const angle = Math.atan2(dy, dx) + (grain - .5) * 1.75;
        const reach = 15 + 38 * grain;
        dots.push({
          x, y, dx:Math.cos(angle) * reach, dy:Math.sin(angle) * reach - grain * 7,
          delay:Math.min(.34, distance / width * .45), size:1 + 1.55 * grain,
          color:'rgb(' + rgba[i] + ',' + rgba[i + 1] + ',' + rgba[i + 2] + ')'
        });
      }
    }
  }

  function paintScatter() {
    const fade = spread * spread * (3 - 2 * spread);
    paintPose(1 - fade);
    context.globalAlpha = fade;
    for (const dot of dots) {
      const t = Math.max(0, (spread - dot.delay) / (1 - dot.delay));
      const travel = t * t * (3 - 2 * t);
      context.fillStyle = dot.color;
      context.fillRect(dot.x + travel * dot.dx, dot.y + travel * dot.dy, dot.size, dot.size);
    }
    context.globalAlpha = 1;
  }

  function wake() {
    if (!handle && loaded && available()) handle = requestAnimationFrame(tick);
  }

  function tick(time) {
    handle = 0;
    if (!available()) { previous = null; return; }
    const elapsed = previous === null ? 0 : time - previous;
    if (previous !== null && elapsed < 1000 / 30 - 1) { wake(); return; }
    previous = time;
    const dt = Math.min(80, elapsed);
    if (spread !== target) {
      const delta = dt / (target ? 620 : 560);
      spread = target ? Math.min(1, spread + delta) : Math.max(0, spread - delta);
    } else if (!spread && !paused) {
      frame = (frame + dt * frames / turnDuration) % frames;
    }
    if (spread) paintScatter();
    else {
      paintPose();
      if (!target) dots = [];
    }
    if (spread !== target || (!paused && !spread)) wake();
    else previous = null;
  }

  function restore() {
    clearTimeout(releaseTimer);
    target = 0;
    wake();
  }

  function scatter(event) {
    if (!loaded || !available()) return;
    clearTimeout(releaseTimer);
    if (!dots.length) {
      const bounds = surface.getBoundingClientRect();
      const x = event ? (event.clientX - bounds.left) * width / bounds.width : width / 2;
      const y = event ? (event.clientY - bounds.top) * height / bounds.height : height / 2;
      sample(x, y);
    }
    target = 1;
    wake();
  }

  function sync() {
    if (!available()) {
      cancelAnimationFrame(handle);
      clearTimeout(releaseTimer);
      handle = 0; previous = null; target = 0; spread = 0; dots = [];
      if (loaded) paintPose();
    }
    const interactive = loaded && !reduced.matches;
    surface.disabled = !interactive;
    surface.classList.toggle('has-frame', interactive);
    toggle.hidden = !interactive;
    if (!available()) return;
    if (!requested && !navigator.connection?.saveData) {
      requested = true;
      atlas.src = canvas.dataset.atlas;
    }
    wake();
  }

  atlas.onload = () => {
    loaded = atlas.naturalWidth === columns * width && atlas.naturalHeight === frames / columns * height;
    if (loaded) paintPose();
    sync();
  };

  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.classList.toggle('is-paused', paused);
    const label = paused ? 'Resume rotation' : 'Pause rotation';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    wake();
  });
  surface.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' || (event.pointerType === 'pen' && !event.buttons)) scatter(event);
  });
  surface.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') restore(); });
  surface.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    scatter(event);
    surface.setPointerCapture?.(event.pointerId);
  });
  surface.addEventListener('pointerup', event => {
    if (event.pointerType !== 'mouse') releaseTimer = setTimeout(restore, 700);
  });
  surface.addEventListener('pointercancel', restore);
  surface.addEventListener('click', event => {
    if (event.detail !== 0) return;
    scatter();
    releaseTimer = setTimeout(restore, 930);
  });
  surface.addEventListener('blur', restore);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(surface);
  }
  reduced.addEventListener('change', sync);
  for (const event of ['visibilitychange', 'arrivalstart', 'arrivalcomplete', 'flipperinspectopen', 'flipperinspectclose']) {
    document.addEventListener(event, sync);
  }
  window.addEventListener('pageshow', sync);
  sync();
})();
