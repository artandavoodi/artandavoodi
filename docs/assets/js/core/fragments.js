/* ARTANDAVOODI · Registered same-origin fragment mounting. */
import { assetUrl, loadJson } from './data.js';
export async function mountFragments() {
  const registry = await loadJson('assets/data/fragments.json');
  await Promise.all([...document.querySelectorAll('[data-fragment]')].map(async target => {
    const path = registry[target.dataset.fragment];
    if (!path) throw new Error(`Unregistered fragment: ${target.dataset.fragment}`);
    const response = await fetch(assetUrl(path));
    if (!response.ok) throw new Error(`Fragment unavailable: ${path}`);
    target.innerHTML = await response.text();
  }));
}
