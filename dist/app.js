(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-year]').forEach(node => node.textContent = new Date().getFullYear());
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.mobile-nav');
  function closeMenu(){ nav.hidden = true; menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation'); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; nav.hidden = !open; menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open?'Close navigation':'Open navigation'); });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  document.addEventListener('click',event=>{if(!nav.contains(event.target)&&!menu.contains(event.target))closeMenu();});
  window.addEventListener('resize',()=>{if(innerWidth>1000)closeMenu();});

  let toastTimer;
  function notify(message){const toast=document.querySelector('#toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3400);}
  document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(button.dataset.copy);notify(button.dataset.copy==='raahilmw'?'Handle copied: raahilmw':'Article link copied.');}
    catch{notify('Copy: '+button.dataset.copy);}
  }));

  const scene=document.querySelector('.paper-scene');
  if(scene){
    const control=scene.querySelector('.scene-control');
    control.addEventListener('click',()=>{const open=scene.classList.toggle('is-open');control.setAttribute('aria-pressed',String(open));control.firstChild.textContent=open?'Close the layers ':'Inspect the layers ';});
    if(matchMedia('(hover:hover)').matches){let pending=0,point=null;function paint(){pending=0;const r=scene.getBoundingClientRect();scene.style.setProperty('--parallax-x',point&&!reduced.matches?`${((point.x-r.left)/r.width-.5)*8}px`:'0px');scene.style.setProperty('--parallax-y',point&&!reduced.matches?`${((point.y-r.top)/r.height-.5)*8}px`:'0px');}scene.addEventListener('pointermove',event=>{point={x:event.clientX,y:event.clientY};if(!pending)pending=requestAnimationFrame(paint);},{passive:true});scene.addEventListener('pointerleave',()=>{point=null;if(!pending)pending=requestAnimationFrame(paint);});}
  }

  const board=document.querySelector('.pinboard');
  if(board){
    const notes=[...board.querySelectorAll('.research-slip')];let topLayer=10;
    notes.forEach(note=>{
      const state={x:0,y:0,drag:null};note.notePosition=state;
      function move(x,y){state.x=Math.max(8-note.offsetLeft,Math.min(board.clientWidth-note.offsetLeft-note.offsetWidth-8,x));state.y=Math.max(8-note.offsetTop,Math.min(board.clientHeight-note.offsetTop-note.offsetHeight-8,y));note.style.translate=`${state.x}px ${state.y}px`;}
      note.addEventListener('pointerdown',event=>{if(event.button!==0)return;state.drag={id:event.pointerId,x:event.clientX,y:event.clientY,baseX:state.x,baseY:state.y};note.setPointerCapture(event.pointerId);note.style.zIndex=++topLayer;});
      note.addEventListener('pointermove',event=>{if(state.drag?.id!==event.pointerId)return;move(state.drag.baseX+event.clientX-state.drag.x,state.drag.baseY+event.clientY-state.drag.y);});
      const end=()=>{state.drag=null;};note.addEventListener('pointerup',end);note.addEventListener('pointercancel',end);note.addEventListener('lostpointercapture',end);
      note.addEventListener('keydown',event=>{const delta=event.shiftKey?25:10;const keys={ArrowLeft:[-delta,0],ArrowRight:[delta,0],ArrowUp:[0,-delta],ArrowDown:[0,delta]};if(event.key==='Home'){event.preventDefault();state.x=state.y=0;note.style.translate='0px 0px';}else if(keys[event.key]){event.preventDefault();note.style.zIndex=++topLayer;move(state.x+keys[event.key][0],state.y+keys[event.key][1]);}});
    });
    function reset(){notes.forEach(note=>{note.notePosition.x=0;note.notePosition.y=0;note.style.translate='0px 0px';});}
    document.querySelector('.reset-board').addEventListener('click',reset);new ResizeObserver(reset).observe(board);
  }

  const run=document.querySelector('#run-workflow');
  if(run){
    const steps=[...document.querySelectorAll('[data-step]')],tracks=[...document.querySelectorAll('[data-track]')],output=document.querySelector('#workflow-output');
    const messages=['Map: loading the example.test sample inventory.','Probe: reviewing sample service metadata.','Connect: grouping assets and removing duplicates.','Report: preparing an investigation queue.'];
    let timer;
    run.addEventListener('click',()=>{clearTimeout(timer);run.disabled=true;run.textContent='Workflow running…';steps.forEach(el=>el.classList.remove('active','done'));tracks.forEach(el=>el.classList.remove('active','done'));let i=0;function tick(){if(i>0){steps[i-1].classList.replace('active','done');tracks[i-1].classList.replace('active','done');}if(i===steps.length){output.textContent='Simulation complete. A clear queue, ready for human review.';run.disabled=false;run.textContent='Run it again';return;}steps[i].classList.add('active');tracks[i].classList.add('active');output.textContent=messages[i];i++;timer=setTimeout(tick,reduced.matches?100:850);}tick();});
  }
})();
