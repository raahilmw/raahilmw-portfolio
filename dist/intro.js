// An authored first-session arrival. Escape and the skip control always exit immediately.
(() => {
  const dialog = document.querySelector('#site-intro');
  if (!dialog || !dialog.showModal) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'raahilmw-arrival-v3';
  const canvas = dialog.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const phase = dialog.querySelector('.arrival-phase');
  const count = dialog.querySelector('.arrival-count');
  const root = document.documentElement;
  let frame = 0, started = 0, elapsed = 0, pausedAt = 0, fallback = 0;
  let width = 1, height = 1, colors, particles = [], revealed = false;
  const duration = 8100;
  const clamp = v => Math.max(0, Math.min(1, v));
  const ease = v => 1 - Math.pow(1 - clamp(v), 3);
  const mix = (a,b,t) => a + (b-a)*t;
  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = width*dpr; canvas.height = height*dpr;
    ctx?.setTransform(dpr,0,0,dpr,0,0);
    const css = getComputedStyle(root);
    colors = [css.getPropertyValue('--accent').trim(),css.getPropertyValue('--muted').trim()];
    if (!particles.length) {
      // A deterministic knot, then the same four-point star used throughout the portfolio.
      const n = width < 600 ? 850 : 1500;
      for(let i=0;i<n;i++) {
        const u = i/n*Math.PI*2, v = i*2.399963;
        const r = 1+.24*Math.cos(3*u);
        const x=r*Math.cos(2*u), y=r*Math.sin(2*u), z=.42*Math.sin(3*u);
        const normal=.14;
        const theta=i*2.399963, radius=Math.sqrt((i*.6180339)%1);
        const sx=Math.cos(theta)*radius, sy=Math.sin(theta)*radius;
        const starScale=1/(Math.pow(Math.abs(sx),.72)+Math.pow(Math.abs(sy),.72)+.001);
        particles.push({x:x+Math.cos(v)*normal,y:y+Math.sin(v)*normal,z:z+Math.sin(v*.7)*normal,
          sx:sx*starScale*.95,sy:sy*starScale*.95,
          ox:Math.sin(i*13.7)*width,oy:Math.cos(i*7.1)*height,size:.8+(i%4)*.3});
      }
    }
  }
  function render(now) {
    frame=0;
    if(!dialog.open || document.hidden) return;
    elapsed=now-started;
    if(elapsed>=6600&&!revealed){revealed=true;document.dispatchEvent(new CustomEvent('arrivalreveal'));}
    const p=clamp(elapsed/duration), seconds=elapsed/1000;
    count.textContent=String(Math.round(p*100)).padStart(3,'0')+' / 100';
    phase.textContent=elapsed<1600?'Establishing a connection':elapsed<3550?'Following the signal':elapsed<5700?'Seeing beneath the surface':'Welcome to my corner of the web';
    if(ctx) {
      ctx.clearRect(0,0,width,height);
      const assemble=ease(elapsed/1900), morph=ease((elapsed-3600)/1950);
      const leave=ease((elapsed-6600)/1250);
      const mark=document.querySelector('.site-header .brand-star')?.getBoundingClientRect();
      const centerX=mix(width*.5,mark?mark.left+mark.width/2:48,leave);
      const centerY=mix(height*.44,mark?mark.top+mark.height/2:40,leave);
      const scale=mix(Math.min(width*.25,height*.26),16,leave);
      const rot=seconds*.17, cy=Math.cos(rot),sy=Math.sin(rot), tilt=.38;
      ctx.globalAlpha=1-clamp((elapsed-7750)/350);
      particles.forEach((pt,i)=>{
        const rx=pt.x*cy+pt.z*sy,rz=-pt.x*sy+pt.z*cy;
        const ry=pt.y*Math.cos(tilt)-rz*Math.sin(tilt);
        const depth=3/(3+rz*.38);
        const px=mix(rx*depth,pt.sx,morph),py=mix(ry*depth,pt.sy,morph);
        const x=centerX+px*scale+pt.ox*(1-assemble);
        const y=centerY+py*scale+pt.oy*(1-assemble);
        ctx.fillStyle=colors[i%5===0?1:0];
        const s=pt.size*mix(depth,.9,morph)*mix(1,.6,leave);
        ctx.fillRect(x,y,s,s);
      });
      ctx.globalAlpha=1;
    }
    if(elapsed>=duration){finish();return;}
    frame=requestAnimationFrame(render);
  }
  function finish() {
    cancelAnimationFrame(frame); clearTimeout(fallback); frame=0;
    if(!dialog.open) return;
    dialog.close(); root.classList.remove('intro-open');
    dialog.classList.remove('is-arriving');
    document.dispatchEvent(new CustomEvent('arrivalcomplete'));
    if(document.activeElement===dialog.querySelector('.intro-skip')) document.querySelector('.wordmark')?.focus({preventScroll:true});
  }
  function start() {
    if(dialog.open) return;
    if(reduced.matches) {
      document.querySelector('.site-header .brand-star')?.animate([{opacity:.4},{opacity:1}],{duration:180});
      return;
    }
    resize();
    try{dialog.showModal();}catch{return;}
    root.classList.add('intro-open');
    dialog.classList.add('is-arriving');
    started=performance.now();elapsed=0;pausedAt=0;revealed=false;
    document.dispatchEvent(new CustomEvent('arrivalstart'));
    frame=requestAnimationFrame(render);
    // An independent exit protects navigation if canvas or animation callbacks fail.
    fallback=setTimeout(finish,duration+1200);
    try{sessionStorage.setItem(key,'1');}catch{}
  }
  dialog.querySelector('.intro-skip').addEventListener('click',finish);
  dialog.addEventListener('cancel',e=>{e.preventDefault();finish();});
  document.addEventListener('click',e=>{if(e.target.closest('.replay-arrival'))start();});
  window.addEventListener('resize',()=>{if(dialog.open)resize();},{passive:true});
  window.addEventListener('pagehide',finish);
  reduced.addEventListener('change',()=>{if(reduced.matches)finish();});
  document.addEventListener('visibilitychange',()=>{
    if(!dialog.open)return;
    if(document.hidden){pausedAt=performance.now();cancelAnimationFrame(frame);clearTimeout(fallback);}
    else{started+=performance.now()-pausedAt;frame=requestAnimationFrame(render);fallback=setTimeout(finish,Math.max(200,duration-elapsed+1000));}
  });
  let visited=false;try{visited=!!sessionStorage.getItem(key);}catch{}
  if(!visited&&!location.hash)start();
})();
