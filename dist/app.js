(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-year]').forEach(node => node.textContent = new Date().getFullYear());
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.mobile-nav');
  let closeTimer;
  function setMenu(open, immediate = false) {
    if (open === (menu.getAttribute('aria-expanded') === 'true') && !(immediate && !nav.hidden)) return;
    clearTimeout(closeTimer);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.inert = !open;
    nav.classList.toggle('closing', !open);
    if (open) nav.hidden = false;
    else if (immediate || reduced.matches) nav.hidden = true;
    else closeTimer = setTimeout(() => { nav.hidden = true; }, 185);
  }
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
