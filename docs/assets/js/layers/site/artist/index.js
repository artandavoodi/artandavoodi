/* ARTANDAVOODI · Artist identity renderer. */
import { renderImage } from '../media.js?v=4';
export function render(data, ui, icons) {
  const biography = document.querySelector('[data-artist-biography]');
  biography.textContent = data.biography || '';
  biography.hidden = !data.biography;
  document.querySelector('[data-artist-name]').textContent = data.name;
  if (data.portrait) {
    const portrait = renderImage(data.portrait);
    portrait.querySelector('img').loading = 'eager';
    document.querySelector('[data-portrait]').replaceChildren(portrait);
  }
}
