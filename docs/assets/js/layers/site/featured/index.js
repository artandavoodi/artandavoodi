/* ARTANDAVOODI · Resolve featured references without duplicating catalogue content. */
import { loadJson } from '../../../core/data.js?v=9';
import { renderImage } from '../media.js?v=4';

export async function render(config, site) {
  const selections = config.items.filter(item => item.enabled !== false);
  const catalogues = new Map();
  for (const name of new Set(selections.map(item => item.catalogue))) {
    if (!site.catalogues[name]) throw new Error(`Unregistered featured catalogue: ${name}`);
    catalogues.set(name, await loadJson(site.catalogues[name]));
  }
  const cards = selections.map(selection => {
    const record = catalogues.get(selection.catalogue).items.find(item => item.id === selection.id);
    if (!record) throw new Error(`Unknown featured item: ${selection.id}`);
    const url = new URL(selection.href, location.href);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid featured destination');
    const card = document.createElement('a');
    card.className = 'featured__item';
    card.href = url.href;
    const image = record.cover || record.image;
    if (image) card.append(renderImage(image));
    const title = document.createElement('h3');
    title.textContent = record.title;
    card.append(title);
    if (record.subtitle || record.type) {
      const type = document.createElement('p');
      type.textContent = record.subtitle || record.type;
      card.append(type);
    }
    return card;
  });
  document.querySelector('[data-featured-title]').textContent = config.title;
  document.querySelector('[data-featured-items]').replaceChildren(...cards);
  document.querySelector('[data-featured]').hidden = cards.length === 0;
}
