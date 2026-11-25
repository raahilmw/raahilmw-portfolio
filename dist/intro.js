// The scan is decorative. The native dialog owns focus and Escape.
(() => {
  const dialog = document.querySelector('#site-intro');
  if (!dialog?.showModal) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'raahilmw-signature-v1';
  const handle = dialog.querySelector('.identity-handle');
  const phase = dialog.querySelector('.identity-state');
  const name = 'raahilmw';
  const alphabet = 'acdef013789';
  const duration = 3050;
  let timer, started, focusTarget, revealed;

  function finish() {
    clearTimeout(timer);
    if (!dialog.open) return;
    dialog.close();
    root.classList.remove('intro-open');
    dialog.classList.remove('is-departing');
    document.dispatchEvent(new Event('arrivalcomplete'));
    focusTarget?.focus({preventScroll:true});
  }

  function tick() {
    const elapsed = performance.now() - started;
    if (elapsed >= duration) { finish(); return; }
    const fixed = Math.min(name.length, Math.max(0, Math.floor((elapsed - 400) / 160)));
    const cycle = Math.floor(elapsed / 82);
    handle.textContent = name.slice(0, fixed) + Array.from(name.slice(fixed), (_, i) =>
      alphabet[(cycle + i * 5) % alphabet.length]).join('');
    if (fixed === name.length) phase.textContent = 'Signature matched';
    if (!revealed && elapsed >= duration - 450) {
      revealed = true;
      dialog.classList.add('is-departing');
      document.dispatchEvent(new Event('arrivalreveal'));
    }
    timer = setTimeout(tick, Math.min(84, duration - elapsed));
  }

  function start(trigger) {
    if (dialog.open || reduced.matches || document.hidden) return;
    focusTarget = trigger || document.querySelector('.site-header .wordmark');
    try { dialog.showModal(); } catch { return; }
    root.classList.add('intro-open');
    phase.textContent = 'Reading signature';
    revealed = false;
    started = performance.now();
    document.dispatchEvent(new Event('arrivalstart'));
    try { sessionStorage.setItem(storageKey, '1'); } catch {}
    tick();
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
