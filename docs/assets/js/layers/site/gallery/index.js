/* ARTANDAVOODI · Gallery collection renderer. */
import { renderImage, renderEmpty } from '../media.js?v=4';
export function render(data, ui) {
  const target = document.querySelector('[data-gallery-items]');
  target.replaceChildren(...data.collections.map(collection => {
    const section = document.createElement('section');
    section.className = 'gallery__collection';
    const title = document.createElement('h3');
    title.textContent = collection.title;
    const items = document.createElement('div');
    items.className = 'gallery__images';
    const records = data.items.filter(item => item.collection === collection.id);
    if (records.length) items.append(...records.map(item => renderImage(item.image)));
    else renderEmpty(items, collection.empty);
    section.append(title, items);
    return section;
  }));
}
