// Small interactions share the same easing. No scroll interception or artificial cursor.
(() => {
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const intro=document.querySelector('#site-intro');
  const hero=document.querySelector('.home-hero');
  function entrance(){
    if(reduced.matches) return;
    if(hero) {
      if (!hero.classList.contains('hero-arrived')) requestAnimationFrame(() => hero.classList.add('hero-arrived'));
    } else {
      document.body.classList.add('page-arrived');
    }
  }
  if(!intro?.open) entrance();
  document.addEventListener('arrivalreveal',entrance);
  document.addEventListener('arrivalcomplete',entrance);
  document.addEventListener('arrivalstart',()=>hero?.classList.remove('hero-arrived'));
  const observed=document.querySelectorAll('.home-connect,.research-card,.project-feature,.expertise-list,.research-map,.contact-record,.artifact-stage,.social-orbits');
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(({target,isIntersecting})=>{
        target.classList.toggle('motion-visible',isIntersecting);
        if(isIntersecting)target.classList.add('has-entered');
      });
    },{threshold:.12});
    observed.forEach(el=>observer.observe(el));
  }
  document.addEventListener('visibilitychange',()=>root.classList.toggle('motion-paused',document.hidden));
  // Coalesce pointer input across surfaces, keeping measurement on a stable hit target.
  const surfaces = '.research-cover,.project-art,.expertise-list li,.social-orb';
  let active = null, point, pointerFrame = 0;
  function resetSurface() {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    if (!active) return;
    for (const prop of ['--tilt-x','--tilt-y','--pointer-x','--pointer-y']) active.style.removeProperty(prop);
    active = null;
  }
  function paintSurface() {
    pointerFrame = 0;
    if (!active) return;
    const box = active.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const x = Math.max(0, Math.min(1, (point.x - box.left) / box.width));
    const y = Math.max(0, Math.min(1, (point.y - box.top) / box.height));
    active.style.setProperty('--pointer-x', (100*x).toFixed(1)+'%');
    active.style.setProperty('--pointer-y', (100*y).toFixed(1)+'%');
    active.style.setProperty('--tilt-x', (3-6*y).toFixed(2)+'deg');
    active.style.setProperty('--tilt-y', (8*x-4).toFixed(2)+'deg');
  }
  document.querySelectorAll(surfaces).forEach(surface => {
    surface.addEventListener('pointermove', event => {
      if (!fine.matches || reduced.matches || document.hidden || event.pointerType === 'touch') return;
      if (surface !== active) { resetSurface(); active = surface; }
      point = {x:event.clientX,y:event.clientY};
      if (!pointerFrame) pointerFrame = requestAnimationFrame(paintSurface);
    }, {passive:true});
    surface.addEventListener('pointerleave', resetSurface);
    surface.addEventListener('pointercancel', resetSurface);
  });
  window.addEventListener('blur', resetSurface);
  fine.addEventListener('change', resetSurface);
  reduced.addEventListener('change', resetSurface);
  // Hover navigation follows the link rather than moving the link itself.
  const nav=document.querySelector('.desktop-nav');
  if(nav){
    const marker=document.createElement('i');marker.className='nav-tracker';marker.setAttribute('aria-hidden','true');nav.append(marker);
    function follow(link){
      if(!link)return;const b=link.getBoundingClientRect(),parent=nav.getBoundingClientRect();
      marker.style.width=b.width+'px';marker.style.transform='translateX('+(b.left-parent.left)+'px)';
    }
    nav.querySelectorAll('a').forEach(link=>{
      link.addEventListener('pointerenter',()=>follow(link));link.addEventListener('focus',()=>follow(link));
    });
    nav.addEventListener('pointerleave',()=>follow(nav.querySelector('[aria-current]')));
    nav.addEventListener('focusout',()=>follow(nav.querySelector('[aria-current]')));
    window.addEventListener('resize',()=>follow(nav.querySelector('[aria-current]')),{passive:true});
    document.fonts?.ready.then(()=>follow(nav.querySelector('[aria-current]')));
    follow(nav.querySelector('[aria-current]'));
  }
  // A subtle sweep follows an actual copy operation, alongside the existing live announcement.
  document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',()=>{
    if(reduced.matches)return;button.getAnimations().forEach(a=>a.cancel());
    button.animate([{boxShadow:'0 0 0 0 var(--edge)'},{boxShadow:'0 0 0 8px transparent'},{boxShadow:'0 0 0 0 transparent'}],{duration:550,easing:'ease-out'});
  }));
  // A quiet chapter marker keeps your position in the long About page.
  const chapters=[...document.querySelectorAll('.about-chapter,#about-me')];
  if(chapters.length&&'IntersectionObserver'in window){
    const active=new Set();
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(e=>e.isIntersecting?active.add(e.target):active.delete(e.target));
      const current=[...active].sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0];
      if(!current)return;
      document.querySelectorAll('.about-index a').forEach(a=>{
        if(a.hash==='#'+current.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
      });
    },{rootMargin:'-10% 0px -55% 0px'});
    chapters.forEach(c=>observer.observe(c));
  }
})();
