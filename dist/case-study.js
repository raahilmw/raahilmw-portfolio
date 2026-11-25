// A finite illustration. The chain never contacts the target or any external service.
(() => {
  const chain=document.querySelector('.attack-chain');
  if(!chain)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const buttons=[...chain.querySelectorAll('[data-chain-step]')];
  const play=chain.querySelector('.chain-play'),label=play.querySelector('span');
  const state=chain.querySelector('.chain-state'),payload=chain.querySelector('.chain-payload'),caption=chain.querySelector('.chain-caption');
  const packet=chain.querySelector('.chain-packet'),source=chain.querySelector('.chain-mobile-source');
  const steps=[
    {name:'HTTP fetch',payload:'image=http://external.example/resource',caption:'The supplied URL reaches the backend fetcher. The API returns the remote response body, establishing full-read SSRF.',source:'HTTP source',paths:['.chain-in','.chain-check','.chain-http']},
    {name:'File scheme',payload:'image=file:///etc/hostname',caption:'Changing the scheme selects a local resource. The report records system-identification files returned by the application server.',source:'Local file',paths:['.chain-in','.chain-check','.chain-file']},
    {name:'Normalization',payload:'/etc/./passwd → /etc/passwd',caption:'A differently written path resolves to the same file. The report records a blocked direct request and successful normalized variants.',source:'Local file',paths:['.chain-in','.chain-check']},
    {name:'Base64 response',payload:'data.image = "data:image/png;base64,[REDACTED]"',caption:'Fetched bytes are encoded and returned. The image label and Base64 wrapper do not stop the response from containing file contents.',source:'Returned bytes',paths:['.chain-return']}
  ];
  let index=0,frame=0,last=0,elapsed=0,running=false,complete=false;
  const duration=1900;
  function updateButton(){label.textContent=reduced.matches?'Next step':running?'Pause':complete?'Replay chain':elapsed?'Resume chain':'Play chain';play.setAttribute('aria-label',label.textContent);}
  function select(i){
    index=i;chain.dataset.stage=String(i);state.textContent=steps[i].name;
    payload.textContent=steps[i].payload;caption.textContent=steps[i].caption;source.textContent=steps[i].source;
    buttons.forEach((button,j)=>button.setAttribute('aria-pressed',String(i===j)));
  }
  function pause(){running=false;cancelAnimationFrame(frame);frame=0;last=0;packet.setAttribute('visibility','hidden');updateButton();}
  function move(progress){
    const paths=steps[index].paths.map(selector=>chain.querySelector(selector));
    const lengths=paths.map(path=>path.getTotalLength());
    let distance=progress*lengths.reduce((sum,n)=>sum+n,0);
    let n=0;while(n<lengths.length-1&&distance>lengths[n]){distance-=lengths[n];n++;}
    const point=paths[n].getPointAtLength(Math.min(distance,lengths[n]));
    packet.setAttribute('cx',point.x);packet.setAttribute('cy',point.y);packet.setAttribute('visibility','visible');
  }
  function tick(now){
    frame=0;if(!running)return;
    elapsed+=Math.min(last?now-last:0,50);last=now;
    move(Math.min(1,elapsed/(duration*.82)));
    if(elapsed>=duration){
      if(index===steps.length-1){complete=true;elapsed=0;pause();return;}
      elapsed=0;select(index+1);
    }
    frame=requestAnimationFrame(tick);
  }
  buttons.forEach((button,i)=>{button.disabled=false;button.addEventListener('click',()=>{pause();elapsed=0;complete=false;select(i);updateButton();});});
  play.hidden=false;
  play.addEventListener('click',()=>{
    if(reduced.matches){pause();elapsed=0;select((index+1)%steps.length);return;}
    if(running){pause();return;}
    if(complete){complete=false;elapsed=0;select(0);}
    running=true;last=0;updateButton();frame=requestAnimationFrame(tick);
  });
  reduced.addEventListener('change',pause);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  window.addEventListener('pagehide',pause);
  if('IntersectionObserver'in window)new IntersectionObserver(([entry])=>{if(!entry.isIntersecting&&running)pause();},{threshold:.05}).observe(chain);
  updateButton();
})();

// The sidebar tracks all current intersections, including short adjacent sections.
(() => {
  const sections=[...document.querySelectorAll('.case-section[id]')];
  const links=[...document.querySelectorAll('.case-index a')];
  if(!sections.length||!('IntersectionObserver'in window))return;
  const active=new Set();
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>e.isIntersecting?active.add(e.target):active.delete(e.target));
    const section=[...active].sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0];
    if(!section)return;
    links.forEach(link=>{if(link.hash==='#'+section.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  },{rootMargin:'-5% 0px -60% 0px'});
  sections.forEach(section=>observer.observe(section));
})();
