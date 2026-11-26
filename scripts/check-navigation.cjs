const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Control extends EventTarget {
  attributes = new Map();
  getAttribute(name) { return this.attributes.get(name); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  contains(node) { return node === this; }
  focus() { this.focused = true; }
}

const menu = new Control();
const panel = new Control();
const document = new Control();
const link = new Control();
const breakpoint = new Control();
panel.hidden = true;
panel.querySelectorAll = () => [link];
document.querySelectorAll = () => [];
document.querySelector = name => ({ '.menu-toggle': menu, '.mobile-nav': panel })[name];
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/app.js'), 'utf8'), {
  document, matchMedia: () => breakpoint
});

function clickMenu() { menu.dispatchEvent(new Event('click')); }
function expectOpen(open) {
  assert.equal(panel.hidden, !open);
  assert.equal(menu.getAttribute('aria-expanded'), String(open));
}

clickMenu();
expectOpen(true);
clickMenu();
clickMenu();
expectOpen(true);
document.dispatchEvent(Object.assign(new Event('keydown'), {key:'Escape'}));
expectOpen(false);
assert.equal(menu.focused, true);
for (const [control, event] of [[link, 'click'], [document, 'click'], [breakpoint, 'change']]) {
  clickMenu();
  control.dispatchEvent(new Event(event));
  expectOpen(false);
}
console.log('Menu visibility, rapid clicks, Escape focus, outside click, link and breakpoint passed.');
