/* ARTANDAVOODI · Music context renderer; empty editorial collections stay unpublished. */
import { loadJson, assetUrl } from '../../../../core/data.js?v=9';
import { renderImage, renderLinks, renderIcon } from '../../media.js?v=5';
import { observeDividers } from '../dividers.js';

function renderItem(item, headingTag) {
  const entry = document.createElement('article');
  entry.className = 'music-context__item';
  const heading = document.createElement(headingTag);
  heading.textContent = item.title;
  entry.append(heading);
  if (item.description) {
    const description = document.createElement('p');
    description.textContent = item.description;
    entry.append(description);
  }
  if (item.image) entry.append(renderImage(item.image));
  if (item.links) renderLinks(item.links, entry);
  return entry;
}

const hasContent = record => Boolean(record.description || record.items?.length);

export async function renderContext(icons) {
  const data = await loadJson('assets/data/music/context.json');
  const sections = data.sections.filter(record => hasContent(record) || record.groups?.some(hasContent)).map(record => {
    const section = document.createElement('section');
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const title = document.createElement('h3');
    title.textContent = record.title;
    summary.append(title);
    const icon = renderIcon(data.disclosureIcon, icons);
    if (icon) summary.append(icon);
    details.append(summary);
    if (record.description) {
      const description = document.createElement('p');
      description.textContent = record.description;
      details.append(description);
    }
    for (const item of record.items || []) details.append(renderItem(item, 'h4'));
    for (const group of (record.groups || []).filter(hasContent)) {
      const content = renderItem(group, 'h4');
      const list = document.createElement('ul');
      list.className = 'music-context__directory';
      for (const item of group.items || []) {
        const row = document.createElement('li');
        const link = document.createElement('a');
        const url = new URL(assetUrl(data.detailPage));
        url.searchParams.set('item', item.id);
        link.href = url.href;
        link.textContent = item.title;
        const arrow = renderIcon(data.linkIcon, icons);
        if (arrow) link.append(arrow);
        row.append(link);
        list.append(row);
      }
      content.append(list);
      details.append(content);
    }
    section.append(details);
    return section;
  });
  document.querySelector('[data-music-context]').replaceChildren(...sections);
  observeDividers(sections);
}
