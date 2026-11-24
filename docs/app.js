(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-year]').forEach(node => node.textContent = new Date().getFullYear());
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.mobile-nav');
  const lines = menu.querySelectorAll('.menu-signal path');
  let target = 0, position = 0, velocity = 0, frame = 0, previous = 0;

  function drawMenu() {
    const p = position;
    const bend = Math.sin(Math.PI * Math.max(0, Math.min(p, 1))) * 5;
    // Both strokes bow out, pass one another and settle into the close mark.
    lines.forEach((path, index) => {
      const side = index === 0 ? -1 : 1;
      const leftY = 16 + side * (4 + 4 * p);
      const rightY = 16 + side * (4 - 12 * p);
      path.setAttribute('d', 'M' + (5 + 3*p) + ' ' + leftY +
        ' Q' + (16 - side*bend) + ' ' + (16 + side*(4 - 4*p + bend)) +
        ' ' + (27 - 3*p) + ' ' + rightY);
    });
    nav.style.setProperty('--unfold', p.toFixed(4));
  }
  function finishMenu() {
    cancelAnimationFrame(frame);
    position = target;
    velocity = frame = previous = 0;
    drawMenu();
    nav.hidden = !target;
  }
  function stepMenu(time) {
    const dt = Math.min((time - (previous || time - 16)) / 1000, .032);
    previous = time;
    // Two short integration steps keep the spring consistent on slower devices.
    for (let i = 0; i < 2; i++) {
      velocity += ((target - position) * 380 - velocity * 29) * dt / 2;
      position += velocity * dt / 2;
    }
    if (Math.abs(target - position) < .001 && Math.abs(velocity) < .025) {
      finishMenu();
      return;
    }
    drawMenu();
    frame = requestAnimationFrame(stepMenu);
  }
  function setMenu(open, immediate = false) {
    if (target === Number(open) && !immediate) return;
    target = Number(open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.inert = !open;
    if (immediate || reduced.matches) { finishMenu(); return; }
    nav.hidden = false;
    if (!frame) frame = requestAnimationFrame(stepMenu);
  }
  reduced.addEventListener('change', () => { if (reduced.matches) finishMenu(); });
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false, true)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!nav.contains(event.target) && !menu.contains(event.target)) setMenu(false);
  });
  matchMedia('(max-width: 980px)').addEventListener('change', event => {
    if (!event.matches) setMenu(false, true);
  });

  let toastTimer;
  function notify(message){const toast=document.querySelector('#toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3400);}
  document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(button.dataset.copy);notify(button.dataset.message || (button.dataset.copy==='raahilmw'?'Handle copied: raahilmw':'Article link copied.'));}
    catch{notify('Copy: '+button.dataset.copy);}
  }));

  const run=document.querySelector('#run-workflow');
  if(run){
    const steps=[...document.querySelectorAll('[data-step]')],tracks=[...document.querySelectorAll('[data-track]')],output=document.querySelector('#workflow-output');
    const messages=['Map: loading the example.test sample inventory.','Probe: reviewing sample service metadata.','Connect: grouping assets and removing duplicates.','Report: preparing an investigation queue.'];
    let timer;
    run.addEventListener('click',()=>{clearTimeout(timer);run.disabled=true;run.textContent='Workflow running…';steps.forEach(el=>el.classList.remove('active','done'));tracks.forEach(el=>el.classList.remove('active','done'));let i=0;function tick(){if(i>0){steps[i-1].classList.replace('active','done');tracks[i-1].classList.replace('active','done');}if(i===steps.length){output.textContent='Simulation complete. A clear queue, ready for human review.';run.disabled=false;run.textContent='Run it again';return;}steps[i].classList.add('active');tracks[i].classList.add('active');output.textContent=messages[i];i++;timer=setTimeout(tick,reduced.matches?100:850);}tick();});
  }
})();

(() => {
  const tracks = document.querySelectorAll('.career-track');
  if (!tracks.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: .12 });
  tracks.forEach(track => observer.observe(track));
})();
