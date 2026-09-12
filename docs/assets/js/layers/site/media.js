/* ARTANDAVOODI · Shared public media and link rendering; content is JSON-owned. */
import { assetUrl } from '../../core/data.js';
export function renderImage(record) {
  const figure = document.createElement('figure');
  const image = document.createElement('img');
  image.src = assetUrl(record.src);
  image.alt = record.alt;
  image.width = record.width;
  image.height = record.height;
  image.loading = 'lazy';
  image.decoding = 'async';
  figure.append(image);
  if (record.caption || record.credit) {
    const caption = document.createElement('figcaption');
    caption.textContent = [record.caption, record.credit].filter(Boolean).join(' · ');
    figure.append(caption);
  }
  return figure;
}
export function renderIcon(id, registry) {
  const record = (registry?.items || []).find(item => item.id === id);
  if (!record) return null;
  const image = document.createElement('img');
  image.className = 'catalogue-icon';
  if (record.monochrome) image.dataset.monochrome = 'true';
  image.src = assetUrl(record.src);
  image.alt = record.alt;
  image.decoding = 'async';
  return image;
}
export function renderLinks(records, target) {
  for (const record of records) {
    const url = new URL(record.url);
    const isMail = url.protocol === 'mailto:';
    if (!['https:', 'mailto:'].includes(url.protocol) || (!isMail && (url.username || url.password))) continue;
    const link = document.createElement('a');
    link.href = url.href;
    link.textContent = record.label;
    target.append(link);
  }
}
export function renderRecord(record, registry) {
  const article = document.createElement('article');
  article.className = 'catalogue-record';
  const icon = renderIcon(record.icon, registry);
  if (icon) article.append(icon);
  article.append(renderImage(record.cover));
  const title = document.createElement('h3');
  title.textContent = record.title;
  article.append(title);
  if (record.subtitle || record.description) {
    const description = document.createElement('p');
    description.className = 'catalogue-record__description';
    description.textContent = [record.subtitle, record.description].filter(Boolean).join(' · ');
    article.append(description);
  }
  const links = document.createElement('div');
  links.className = 'record-links';
  renderLinks(record.links, links);
  article.append(links);
  return article;
}
export function renderEmpty(target, message) {
  const text = document.createElement('p');
  text.className = 'muted';
  text.textContent = message;
  target.replaceChildren(text);
}
