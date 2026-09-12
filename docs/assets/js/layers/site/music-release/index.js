/* ARTANDAVOODI · Release detail renderer; release records remain JSON-owned. */
import { loadJson, assetUrl } from '../../../core/data.js';
import { renderIcon } from '../media.js';

const releaseId = location.pathname.split('/').filter(Boolean).at(-2) || 'gone-demo';
const field = (label, value) => {
  if (!value) return null;
  const row = document.createElement('p');
  const name = document.createElement('span');
  name.className = 'music-release-detail__label';
  name.textContent = label;
  const content = document.createElement('span');
  content.className = 'music-release-detail__value';
  content.textContent = value;
  row.append(name, content);
  return row;
};

const render = async () => {
  const [catalogue, ui, icons] = await Promise.all([
    loadJson('assets/data/music/releases.json'),
    loadJson('assets/data/interface.json'),
    loadJson('assets/data/icons.json'),
  ]);
  const item = catalogue.items.find(record => record.id === releaseId);
  if (!item) throw new Error(`Release not found: ${releaseId}`);
  const root = document.querySelector('[data-release-content]');
  const article = document.createElement('article');
  article.className = 'music-release-detail';
  const image = document.createElement('img');
  image.src = assetUrl(item.cover.src); image.alt = item.cover.alt; image.width = item.cover.width; image.height = item.cover.height;
  const figure = document.createElement('figure'); figure.className = 'music-release-detail__cover'; figure.append(image);
  const heading = document.createElement('header'); heading.className = 'music-release-detail__heading';
  const title = document.createElement('h1'); title.className = 'music-release-detail__title'; title.textContent = item.title;
  const subtitle = document.createElement('p'); subtitle.textContent = [item.subtitle, item.artist].filter(Boolean).join(' · '); heading.append(title, subtitle);
  const meta = document.createElement('div'); meta.className = 'music-release-detail__meta';
  for (const record of ui.musicDetails || []) { const row = field(record.label, item[record.key]); if (row) meta.append(row); }
  const story = document.createElement('div'); story.className = 'music-release-detail__story';
  for (const record of ui.musicStoryFields || []) { const row = field(record.label, item[record.key]); if (row) story.append(row); }
  const links = document.createElement('div'); links.className = 'music-release-detail__links';
  for (const record of item.links || []) { const link = document.createElement('a'); link.href = record.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.setAttribute('aria-label', record.label); const icon = renderIcon(record.icon, icons); if (icon) link.append(icon); links.append(link); }
  article.append(figure, heading, meta); if (story.children.length) article.append(story); if (links.children.length) article.append(links); root.replaceChildren(article); document.title = `${item.title} · Artan Davoodi`;
};
render().catch(error => { document.querySelector('[data-release-content]').textContent = 'This release could not be loaded.'; console.error('[artandavoodi]', error); });
