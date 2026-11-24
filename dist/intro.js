// Show the brand reveal once per visitor. Native dialog keeps the skip control reachable.
(() => {
  const key = 'raahilmw-visited-v1';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || location.hash) return;
  const stores = [];
  for (const name of ['localStorage', 'sessionStorage']) {
    try {
      const storage = window[name];
      if (storage.getItem(key)) return;
      stores.push(storage);
    } catch { /* Use the next available store. */ }
  }
  if (!stores.length) return;
  const dialog = document.querySelector('#site-intro');
  const mark = document.querySelector('.site-header .brand-star');
  if (!dialog || !mark || typeof dialog.showModal !== 'function') return;
  const pixelLogo = dialog.querySelector('.pixel-logo');
  // A four-pointed star laid out on a square pixel grid, matching the header mark.
  const rows = [1,1,3,3,5,7,9,13,17,13,9,7,5,3,3,1,1];
  const fragment = document.createDocumentFragment();
  rows.forEach((count, y) => {
    const left = (17 - count) / 2;
    for (let i = 0; i < count; i++) {
      const x = left + i;
      const cell = document.createElement('i');
      cell.style.gridArea = (y + 1) + ' / ' + (x + 1);
      cell.style.setProperty('--beat', ((x * 7 + y * 11) % 15) * 20 + 'ms');
      cell.style.setProperty('--dx', ((x * 3 + y) % 7 - 3) * 5 + 'px');
      cell.style.setProperty('--dy', ((y * 2 + x) % 7 - 3) * 5 + 'px');
      fragment.appendChild(cell);
    }
  });
  pixelLogo.appendChild(fragment);
  try { dialog.showModal(); } catch { return; }
  for (const storage of stores) {
    try { storage.setItem(key, '1'); } catch { /* Optional persistence. */ }
  }
  document.documentElement.classList.add('intro-open');
  const point = mark.getBoundingClientRect();
  const logo = pixelLogo.getBoundingClientRect();
  pixelLogo.style.setProperty('--land-x', (point.left + point.width / 2 - (logo.left + logo.width / 2)) + 'px');
  pixelLogo.style.setProperty('--land-y', (point.top + point.height / 2 - (logo.top + logo.height / 2)) + 'px');
  pixelLogo.style.setProperty('--land-scale', Math.max(.08, point.width / logo.width));
  const skip = dialog.querySelector('button');
  let timer;
  function finish() {
    clearTimeout(timer);
    document.documentElement.classList.remove('intro-open');
    reduced.removeEventListener('change', finish);
    window.removeEventListener('pagehide', finish);
    if (dialog.open) dialog.close();
    if (document.activeElement === skip) mark.parentElement.focus({ preventScroll: true });
  }
  skip.addEventListener('click', finish, { once:true });
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
  dialog.addEventListener('animationend', event => { if (event.animationName === 'curtain-clear') finish(); });
  reduced.addEventListener('change', finish);
  window.addEventListener('pagehide', finish);
  timer = setTimeout(finish, 2050);
})();
