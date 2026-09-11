/* ARTANDAVOODI · Registry-driven release filtering and rendering. */
import { renderRecord, renderEmpty } from '../media.js';
export function render(data, ui) {
  const target = document.querySelector('[data-music-items]');
  const filters = document.querySelector('[data-music-filters]');
  const update = category => {
    const items = data.items.filter(item => category === 'all' || item.category === category);
    if (items.length) target.replaceChildren(...items.map(renderRecord));
    else renderEmpty(target, ui.empty.music);
    for (const button of filters.children) button.setAttribute('aria-pressed', String(button.dataset.category === category));
  };
  for (const category of ui.musicCategories) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'control';
    button.dataset.category = category.id;
    button.textContent = category.label;
    button.addEventListener('click', () => update(category.id));
    filters.append(button);
  }
  update('all');
}
