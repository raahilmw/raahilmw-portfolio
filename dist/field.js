// DOM buttons provide focus, names and touch hit targets. Matter owns the geometry.
(() => {
  const board = document.querySelector('.field-board');
  if (!board || !window.Matter) return;
  const profile = document.querySelector('.researcher-print');
  const intro = document.querySelector('#site-intro');
  const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = window.Matter;
  const engine = Engine.create({ enableSleeping: true, positionIterations: 8 });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tiles = Array.from(board.querySelectorAll('.field-tile'), (el, index) => ({ el, body: null, hold: null, anchor: null, phase: index * 2.39996 }));
  const step = 1000 / 60;
  const gutter = 6;
  let width = 0, height = 0, frame = 0, previousTime = 0, remainder = 0;
  let dropped = false, visible = true, topLayer = 1;
  let floor = null, lastScrollY = window.scrollY;
  engine.gravity.y = 0;

  function draw(tile) {
    const { position, angle } = tile.body;
    tile.el.style.transform = 'translate(' + (position.x - tile.w / 2) + 'px,' +
      (position.y - tile.h / 2) + 'px) rotate(' + angle + 'rad)';
    const fadeDistance = Math.min(window.innerHeight * .72, 620);
    tile.el.style.opacity = dropped ? clamp((height + fadeDistance - position.y) / fadeDistance, 0, 1) : 1;
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
  // Pack measured, rotated labels into loose rows. The field can grow on small screens.
  function arrange(boardWidth) {
    const margin = boardWidth < 600 ? 12 : 22;
    const gap = boardWidth < 600 ? 8 : 16;
    const rows = [];
    let row;
    tiles.forEach(tile => {
      tile.w = tile.el.offsetWidth;
      tile.h = tile.el.offsetHeight;
      tile.tilt = Number(tile.el.dataset.angle) * Math.PI / 180;
      const cos = Math.abs(Math.cos(tile.tilt)), sin = Math.abs(Math.sin(tile.tilt));
      tile.span = tile.w * cos + tile.h * sin;
      const rise = tile.w * sin + tile.h * cos;
      if (!row || row.width + gap + tile.span > boardWidth - margin * 2) {
        row = { tiles: [], width: 0, height: 0 };
        rows.push(row);
      }
      if (row.tiles.length) row.width += gap;
      row.width += tile.span;
      row.height = Math.max(row.height, rise);
      row.tiles.push(tile);
    });
    const contentHeight = rows.reduce((sum, item) => sum + item.height + gap, margin * 2 - gap);
    board.style.minHeight = Math.ceil(contentHeight) + 'px';
    const space = Math.max(0, board.clientHeight - contentHeight) / (rows.length + 1);
    let y = margin + space;
    rows.forEach((item, i) => {
      const extra = Math.max(0, boardWidth - 2 * margin - item.width);
      const stretch = extra / (item.tiles.length + 1);
      let x = margin + stretch * (i % 2 ? 1.3 : .7);
      item.tiles.forEach(tile => {
        tile.origin = { x: x + tile.span / 2, y: y + item.height / 2 };
        x += tile.span + gap + stretch;
      });
      y += item.height + gap + space;
    });
  }
  function home(tile) {
    const { body } = tile;
    Body.setAngle(body, tile.tilt);
    move(tile, tile.origin.x, tile.origin.y);
    tile.anchor = { ...body.position, angle: body.angle };
    if (!reduced.matches) {
      move(tile, body.position.x + Math.cos(tile.phase) * 12, body.position.y - 14);
      Body.setVelocity(body, { x: Math.cos(tile.phase) * 1.3, y: .8 });
    }
  }
  function drift(tile, seconds) {
    if (tile.hold) return;
    const { body, anchor, phase } = tile;
    const x = anchor.x + Math.sin(seconds * .8 + phase) * Math.min(16, width * .022);
    const y = anchor.y + Math.cos(seconds * .67 + phase) * 10;
    Sleeping.set(body, false);
    Body.applyForce(body, body.position, {
      x: body.mass * ((x - body.position.x) * .000018 - body.velocity.x * .00017),
      y: body.mass * ((y - body.position.y) * .000018 - body.velocity.y * .00017)
    });
    const tilt = anchor.angle + Math.sin(seconds * .64 + phase) * .07;
    const delta = Math.atan2(Math.sin(tilt - body.angle), Math.cos(tilt - body.angle));
    body.torque += body.inertia * (delta * .000020 - body.angularVelocity * .00019);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = previousTime = remainder = 0;
  }
  function advance(now) {
    frame = 0;
    if (intro?.open) return;
    remainder += Math.min(previousTime ? now - previousTime : step, 50);
    previousTime = now;
    while (remainder >= step) {
      if (!dropped) tiles.forEach(tile => drift(tile, engine.timing.timestamp / 1000));
      Engine.update(engine, step);
      remainder -= step;
    }
    tiles.forEach(draw);
    if (!dropped || tiles.some(({ body, hold }) => hold || body.position.y < height + Math.min(window.innerHeight * .72, 620))) {
      frame = requestAnimationFrame(advance);
    } else {
      previousTime = remainder = 0;
    }
  }
  function run() {
    if (!width || !visible || document.hidden || frame || intro?.open) return;
    if (reduced.matches) {
      if (!dropped) return;
      // Compute the resting layout without showing intermediate motion.
      for (let i = 0; i < 240; i++) Engine.update(engine, step);
      tiles.forEach(draw);
    } else {
      frame = requestAnimationFrame(advance);
    }
  }
  function release(tile) {
    const held = tile.hold;
    if (!held) return;
    tile.hold = null;
    if (held.spring) Composite.remove(engine.world, held.spring);
    tile.el.classList.remove('is-held');
    if (tile.el.hasPointerCapture(held.id)) tile.el.releasePointerCapture(held.id);
    if (tile.body.isStatic) Body.setStatic(tile.body, false);
    tile.anchor = { ...tile.body.position, angle: tile.body.angle };
    Sleeping.set(tile.body, false);
    run();
  }
  function reset() {
    if (!width) return;
    dropped = false;
    engine.gravity.y = 0;
    if (floor) Composite.add(engine.world, floor);
    stop();
    tiles.forEach(tile => {
      if (tile.hold) return;
      Sleeping.set(tile.body, false);
      Body.setVelocity(tile.body, { x: 0, y: 0 });
      Body.setAngularVelocity(tile.body, 0);
      home(tile);
    });
    board.dataset.state = 'floating';
    run();
  }
  function drop() {
    if (dropped || !width) return;
    dropped = true;
    engine.gravity.y = .45;
    if (floor) Composite.remove(engine.world, floor);
    board.dataset.state = 'falling';
    tiles.forEach(tile => {
      if (tile.hold) return;
      Body.setStatic(tile.body, false);
      Sleeping.set(tile.body, false);
      // The starting tilt determines the direction each tile tumbles.
      Body.setVelocity(tile.body, { x: Math.sin(tile.phase) * 1.1, y: .5 + (tile.phase % 2) });
      Body.setAngularVelocity(tile.body, Math.sin(tile.phase) * .02);
    });
    run();
  }
  function layout() {
    const w = board.clientWidth;
    if (!w || !board.clientHeight) return;
    if (w === width && board.clientHeight === height && tiles.every(t => t.w === t.el.offsetWidth && t.h === t.el.offsetHeight)) return;
    stop();
    arrange(w);
    const h = board.clientHeight;
    const before = tiles.map(tile => tile.body && ({ x: tile.body.position.x / width, y: tile.body.position.y / height, angle: tile.body.angle, ax: tile.anchor.x / width, ay: tile.anchor.y / height, tilt: tile.anchor.angle }));
    tiles.forEach(release);
    stop();
    width = w; height = h;
    Composite.clear(engine.world, false);
    Engine.clear(engine);
    const wall = { isStatic: true, friction: .65, restitution: .12 };
    floor = Bodies.rectangle(w / 2, h + 40, w + 160, 80, wall);
    Composite.add(engine.world, [
      Bodies.rectangle(w / 2, -40, w + 160, 80, wall),
      Bodies.rectangle(-40, h / 2, 80, h + 160, wall),
      Bodies.rectangle(w + 40, h / 2, 80, h + 160, wall)
    ]);
    if (!dropped) Composite.add(engine.world, floor);
    tiles.forEach((tile, index) => {
      tile.body = Bodies.rectangle(w / 2, h / 2, tile.w, tile.h, {
        friction: .55, frictionAir: .014, restitution: .20, chamfer: { radius: 5 }
      });
      Composite.add(engine.world, tile.body);
      if (dropped && before[index]) {
        tile.anchor = { x: before[index].ax*w, y: before[index].ay*h, angle: before[index].tilt };
        Body.setAngle(tile.body, before[index].angle);
        Body.setPosition(tile.body, { x: before[index].x * w, y: before[index].y * h });
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
      const target = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      const offset = { x: target.x - position.x, y: target.y - position.y };
      Sleeping.set(tile.body, false);
      tile.hold = { id: event.pointerId, offset, spring: null };
      if (reduced.matches) Body.setStatic(tile.body, true);
      else {
        // Grip the actual pickup point so the label can swing around the pointer.
        tile.hold.spring = Constraint.create({
          pointA: target, bodyB: tile.body, pointB: offset, length: 0, stiffness: .20, damping: .13
        });
        Composite.add(engine.world, tile.hold.spring);
      }
      run();
      el.setPointerCapture(event.pointerId);
      el.classList.add('is-held');
      el.style.zIndex = ++topLayer;
    });
    el.addEventListener('pointermove', event => {
      const held = tile.hold;
      if (held?.id !== event.pointerId) return;
      const bounds = board.getBoundingClientRect();
      const target = { x: clamp(event.clientX - bounds.left, 0, width), y: clamp(event.clientY - bounds.top, 0, height) };
      if (held.spring) {
        held.spring.pointA = target;
        Sleeping.set(tile.body, false);
      } else move(tile, target.x - held.offset.x, target.y - held.offset.y);
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(name =>
      el.addEventListener(name, event => {
        if (tile.hold?.id === event.pointerId) release(tile);
      }));
    el.addEventListener('keydown', event => {
      const dir = { ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1] }[event.key];
      if (!dir || !tile.body || tile.hold) return;
      event.preventDefault();
      el.style.zIndex = ++topLayer;
      const delta = event.shiftKey ? 28 : 12;
      move(tile, tile.body.position.x + delta * dir[0], tile.body.position.y + delta * dir[1]);
      tile.anchor = { ...tile.body.position, angle: tile.body.angle };
      Body.setVelocity(tile.body, { x: 0, y: 0 });
      Sleeping.set(tile.body, false);
      run();
    });
  });
  function onScroll() {
    const y = Math.max(0, window.scrollY);
    const delta = y - lastScrollY;
    lastScrollY = y;
    if (y <= 2 && dropped) reset();
    else if (!dropped && y > 40 && profile && profile.getBoundingClientRect().top < window.innerHeight * .55) {
      drop();
      if (delta > 0 && !reduced.matches) tiles.forEach(tile => Body.translate(tile.body, { x: 0, y: delta }));
    }
    else if (dropped && delta > 0 && !reduced.matches) {
      tiles.forEach(tile => Body.translate(tile.body, { x: 0, y: delta }));
      run();
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : run());
  reduced.addEventListener('change', () => { tiles.forEach(release); stop(); run(); });
  document.addEventListener('arrivalstart', stop);
  document.addEventListener('arrivalcomplete', run);
  layout();
  new ResizeObserver(layout).observe(board);
  if (document.fonts) document.fonts.ready.then(layout);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) run(); else stop();
  }, { rootMargin: window.innerHeight + 'px 0px ' + window.innerHeight + 'px 0px' }).observe(board);
  // Restored scroll positions should agree with a visit that scrolled here.
  onScroll();
})();
