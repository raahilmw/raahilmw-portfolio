// Contact order and mail destinations follow the owner's supplied template.
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const intro = document.querySelector('#site-intro');
  const targets = [...document.querySelectorAll('[data-rise]')];
  const inView = new Set();
  function reveal(el) { el.classList.add('is-in'); }
  function settle() { inView.forEach(reveal); }
  if (!reduced.matches && 'IntersectionObserver' in window) {
    // Opt in only after the observer is available; content is readable without JS.
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('motion-visible', entry.isIntersecting);
        if (entry.isIntersecting) {
          inView.add(entry.target);
          if (!intro?.open) reveal(entry.target);
        } else inView.delete(entry.target);
      });
    }, { threshold: .1 });
    targets.forEach(el => observer.observe(el));
    root.classList.add('has-contact-motion');
  } else targets.forEach(reveal);
  document.addEventListener('arrivalcomplete', settle);
  reduced.addEventListener('change', () => {
    if (reduced.matches) targets.forEach(reveal);
  });

  const picker = document.querySelector('#mail-picker');
  const openers = [...document.querySelectorAll('[data-mail-open]')];
  if (!picker || !openers.length || typeof picker.showModal !== 'function') return;
  let trigger = openers[0];
  function unlock() {
    root.classList.remove('picker-open');
    trigger?.focus({ preventScroll: true });
  }
  function close() { if (picker.open) picker.close(); }
  openers.forEach(opener => opener.addEventListener('click', event => {
    // Keep the mailto href as a fallback if opening the dialog fails.
    if (picker.open) { event.preventDefault(); return; }
    try { picker.showModal(); } catch { return; }
    event.preventDefault();
    trigger = opener;
    root.classList.add('picker-open');
    picker.querySelector('.mail-option')?.focus({ preventScroll: true });
  }));
  picker.addEventListener('close', unlock);
  picker.addEventListener('cancel', event => { event.preventDefault(); close(); });
  // Only clicks on the backdrop close the picker, not whitespace inside it.
  picker.addEventListener('click', event => {
    if (event.target !== picker) return;
    const rect = picker.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
  });
  picker.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', close));
})();
