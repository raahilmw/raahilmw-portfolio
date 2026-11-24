// DOM buttons provide focus, names and touch hit targets. Matter owns the geometry.
(() => {
  const board = document.querySelector('.field-board');
  if (!board || !window.Matter) return;
  const { Engine, Bodies, Body, Composite, Sleeping } = window.Matter;
  const engine = Engine.create({ enableSleeping: true, positionIterations: 8 });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tiles = Array.from(board.querySelectorAll('.field-tile'), el => ({ el, body: null, hold: null }));
  const step = 1000 / 60;
  const gutter = 6;
  let width = 0, height = 0, frame = 0, previousTime = 0, remainder = 0;
  let dropped = false, visible = true, topLayer = 1;
  let lastScroll = window.scrollY, armedAt = lastScroll;

  function draw(tile) {
    const { position, angle } = tile.body;
    tile.el.style.transform = 'translate(' + (position.x - tile.w / 2) + 'px,' +
      (position.y - tile.h / 2) + 'px) rotate(' + angle + 'rad)';
  }
  function clamp(value, low, high) {
    return Math.max(low, Math.min(value, high));
  }
  function move(tile, x, y) {
    const { body } = tile;
    const c = Math.abs(Math.cos(body.angle)), s = Math.abs(Math.sin(body.angle));
    const halfX = (tile.w * c + tile.h * s) / 2 + gutter;
    const halfY = (tile.w * s + tile.h * c) / 2 + gutter;
    Body.setPosition(body, { x: clamp(x, halfX, width - halfX), y: clamp(y, halfY, height - halfY) });
    draw(tile);
  }
  function home(tile) {
    const { body, el } = tile;
    const narrow = window.matchMedia('(max-width: 700px)').matches;
    const x = Number(narrow ? el.dataset.mx : el.dataset.x);
    const y = Number(narrow ? el.dataset.my : el.dataset.y);
    Body.setAngle(body, Number(el.dataset.angle) * Math.PI / 180);
    move(tile, tile.w / 2 + x * (width - tile.w), tile.h / 2 + y * (height - tile.h));
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = previousTime = remainder = 0;
  }
  function advance(now) {
    frame = 0;
    remainder += Math.min(previousTime ? now - previousTime : step, 50);
    previousTime = now;
    while (remainder >= step) {
      Engine.update(engine, step);
      remainder -= step;
    }
    tiles.forEach(draw);
    if (tiles.some(({ body }) => !body.isStatic && !body.isSleeping)) {
      frame = requestAnimationFrame(advance);
    } else {
      previousTime = remainder = 0;
    }
  }
  function run() {
    if (!dropped || !visible || document.hidden || frame) return;
    if (reduced.matches) {
      // Compute the resting layout without showing intermediate motion.
      for (let i = 0; i < 240; i++) Engine.update(engine, step);
      tiles.forEach(draw);
    } else {
      frame = requestAnimationFrame(advance);
    }
  }
  function release(tile, fling = true) {
    const held = tile.hold;
    if (!held) return;
    tile.hold = null;
    tile.el.classList.remove('is-held');
    if (tile.el.hasPointerCapture(held.id)) tile.el.releasePointerCapture(held.id);
    Body.setStatic(tile.body, !dropped);
    if (dropped) {
      Sleeping.set(tile.body, false);
      if (fling && !reduced.matches && performance.now() - held.time < 100) {
        Body.setVelocity(tile.body, { x: held.vx, y: held.vy });
      }
      run();
    }
  }
  function reset() {
    if (!width) return;
    dropped = false;
    armedAt = lastScroll = window.scrollY;
    stop();
    tiles.forEach(tile => {
      release(tile, false);
      Body.setStatic(tile.body, true);
      Body.setVelocity(tile.body, { x: 0, y: 0 });
      Body.setAngularVelocity(tile.body, 0);
      home(tile);
    });
    board.dataset.state = 'floating';
  }
  function drop() {
    if (dropped || !width) return;
    dropped = true;
    board.dataset.state = 'falling';
    tiles.forEach(tile => {
      if (tile.hold) return;
      Body.setStatic(tile.body, false);
      Sleeping.set(tile.body, false);
      // The starting tilt determines the direction each tile tumbles.
      Body.setAngularVelocity(tile.body, Math.sign(tile.body.angle) * .009);
    });
    run();
  }
  function layout() {
    const w = board.clientWidth, h = board.clientHeight;
    if (!w || !h) return;
    if (w === width && h === height && tiles.every(t => t.w === t.el.offsetWidth && t.h === t.el.offsetHeight)) return;
    stop();
    const before = tiles.map(tile => tile.body && ({ x: tile.body.position.x / width, y: tile.body.position.y / height, angle: tile.body.angle }));
    tiles.forEach(tile => release(tile, false));
    stop();
    width = w; height = h;
    Composite.clear(engine.world, false);
    Engine.clear(engine);
    const wall = { isStatic: true, friction: .65, restitution: .12 };
    Composite.add(engine.world, [
      Bodies.rectangle(w / 2, h + 40, w + 160, 80, wall),
      Bodies.rectangle(w / 2, -40, w + 160, 80, wall),
      Bodies.rectangle(-40, h / 2, 80, h + 160, wall),
      Bodies.rectangle(w + 40, h / 2, 80, h + 160, wall)
    ]);
    tiles.forEach((tile, index) => {
      tile.w = tile.el.offsetWidth; tile.h = tile.el.offsetHeight;
      tile.body = Bodies.rectangle(w / 2, h / 2, tile.w, tile.h, {
        friction: .55, frictionAir: .014, restitution: .20, chamfer: { radius: 5 }
      });
      Body.setStatic(tile.body, !dropped);
      Composite.add(engine.world, tile.body);
      if (before[index]) {
        Body.setAngle(tile.body, before[index].angle);
        move(tile, before[index].x * w, before[index].y * h);
      } else home(tile);
    });
    board.dataset.ready = '';
    board.dataset.state = dropped ? 'falling' : 'floating';
    run();
  }
  tiles.forEach(tile => {
    const el = tile.el;
    el.addEventListener('pointerdown', event => {
      if (!tile.body || tile.hold || event.button !== 0) return;
      const bounds = board.getBoundingClientRect();
      const { position } = tile.body;
      tile.hold = { id: event.pointerId, dx: event.clientX - bounds.left - position.x,
        dy: event.clientY - bounds.top - position.y, vx: 0, vy: 0, time: performance.now() };
      Body.setStatic(tile.body, true);
      el.setPointerCapture(event.pointerId);
      el.classList.add('is-held');
      el.style.zIndex = ++topLayer;
    });
    el.addEventListener('pointermove', event => {
      const held = tile.hold;
      if (held?.id !== event.pointerId) return;
      const bounds = board.getBoundingClientRect();
      const prev = { ...tile.body.position };
      move(tile, event.clientX - bounds.left - held.dx, event.clientY - bounds.top - held.dy);
      const now = performance.now(), duration = Math.max(8, now - held.time);
      held.vx = clamp((tile.body.position.x - prev.x) * step / duration, -9, 9);
      held.vy = clamp((tile.body.position.y - prev.y) * step / duration, -9, 9);
      held.time = now;
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(name =>
      el.addEventListener(name, event => {
        if (tile.hold?.id === event.pointerId) release(tile, name === 'pointerup');
      }));
    el.addEventListener('keydown', event => {
      if (event.key === 'Home') { event.preventDefault(); reset(); return; }
      const dir = { ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1] }[event.key];
      if (!dir || !tile.body || tile.hold) return;
      event.preventDefault();
      el.style.zIndex = ++topLayer;
      const delta = event.shiftKey ? 28 : 12;
      move(tile, tile.body.position.x + delta * dir[0], tile.body.position.y + delta * dir[1]);
      Sleeping.set(tile.body, false);
      run();
    });
  });
  function onScroll() {
    const y = Math.max(0, window.scrollY);
    if (y <= 2 && dropped && y < lastScroll) reset();
    if (!dropped) {
      armedAt = Math.min(armedAt, y);
      if (y > lastScroll && y - armedAt >= 22) drop();
    }
    lastScroll = y;
  }
  document.querySelector('.reset-board').addEventListener('click', reset);
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : run());
  reduced.addEventListener('change', () => { stop(); run(); });
  layout();
  new ResizeObserver(layout).observe(board);
  if (document.fonts) document.fonts.ready.then(layout);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) run(); else stop();
  }).observe(board);
  // Restored scroll positions should agree with a visit that scrolled here.
  if (window.scrollY >= 22) drop();
})();
