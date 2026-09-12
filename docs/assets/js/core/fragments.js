/* ARTANDAVOODI · Registered same-origin fragment mounting. */
import { assetUrl, loadJson } from './data.js?v=9';
export async function mountFragments() {
  const registry = await loadJson('assets/data/fragments.json');
  async function mount(target, ancestors = []) {
    const path = registry[target.dataset.fragment];
    if (!path) throw new Error(`Unregistered fragment: ${target.dataset.fragment}`);
    if (ancestors.includes(path)) throw new Error(`Circular fragment: ${path}`);
    const response = await fetch(assetUrl(path), { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Fragment unavailable: ${path}`);
    target.innerHTML = await response.text();
    await Promise.all([...target.querySelectorAll('[data-fragment]')].map(child => mount(child, [...ancestors, path])));
  }
  await Promise.all([...document.querySelectorAll('[data-fragment]')].map(target => mount(target)));
}
