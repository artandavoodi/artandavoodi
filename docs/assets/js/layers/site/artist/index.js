/* ARTANDAVOODI · Artist profile renderer. */
import { renderImage, renderLinks } from '../media.js';
export function render(data, ui) {
  document.querySelector('[data-artist-name]').textContent = data.name;
  document.querySelector('[data-artist-description]').textContent = ui.artistDescription;
  if (data.portrait) document.querySelector('[data-portrait]').append(renderImage(data.portrait));
  const biography = document.querySelector('[data-biography]');
  biography.textContent = data.biography;
  biography.hidden = !data.biography;
  renderLinks(data.links, document.querySelector('[data-artist-links]'));
}
