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
  const observed=document.querySelectorAll('.home-connect,.research-card,.project-feature,.expertise-list,.kit-chapter,.research-map,.contact-record,.inspection-lens,.social-orbits');
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
  // A subtle sweep follows an actual copy operation, alongside the existing live announcement.
  document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',()=>{
    if(reduced.matches)return;button.getAnimations().forEach(a=>a.cancel());
    button.animate([{boxShadow:'0 0 0 0 var(--edge)'},{boxShadow:'0 0 0 8px transparent'},{boxShadow:'0 0 0 0 transparent'}],{duration:550,easing:'ease-out'});
  }));
  // The last heading can reach the end of the page before it reaches the reading line.
  const index = document.querySelector('.about-index');
  if (index) {
    const links = [...index.querySelectorAll('a[href^="#"]')];
    const chapters = links.map(link => document.getElementById(link.hash.slice(1)));
    let selected, scheduled = 0, chapterTops;
    function highlight(link) {
      if (!link || link === selected) return;
      selected?.removeAttribute('aria-current');
      link.setAttribute('aria-current', 'location');
      selected = link;
    }
    function updateChapter() {
      scheduled = 0;
      const page = document.scrollingElement || document.documentElement;
      if (!chapterTops) {
        chapterTops = chapters.map(section => section
          ? page.scrollTop + section.getBoundingClientRect().top : Infinity);
      }
      const height = document.documentElement.clientHeight;
      const bottom = page.scrollHeight - height;
      if (bottom > 0 && page.scrollTop >= bottom - 2) {
        highlight(links[links.length - 1]);
        return;
      }
      const line = Math.min(150, height * .30);
      let current = 0;
      chapterTops.forEach((top, position) => {
        if (top <= page.scrollTop + line) current = position;
      });
      highlight(links[current]);
    }
    function scheduleChapter() {
      if (!scheduled) scheduled = requestAnimationFrame(updateChapter);
    }
    function remeasureChapters() {
      chapterTops = null;
      scheduleChapter();
    }
    function syncAnchor() {
      const link = links.find(item => item.hash === location.hash);
      if (link) highlight(link);
      scheduleChapter();
    }
    window.addEventListener('scroll', scheduleChapter, {passive:true});
    window.addEventListener('resize', remeasureChapters);
    window.addEventListener('hashchange', syncAnchor);
    window.addEventListener('pageshow', syncAnchor);
    document.fonts?.ready.then(remeasureChapters);
    if ('ResizeObserver' in window) {
      const sizes = new ResizeObserver(remeasureChapters);
      sizes.observe(document.body);
      chapters.forEach(section => { if (section) sizes.observe(section); });
    }
    syncAnchor();
  }
})();
