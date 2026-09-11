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
export function renderLinks(records, target) {
  for (const record of records) {
    const url = new URL(record.url);
    if (url.protocol !== 'https:' || url.username || url.password) continue;
    const link = document.createElement('a');
    link.href = url.href;
    link.textContent = record.label;
    target.append(link);
  }
}
export function renderRecord(record) {
  const article = document.createElement('article');
  article.className = 'catalogue-record';
  article.append(renderImage(record.cover));
  const title = document.createElement('h3');
  title.textContent = record.title;
  const links = document.createElement('div');
  links.className = 'record-links';
  renderLinks(record.links, links);
  article.append(title, links);
  return article;
}
export function renderEmpty(target, message) {
  const text = document.createElement('p');
  text.className = 'muted';
  text.textContent = message;
  target.replaceChildren(text);
}
