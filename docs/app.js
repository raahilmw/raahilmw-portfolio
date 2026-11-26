(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-year]').forEach(node => node.textContent = new Date().getFullYear());
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.mobile-nav');
  function setMenu(open) {
    if (nav.hidden === !open) return;
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.hidden = !open;
  }
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
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
    if (!event.matches) setMenu(false);
  });

  // Older dialog implementations need a backdrop hit test for light dismissal.
  document.querySelectorAll('dialog[closedby="any"]').forEach(dialog => {
    if ('closedBy' in dialog) return;
    dialog.addEventListener('click', event => {
      if (event.target !== dialog || !dialog.open) return;
      const {left, right, top, bottom} = dialog.getBoundingClientRect();
      if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
        dialog.close();
      }
    });
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
    let timer, index = 0;
    function showStep() {
      clearTimeout(timer);
      if (reduced.matches) {
        [...steps, ...tracks].forEach(item => {
          item.classList.remove('active');
          item.classList.add('done');
        });
        index = steps.length;
      } else if (index > 0) {
        steps[index-1].classList.replace('active', 'done');
        tracks[index-1].classList.replace('active', 'done');
      }
      if (index === steps.length) {
        output.textContent = 'Simulation complete. A clear queue, ready for human review.';
        run.disabled = false;
        run.textContent = 'Run it again';
        return;
      }
      steps[index].classList.add('active');
      tracks[index].classList.add('active');
      output.textContent = messages[index++];
      timer = setTimeout(showStep, 850);
    }
    run.addEventListener('click', () => {
      run.disabled = true;
      run.textContent = 'Workflow running…';
      [...steps, ...tracks].forEach(item => item.classList.remove('active', 'done'));
      index = 0;
      showStep();
    });
    document.addEventListener('visibilitychange', () => {
      clearTimeout(timer);
      if (!document.hidden && run.disabled) showStep();
    });
    reduced.addEventListener('change', () => {
      if (reduced.matches && run.disabled) showStep();
    });
  }
})();
