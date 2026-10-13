/* ARTANDAVOODI · Artist identity renderer. */
import { renderImage } from '../media.js?v=4';
import { loadJson } from '../../../core/data.js';
import { homepageMarkup } from './homepage.js';
export async function render(data, ui, icons) {
  const biography = document.querySelector('[data-artist-biography]');
  biography.textContent = data.biography || '';
  biography.hidden = !data.biography;
  document.querySelector('[data-artist-name]').textContent = data.name;
  if (data.portrait) {
    const portrait = renderImage(data.portrait);
    portrait.querySelector('img').loading = 'eager';
    document.querySelector('[data-portrait]').replaceChildren(portrait);
  }
  const site = await loadJson('assets/data/site.json');
  const [music, gallery, hub] = await Promise.all(['music','gallery','hub'].map(key => loadJson(site.catalogues[key])));
  const markup = homepageMarkup(data, music, gallery, hub);
  for (const key of ['actions','latest','visual']) {
    document.querySelector(`[data-artist-${key}]`).innerHTML = markup[key];
  }
}
