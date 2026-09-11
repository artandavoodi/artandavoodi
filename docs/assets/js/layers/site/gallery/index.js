/* ARTANDAVOODI · Gallery collection renderer. */
import { renderImage, renderEmpty } from '../media.js';
export function render(data, ui) {
  const target = document.querySelector('[data-gallery-items]');
  if (data.items.length) target.replaceChildren(...data.items.map(item => renderImage(item.image)));
  else renderEmpty(target, ui.empty.gallery);
}
