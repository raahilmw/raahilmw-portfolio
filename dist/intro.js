// The scan is decorative. The native dialog owns focus and Escape.
(() => {
  const dialog = document.querySelector('#site-intro');
  if (!dialog?.showModal) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'raahilmw-signature-v2';
  const phase = dialog.querySelector('.identity-state');
  const timers = [];
  const duration = 4600;
  let focusTarget;

  function finish() {
    timers.splice(0).forEach(clearTimeout);
    if (!dialog.open) return;
    dialog.close();
    root.classList.remove('intro-open');
    dialog.classList.remove('is-departing');
    document.dispatchEvent(new Event('arrivalcomplete'));
    focusTarget?.focus({preventScroll:true});
  }

  function start(trigger) {
    if (dialog.open || reduced.matches || document.hidden) return;
    focusTarget = trigger || document.querySelector('.site-header .wordmark');
    try { dialog.showModal(); } catch { return; }
    root.classList.add('intro-open');
    phase.textContent = 'Reading signature';
    document.dispatchEvent(new Event('arrivalstart'));
    try { sessionStorage.setItem(storageKey, '1'); } catch {}
    timers.push(setTimeout(() => { phase.textContent = 'Signature matched'; }, 2620));
    timers.push(setTimeout(() => {
      dialog.classList.add('is-departing');
      document.dispatchEvent(new Event('arrivalreveal'));
    }, duration - 420));
    timers.push(setTimeout(finish, duration));
  }

  dialog.querySelector('.intro-skip').addEventListener('click', finish);
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
  document.querySelector('.replay-arrival')?.addEventListener('click', event => start(event.currentTarget));
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
  window.addEventListener('pagehide', finish);
  let seen = false;
  try { seen = !!sessionStorage.getItem(storageKey); } catch {}
  if (!seen && !location.hash && !location.pathname.startsWith('/writeups/')) start();
})();
