// A finite request trace. All article content remains readable without scripting.
(() => {
  const trace=document.querySelector('[data-request-trace]');
  if(!trace)return;
  const play=trace.querySelector('[data-trace-play]');
  const playLabel=trace.querySelector('[data-trace-play-label]');
  const buttons=[...trace.querySelectorAll('[data-trace-step]')];
  const path=trace.querySelector('[data-trace-path]');
  const packet=trace.querySelector('[data-trace-packet]');
  const forward=trace.querySelector('[data-trace-wire="forward"]');
  const returning=trace.querySelector('[data-trace-wire="return"]');
  const description=trace.querySelector('[data-trace-description]');
  const code=trace.querySelector('[data-trace-code]');
  const source=trace.querySelector('[data-trace-source]');
  const sourceNote=trace.querySelector('[data-trace-source-note]');
  const inputLabel=trace.querySelector('.trace-readout-label');
  const receipt=trace.querySelector('.trace-receipt');
  if(!play||!path||typeof path.getPointAtLength!=='function')return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow=window.matchMedia('(max-width: 780px)');
  const steps=[
    {code:'image=http://httpbin.org/ip',caption:'An HTTP URL made the backend fetch a resource and return its contents.',source:'External URL',note:'The HTTP check',receipt:'HTTP'},
    {code:'image=file:///etc/hostname',caption:'Using file:// returned a local file through the same endpoint.',source:'Local filesystem',note:'The file URL',receipt:'FILE'},
    {code:'image=file:///etc/pass%2577d',caption:'Alternate paths returned HTTP 200 where the direct path was blocked.',source:'Local filesystem',note:'Alternate path forms',receipt:'200 OK'},
    {code:'data:image/png;base64,[redacted]',caption:'Decoding the Base64 response recovered the file contents.',source:'Local filesystem',note:'Readable by the app',receipt:'BASE64'}
  ];
  const routes={
    wide:[
      'M90 130C210 130 310 130 450 130S670 130 810 130',
      'M90 130C240 130 310 130 450 130S650 218 810 130',
      'M90 130C220 130 300 130 350 130C380 130 380 60 450 60S520 130 550 130C650 130 710 130 810 130',
      'M810 130C900 130 900 300 450 300S0 130 90 130'
    ],
    narrow:[
      'M216 60C390 60 280 173 450 173S510 288 684 288',
      'M216 60C390 60 280 173 450 173S580 205 684 288',
      'M216 60C390 60 275 135 330 152C370 166 380 115 450 115S530 173 545 200C565 240 615 250 684 288',
      'M684 288C870 288 870 340 600 340C150 340 40 55 216 60'
    ]
  };
  const chapter=4600,total=chapter*steps.length;
  let stage=-1,elapsed=0,frame=0,last=0,playing=false,requested=false,started=false,visible=false,length=1;
  function setRoute(){
    const r=narrow.matches?routes.narrow:routes.wide;
    forward.setAttribute('d',r[0]);returning.setAttribute('d',r[3]);
    path.setAttribute('d',r[Math.max(0,stage)]);length=path.getTotalLength();
  }
  function setStage(next){
    if(next===stage)return;
    stage=next;const step=steps[stage];
    trace.dataset.traceStage=String(stage);
    buttons.forEach((button,index)=>button.setAttribute('aria-pressed',String(index===stage)));
    code.textContent=step.code;description.textContent=step.caption;
    source.textContent=step.source;sourceNote.textContent=step.note;receipt.textContent=step.receipt;
    inputLabel.textContent=stage===3?'Output':'Input';
    setRoute();
  }
  function draw(){
    setStage(Math.min(steps.length-1,Math.floor(elapsed/chapter)));
    const fraction=elapsed>=total?1:(elapsed%chapter)/chapter;
    // Allow the labels to settle, then send one signal along the selected route.
    const travel=Math.max(0,Math.min(1,(fraction-.12)/.73));
    const point=path.getPointAtLength(length*(travel*travel*(3-2*travel)));
    packet.setAttribute('transform',`translate(${point.x} ${point.y})`);
    trace.style.setProperty('--trace-progress',String(elapsed/total));
    trace.style.setProperty('--trace-turn',`${elapsed*.012}deg`);
    trace.style.setProperty('--star-turn',`${stage*45+travel*90}deg`);
  }
  function label(){
    playLabel.textContent=reduced.matches?'Next step':playing?'Pause':elapsed>=total?'Replay chain':elapsed>0?'Continue':'Play chain';
    play.setAttribute('aria-label',reduced.matches?'Show the next attack chain step':playing?'Pause attack chain':elapsed>=total?'Replay attack chain':'Play attack chain');
    play.title=play.getAttribute('aria-label');
    trace.toggleAttribute('data-trace-playing',playing);
  }
  function stop(){
    cancelAnimationFrame(frame);frame=0;last=0;playing=false;label();
  }
  function tick(now){
    if(!playing)return;
    if(last)elapsed=Math.min(total,elapsed+Math.min(64,now-last));
    last=now;draw();
    if(elapsed>=total){requested=false;stop();return;}
    frame=requestAnimationFrame(tick);
  }
  function resume(){
    if(playing||!requested||!visible||document.hidden||reduced.matches||document.querySelector('#evidence-viewer[open]'))return;
    playing=true;last=0;label();frame=requestAnimationFrame(tick);
  }
  function choose(index){
    requested=false;started=true;stop();elapsed=index*chapter+chapter*.68;draw();label();
  }
  play.hidden=false;buttons.forEach((button,index)=>{button.disabled=false;button.addEventListener('click',()=>choose(index));});
  play.addEventListener('click',()=>{
    started=true;
    if(reduced.matches){choose((stage+1)%steps.length);return;}
    if(playing||requested){requested=false;stop();return;}
    if(elapsed>=total)elapsed=0;
    requested=true;resume();
  });
  function onVisibility(inView){
    visible=inView;
    if(!visible){stop();return;}
    if(!started&&!reduced.matches){started=true;requested=true;}
    resume();
  }
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>onVisibility(entries[0].isIntersecting&&entries[0].intersectionRatio>=.35),{threshold:[0,.35]}).observe(trace);
  }else{visible=true;/* Play remains available without automatic playback. */}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else resume();});
  document.addEventListener('request-trace-modal',event=>{if(event.detail.open)stop();else resume();});
  function preferenceChanged(){requested=false;stop();draw();label();}
  reduced.addEventListener('change',preferenceChanged);
  narrow.addEventListener('change',()=>{setRoute();draw();});
  trace.dataset.traceReady='';draw();label();
})();

// A quiet image viewer. Every image remains a normal link without scripting.
(() => {
  const root=document.documentElement;
  const viewer=document.querySelector('#evidence-viewer');
  const links=[...document.querySelectorAll('[data-evidence-image]')];
  if(!viewer||!links.length||typeof viewer.showModal!=='function')return;
  const photo=viewer.querySelector('.evidence-viewer-body img');
  const caption=viewer.querySelector('.evidence-viewer-caption');
  const fileLink=viewer.querySelector('[data-evidence-file]');
  const title=viewer.querySelector('#evidence-viewer-title');
  const closeButton=viewer.querySelector('[data-evidence-close]');
  let trigger=null;
  links.forEach((link,index)=>{
    link.setAttribute('aria-haspopup','dialog');link.setAttribute('aria-controls',viewer.id);
    link.addEventListener('click',event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      const image=link.querySelector('img'),figure=link.closest('figure');
      photo.src=link.href;photo.alt=image.alt;fileLink.href=link.href;
      photo.width=image.width;photo.height=image.height;
      caption.textContent=figure.querySelector('figcaption')?.textContent||'';
      title.textContent=index===0?'The team’s response':'Burp Suite capture';
      try{if(!viewer.open)viewer.showModal();}catch{return;}
      event.preventDefault();trigger=link;root.classList.add('evidence-open');
      document.dispatchEvent(new CustomEvent('request-trace-modal',{detail:{open:true}}));
      closeButton.focus({preventScroll:true});
    });
  });
  function close(){if(viewer.open)viewer.close();}
  closeButton.addEventListener('click',close);
  viewer.addEventListener('cancel',event=>{event.preventDefault();close();});
  viewer.addEventListener('close',()=>{root.classList.remove('evidence-open');trigger?.focus({preventScroll:true});document.dispatchEvent(new CustomEvent('request-trace-modal',{detail:{open:false}}));});
  viewer.addEventListener('click',event=>{
    if(event.target!==viewer)return;
    const b=viewer.getBoundingClientRect();
    if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)close();
  });
})();
