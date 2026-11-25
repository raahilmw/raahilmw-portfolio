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
      closeButton.focus({preventScroll:true});
    });
  });
  function close(){if(viewer.open)viewer.close();}
  closeButton.addEventListener('click',close);
  viewer.addEventListener('cancel',event=>{event.preventDefault();close();});
  viewer.addEventListener('close',()=>{root.classList.remove('evidence-open');trigger?.focus({preventScroll:true});});
  viewer.addEventListener('click',event=>{
    if(event.target!==viewer)return;
    const b=viewer.getBoundingClientRect();
    if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)close();
  });
})();
