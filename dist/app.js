const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector('#year').textContent = new Date().getFullYear();

// Navigation stays useful without a framework or external services.
const menu = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() { mobileNav.hidden = true; menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; mobileNav.hidden = !open; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!mobileNav.contains(event.target) && !menu.contains(event.target)) closeMenu(); });

const details = {
  pentest: { kicker: 'ASSESS / VALIDATE', title: 'Penetration testing', intro: 'A structured way to understand how a system can fail, and what that means for the people who depend on it.', items: ['Understand the agreed scope and map the application’s trust boundaries.', 'Investigate authentication, authorization, input handling, and API behavior.', 'Validate impact with reproducible evidence and communicate practical remediation.'] },
  hunting: { kicker: 'INVESTIGATE / DISCOVER', title: 'Bug hunting', intro: 'Curiosity drives the investigation. Small inconsistencies can reveal a much larger gap in a system’s assumptions.', items: ['Explore intended behavior before following unusual edge cases.', 'Examine access control and business logic across different user contexts.', 'Develop clear, reproducible reports within the program’s disclosure process.'] },
  automation: { kicker: 'ENGINEER / REPEAT', title: 'Security automation', intro: 'A useful workflow handles the repeatable steps and leaves room for human judgment.', items: ['Organize scoped assets and normalize information from different sources.', 'Connect discovery, validation, and reporting with purpose-built scripts.', 'Keep outputs readable, workflows repeatable, and manual review in the loop.'] }
};
const dialog = document.querySelector('#detail-dialog');
document.querySelectorAll('[data-detail]').forEach(button => button.addEventListener('click', () => {
  const detail = details[button.dataset.detail];
  document.querySelector('#detail-kicker').textContent = '+ ' + detail.kicker;
  document.querySelector('#detail-title').textContent = detail.title;
  document.querySelector('#detail-intro').textContent = detail.intro;
  document.querySelector('#detail-list').replaceChildren(...detail.items.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  dialog.showModal(); document.body.style.overflow = 'hidden';
}));
function closeDialog() { dialog.close(); }
dialog.querySelector('.dialog-close').addEventListener('click', closeDialog);
dialog.querySelector('.dialog-done').addEventListener('click', closeDialog);
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(); } });

let toastTimer;
function notify(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200); }
document.querySelector('.copy-handle').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('raahilmw'); notify('Handle copied: raahilmw'); }
  catch { notify('Your handle: raahilmw — select it below to copy.'); const selection = getSelection(); const range = document.createRange(); range.selectNodeContents(document.querySelector('.contact-handle')); selection.removeAllRanges(); selection.addRange(range); }
});

// A deterministic, browser-only demonstration. It never sends network requests.
const runButton = document.querySelector('#run-workflow');
const output = document.querySelector('#workflow-output');
const steps = [...document.querySelectorAll('[data-step]')];
const tracks = [...document.querySelectorAll('[data-track]')];
const messages = ['Mapping the example.test asset inventory…', 'Reviewing sample HTTP service metadata…', 'Grouping related assets and removing duplicates…', 'Preparing a concise investigation queue…'];
let workflowTimer;
runButton.addEventListener('click', () => {
  clearTimeout(workflowTimer); runButton.disabled = true; runButton.querySelector('span').textContent = 'Workflow running…';
  steps.forEach(el => el.classList.remove('active', 'done')); tracks.forEach(el => el.classList.remove('active', 'done'));
  let index = 0;
  function progress() {
    if (index > 0) { steps[index - 1].classList.replace('active', 'done'); tracks[index - 1].classList.replace('active', 'done'); }
    if (index === steps.length) { output.textContent = '✓ Simulation complete. A clear queue, ready for human review.'; runButton.disabled = false; runButton.querySelector('span').textContent = 'Run it again'; return; }
    steps[index].classList.add('active'); tracks[index].classList.add('active'); output.textContent = '› ' + messages[index]; index++;
    workflowTimer = setTimeout(progress, reduceMotion.matches ? 120 : 850);
  }
  progress();
});

// One light source illuminates neighboring card borders across the gutters.
if (matchMedia('(hover: hover)').matches && !reduceMotion.matches) {
  const cards = [...document.querySelectorAll('[data-glow]')]; const visible = new Set(); let pointer = null, scheduled = false;
  const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
  cards.forEach(card => observer.observe(card));
  function paint() { scheduled = false; const measured = [...visible].map(card => ({card, rect: card.getBoundingClientRect()})); measured.forEach(({card, rect}) => { if (!pointer) { card.style.setProperty('--lit', 0); return; } const x = pointer.x - rect.left, y = pointer.y - rect.top; const distance = Math.hypot(Math.max(0, -x, x - rect.width), Math.max(0, -y, y - rect.height)); card.style.setProperty('--mx', `${x}px`); card.style.setProperty('--my', `${y}px`); card.style.setProperty('--lit', distance < 255 ? 1 : 0); }); }
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(paint); } };
  document.addEventListener('pointermove', event => { pointer = {x:event.clientX,y:event.clientY}; schedule(); }, {passive:true});
  window.addEventListener('scroll', schedule, {passive:true}); window.addEventListener('resize', schedule);
  const clear = () => { pointer = null; schedule(); }; document.documentElement.addEventListener('pointerleave', clear); window.addEventListener('blur', clear); document.addEventListener('pointercancel', clear);
}

// Cached, consistently triangulated isolines from a single illustrative terrain.
const contourCanvas = document.querySelector('#contours');
const ctx = contourCanvas.getContext('2d');
const contact = document.querySelector('.contact-section');
let contourPath, width = 1, height = 1, highlight = null, pulseStart = 0, pulseOrigin = null, contourFrame = 0;
function elevation(x,y) { return Math.sin(x * 6.5 + y * 1.8) * .23 + Math.cos(y * 9 - x * 2) * .17 + Math.exp(-((x-.2)**2/.04+(y-.65)**2/.18))*.7 + Math.exp(-((x-.85)**2/.08+(y-.2)**2/.14))*.65; }
function createContours() {
  const rect = contact.getBoundingClientRect(); width=rect.width; height=rect.height;
  const dpr=Math.min(devicePixelRatio,2); contourCanvas.width=width*dpr; contourCanvas.height=height*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  contourPath=new Path2D(); const nx=100,ny=55; const nodes=[];
  for(let y=0;y<=ny;y++) { nodes[y]=[]; for(let x=0;x<=nx;x++) nodes[y][x]={x:x/nx*width,y:y/ny*height,z:elevation(x/nx,y/ny)}; }
  function triangle(points,level) { const hits=[]; for(let i=0;i<3;i++){ const a=points[i],b=points[(i+1)%3]; if((a.z<level)!==(b.z<level)){const t=(level-a.z)/(b.z-a.z);hits.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}} if(hits.length===2){contourPath.moveTo(hits[0].x,hits[0].y);contourPath.lineTo(hits[1].x,hits[1].y);} }
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const a=nodes[y][x],b=nodes[y][x+1],c=nodes[y+1][x+1],d=nodes[y+1][x];for(let level=-.4;level<1;level+=.035){triangle([a,b,c],level);triangle([a,c,d],level);}}
  drawContours();
}
function drawContours(now=0) {
  contourFrame=0;ctx.clearRect(0,0,width,height);ctx.lineWidth=.65;ctx.strokeStyle='#8b9fc52b';ctx.stroke(contourPath);
  if(highlight&&!reduceMotion.matches){const gradient=ctx.createRadialGradient(highlight.x,highlight.y,0,highlight.x,highlight.y,180);gradient.addColorStop(0,'#abbff4aa');gradient.addColorStop(1,'#abbff400');ctx.strokeStyle=gradient;ctx.stroke(contourPath);}
  if(pulseStart&&pulseOrigin&&!reduceMotion.matches){ const t=(now-pulseStart)/1500;if(t<1){const radius=t*Math.hypot(width,height);const gradient=ctx.createRadialGradient(pulseOrigin.x,pulseOrigin.y,Math.max(0,radius-80),pulseOrigin.x,pulseOrigin.y,Math.max(1,radius+60));gradient.addColorStop(0,'#bed0ff00');gradient.addColorStop(.55,`rgba(190,208,255,${.55*(1-t)})`);gradient.addColorStop(1,'#bed0ff00');ctx.strokeStyle=gradient;ctx.lineWidth=1;ctx.stroke(contourPath);contourFrame=requestAnimationFrame(drawContours);}else pulseStart=0;}
}
const scheduleContours=()=>{if(!contourFrame)contourFrame=requestAnimationFrame(drawContours);};
contact.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const r=contact.getBoundingClientRect();highlight={x:event.clientX-r.left,y:event.clientY-r.top};scheduleContours();},{passive:true});
contact.addEventListener('pointerleave',()=>{highlight=null;scheduleContours();});
contact.addEventListener('pointerdown',event=>{if(event.target.closest('button,a')||reduceMotion.matches)return;const r=contact.getBoundingClientRect();pulseOrigin={x:event.clientX-r.left,y:event.clientY-r.top};pulseStart=performance.now();scheduleContours();});
new ResizeObserver(createContours).observe(contact);
import('./artifact.js').catch(() => { document.querySelector('#artifact-control').addEventListener('click',()=>notify('The interactive artifact needs WebGL. Your browser is showing the static version.')); });
