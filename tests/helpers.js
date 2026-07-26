import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const jsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/js');

/**
 * Loads one of the site's browser scripts as a CommonJS module, bypassing the
 * require cache so each test gets a fresh copy of its internal state.
 */
export function loadModule(name) {
  const file = path.join(jsDir, `${name}.js`);
  delete require.cache[require.resolve(file)];
  return require(file);
}

export function setBody(html) {
  document.body.innerHTML = html;
}

export function click(el) {
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
}

export function keydown(el, key) {
  el.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true }));
}

export function input(el, value) {
  el.value = value;
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
}
