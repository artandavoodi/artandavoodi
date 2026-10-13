/* Enhance the canonical photo page; native links remain usable without JS. */
import { loadJson } from '../../../core/data.js';
import { selection, photoUrl } from './model.js';
import { returnContext } from './continuity.js';
import { renderImage } from '../media.js?v=6';
import { assetUrl } from '../../../core/data.js';
const data = await loadJson('assets/data/gallery/images.json');
const article = document.querySelector('[data-gallery-photo]');
const params = new URLSearchParams(location.search);
const current = data.items.find(i => i.id === article?.dataset.galleryPhoto);
const filtered = selection(data, params);
const items = filtered.some(i => i.id === current?.id) ? filtered : data.items;
const index = items.findIndex(i => i.id === current?.id);
const previous = document.querySelector('[data-photo-previous]');
const next = document.querySelector('[data-photo-next]');
function bind(link, item) {
  link.hidden = !item;
  if (item) link.href = photoUrl(item, params);
}
bind(previous, items[index - 1]); bind(next, items[index + 1]);
const back = document.querySelector('[data-document-back]');
const context = returnContext();
back.href = context ? `${context.path}${context.query}` : `/gallery/${params.size ? `?${params}` : ''}`;
back.setAttribute('aria-label', data.controls.back);
document.querySelector('[data-photo-count]').textContent = `${index + 1} / ${items.length}`;
const strip = document.querySelector('[data-gallery-filmstrip]');
strip.replaceChildren(...items.map(item => {
  const link = document.createElement('a');
  link.href = photoUrl(item, params); link.setAttribute('aria-label', item.image.alt);
  if (item.id === current.id) link.setAttribute('aria-current', 'page');
  const preview = item.image.variants?.[0] || item.image;
  link.append(renderImage({...item.image,src:preview.src,variants:[]}));
  return link;
}));
strip.querySelector('[aria-current]')?.scrollIntoView({block:'nearest',inline:'center'});
// Respect data-saving mode and only warm the two neighbouring responsive previews.
if (!navigator.connection?.saveData) for (const item of [items[index-1],items[index+1]].filter(Boolean)) {
  const preview = new Image();
  preview.srcset = (item.image.variants || []).map(v => `${assetUrl(v.src)} ${v.width}w`).join(', ');
  preview.sizes = item.image.sizes || '100vw';
  preview.src = assetUrl(item.image.variants?.at(-2)?.src || item.image.src);
}
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) return;
  const link = event.key === 'ArrowLeft' ? previous : event.key === 'ArrowRight' ? next : event.key === 'Escape' ? back : null;
  if (link && !link.hidden) { event.preventDefault(); location.assign(link.href); }
});
let start;
article.addEventListener('touchcancel', () => { start = null; }, {passive:true});
article.addEventListener('touchstart', event => { if (event.touches.length === 1) start = { x:event.touches[0].clientX, y:event.touches[0].clientY }; else start = null; }, {passive:true});
article.addEventListener('touchend', event => {
  if (!start || event.touches.length) return;
  const touch = event.changedTouches[0], dx = touch.clientX-start.x, dy = touch.clientY-start.y;
  start = null;
  if (Math.abs(dx) < article.clientWidth / 5 || Math.abs(dx) < Math.abs(dy) * 2) return;
  const link = dx < 0 ? next : previous;
  if (!link.hidden) { event.preventDefault(); location.assign(link.href); }
}, {passive:false});
document.documentElement.dataset.galleryViewerReady = 'true';
