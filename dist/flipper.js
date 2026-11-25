// The Home model boots in place. The detail view opens on demand.
(() => {
  const figure = document.getElementById('flipper');
  if (!figure) return;
  const stage = figure.querySelector('.flipper-stage');
  const opener = figure.querySelector('.flipper-inspect');
  const viewer = document.getElementById('flipper-inspector');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const product = figure.querySelector('.device-product');
  let inputFrame = 0, pointer, bootTimer, bootRequest = 0;
  function center() {
    cancelAnimationFrame(inputFrame);
    inputFrame = 0;
    figure.style.removeProperty('--pitch');
    figure.style.removeProperty('--yaw');
  }
  stage.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !fine.matches || reduced.matches || document.hidden) return;
    pointer = {x:event.clientX, y:event.clientY};
    if (inputFrame) return;
    inputFrame = requestAnimationFrame(() => {
      inputFrame = 0;
      const box = stage.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const relative = (value, origin, length) => Math.max(-.5,Math.min(.5,(value-origin)/length-.5));
      figure.style.setProperty('--pitch', (-7*relative(pointer.y,box.top,box.height)).toFixed(2)+'deg');
      figure.style.setProperty('--yaw', (10*relative(pointer.x,box.left,box.width)).toFixed(2)+'deg');
    });
  }, {passive:true});
  stage.addEventListener('pointerleave', center);
  stage.addEventListener('pointercancel', center);
  fine.addEventListener('change', center);
  window.addEventListener('blur', center);

  const readImage = image => image.decode ? image.decode().catch(() => {}) : Promise.resolve();
  function stopBoot() {
    bootRequest++;
    clearTimeout(bootTimer);
    figure.classList.remove('is-booting','boot-pending');
  }
  async function boot(replay = false) {
    stopBoot();
    if (reduced.matches || document.hidden) return;
    const request = bootRequest;
    if (replay) {
      figure.scrollIntoView({block:'center',behavior:'instant'});
      opener.focus({preventScroll:true});
    }
    figure.classList.add('boot-pending');
    await Promise.all([product, ...figure.querySelectorAll('.device-overlay')].map(readImage));
    if (request !== bootRequest || reduced.matches || document.hidden || viewer.open) return;
    // Start only after the artwork is ready, including a replay on a slow connection.
    void figure.offsetWidth;
    figure.classList.remove('boot-pending');
    figure.classList.add('is-booting');
    bootTimer = setTimeout(stopBoot, 1480);
  }
  const key = 'raahilmw-flipper-arrival';
  let first = true;
  try { first = !sessionStorage.getItem(key); } catch {}
  if (first && !location.hash && !reduced.matches) {
    try { sessionStorage.setItem(key,'1'); sessionStorage.setItem('raahilmw-signature-v1','1'); } catch {}
    boot();
  }
  document.querySelector('.replay-arrival')?.addEventListener('click', () => boot(true));
  reduced.addEventListener('change', () => { center(); stopBoot(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { center(); stopBoot(); }
  });

  if (!viewer || typeof viewer.showModal !== 'function') return;
  const stageDetail = viewer.querySelector('.cutaway-scene');
  const closer = viewer.querySelector('.flipper-reassemble');
  const message = viewer.querySelector('.inspection-status');
  const rows = [...viewer.querySelectorAll('.part-row')];
  const leaders = [...viewer.querySelectorAll('.part-leader')];
  const sprites = [...viewer.querySelectorAll('[data-part-src]')];
  let preparation, closing = false, closeTimer, loadingTimer, geometryFrame = 0, openRequest = 0;

  function prepare() {
    if (!preparation) {
      sprites.forEach(image => { image.src = image.dataset.partSrc; });
      preparation = Promise.all(sprites.map(image => {
        if (image.decode) return readImage(image).then(() => image.naturalWidth > 0);
        if (image.complete) return image.naturalWidth > 0;
        return new Promise(resolve => {
          image.addEventListener('load', () => resolve(true), {once:true});
          image.addEventListener('error', () => resolve(false), {once:true});
        });
      })).then(results => {
        const ready = results.every(Boolean);
        if (!ready) preparation = null;
        return ready;
      });
    }
    return preparation;
  }
  function drawLeaders() {
    geometryFrame = 0;
    if (!viewer.open) return;
    const base = stageDetail.getBoundingClientRect();
    if (!base.width || !base.height) return;
    rows.forEach((row,index) => {
      const pin = row.querySelector('.part-pin').getBoundingClientRect();
      // Measure the stable note column, independent of its entrance transform.
      const note = row.querySelector('.part-note');
      const startX = note.offsetLeft - 6;
      const startY = row.offsetTop + row.offsetHeight / 2;
      const endX = pin.left - base.left;
      const endY = pin.top - base.top;
      const elbow = startX - Math.min(28, Math.max(4,(startX-endX)*.4));
      leaders[index].setAttribute('d', 'M'+startX+' '+startY+' H'+elbow+' L'+endX+' '+endY);
    });
  }
  function scheduleLeaders() {
    if (viewer.open && !geometryFrame) geometryFrame = requestAnimationFrame(drawLeaders);
  }
  async function open() {
    if (viewer.open) return;
    try { viewer.showModal(); } catch { return; }
    stopBoot(); center();
    const request = ++openRequest;
    closing = false;
    viewer.classList.remove('has-image-error');
    viewer.setAttribute('aria-busy','true');
    loadingTimer = setTimeout(() => { message.textContent = 'Loading the parts…'; }, 300);
    closer.focus({preventScroll:true});
    drawLeaders();
    const ready = await prepare();
    if (!viewer.open || closing || request !== openRequest) return;
    clearTimeout(loadingTimer);
    message.textContent = ready ? '' : 'The part images could not load. Open Inspect again to retry.';
    viewer.removeAttribute('aria-busy');
    if (!ready) { viewer.classList.add('has-image-error'); return; }
    drawLeaders();
    viewer.classList.add('is-exploded');
  }
  function close(immediate = false) {
    if (!viewer.open) return;
    if (closing && !immediate) return;
    const animated = viewer.classList.contains('is-exploded') && !reduced.matches && !immediate;
    closing = true; openRequest++;
    viewer.classList.remove('is-exploded');
    clearTimeout(closeTimer);
    if (animated) closeTimer = setTimeout(() => viewer.close(), 490);
    else viewer.close();
  }
  opener.hidden = false;
  opener.addEventListener('pointerenter', prepare, {once:true});
  opener.addEventListener('focus', prepare, {once:true});
  opener.addEventListener('click', open);
  closer.addEventListener('click', () => close());
  viewer.addEventListener('cancel', event => { event.preventDefault(); close(); });
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const r = viewer.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
  });
  viewer.addEventListener('close', () => {
    closing = false; openRequest++;
    clearTimeout(loadingTimer); message.textContent = '';
    clearTimeout(closeTimer); cancelAnimationFrame(geometryFrame); geometryFrame = 0;
    viewer.classList.remove('is-exploded');
    viewer.removeAttribute('aria-busy');
    if (!document.hidden) opener.focus({preventScroll:true});
  });
  if ('ResizeObserver' in window) new ResizeObserver(scheduleLeaders).observe(stageDetail);
  window.addEventListener('resize', scheduleLeaders, {passive:true});
  document.fonts?.ready.then(scheduleLeaders);
  window.addEventListener('pagehide', () => close(true));
})();
