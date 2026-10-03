/* ARTANDAVOODI · Hub connection renderer; hub content remains JSON-owned. */
import { renderIcon } from '../media.js?v=5';
export function render(data, ui, icons) {
  document.querySelector('[data-hub-title]').textContent = data.title;
  document.querySelector('[data-hub-description]').textContent = data.description;
  const target = document.querySelector('[data-hub-links]');
  target.replaceChildren();
  const groups = new Map();
  for (const record of data.links || []) {
    if (!record.url) continue;
    const url = new URL(record.url);
    const isMail = url.protocol === 'mailto:';
    if (!['https:', 'mailto:'].includes(url.protocol) || (!isMail && (url.username || url.password))) continue;
    const groupKey = record.category;
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(record);
  }
  for (const group of data.groups || []) {
    const records = groups.get(group.id);
    if (!records?.length) continue;
    const section = document.createElement('section');
    section.className = 'hub__group';
    section.dataset.presentation = group.presentation;
    const heading = document.createElement('h3');
    heading.textContent = group.label;
    const links = document.createElement('div');
    links.className = 'hub__group-links';
    for (const record of records.sort((a, b) => (a.order || 0) - (b.order || 0))) {
      const link = document.createElement('a');
      link.href = record.url;
      link.className = 'hub__link';
      link.setAttribute('aria-label', record.label);
      const icon = renderIcon(record.icon, icons);
      if (icon) link.append(icon);
      const label = document.createElement('span');
      label.className = 'hub__tooltip';
      label.setAttribute('aria-hidden', 'true');
      label.textContent = record.label;
      link.append(label);
      links.append(link);
    }
    section.append(heading, links);
    target.append(section);
  }
}
