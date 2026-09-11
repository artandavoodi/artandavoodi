/* ARTANDAVOODI · Publication catalogue renderer. */
import { renderRecord, renderEmpty } from '../media.js';
export function render(data, ui) {
  const target = document.querySelector('[data-publication-items]');
  if (data.items.length) target.replaceChildren(...data.items.map(renderRecord));
  else renderEmpty(target, ui.empty.publications);
}
