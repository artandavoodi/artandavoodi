/* Supporting facts stay visible; the label mark links directly to its website. */
import { loadJson } from '../../../../core/data.js?v=9';
import { contextMarkup } from './markup.js';
import { observeDividers } from '../dividers.js';

export async function renderContext(icons) {
  const data = await loadJson('assets/data/music/context.json');
  const target = document.querySelector('[data-music-context]');
  target.innerHTML = contextMarkup(data, icons, document.documentElement.dataset.themeEffective);
  observeDividers([...target.children]);
}
