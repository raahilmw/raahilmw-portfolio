// Small interactions share the same easing. No scroll interception or artificial cursor.
(() => {
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const intro=document.querySelector('#site-intro');
  const hero=document.querySelector('.home-hero');
  function entrance(){
    if(!hero || reduced.matches || hero.classList.contains('hero-arrived')) return;
    requestAnimationFrame(()=>hero.classList.add('hero-arrived'));
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
  // A section's surface catches the pointer; its hit target stays in place.
  document.querySelectorAll('.research-cover,.project-art,.expertise-list li,.orb-disc').forEach(surface=>{
    let frame=0,tx=0,ty=0,cx=0,cy=0;
    function tick(){
      frame=0;cx+=(tx-cx)*.14;cy+=(ty-cy)*.14;
      surface.style.setProperty('--pointer-x',(50+cx*35).toFixed(2)+'%');
      surface.style.setProperty('--pointer-y',(50+cy*35).toFixed(2)+'%');
      surface.style.setProperty('--tilt-x',(-cy*3).toFixed(2)+'deg');
      surface.style.setProperty('--tilt-y',(cx*4).toFixed(2)+'deg');
      if(Math.abs(tx-cx)+Math.abs(ty-cy)>.004)frame=requestAnimationFrame(tick);
    }
    surface.addEventListener('pointermove',event=>{
      if(!fine.matches||reduced.matches)return;
      const b=surface.getBoundingClientRect();tx=(event.clientX-b.left)/b.width*2-1;ty=(event.clientY-b.top)/b.height*2-1;
      if(!frame)frame=requestAnimationFrame(tick);
    },{passive:true});
    surface.addEventListener('pointerleave',()=>{tx=ty=0;if(!frame&&!reduced.matches)frame=requestAnimationFrame(tick);});
    reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;tx=ty=cx=cy=0;surface.style.removeProperty('--tilt-x');surface.style.removeProperty('--tilt-y');});
  });
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
