/* ARTANDAVOODI · Hub connection renderer; hub content remains JSON-owned. */
import { renderIcon } from '../media.js?v=5';
export function render(data, ui, icons) {
  document.querySelector('[data-hub-title]').textContent = data.title;
  document.querySelector('[data-hub-description]').textContent = data.description;
  const target = document.querySelector('[data-hub-links]');
  target.replaceChildren();
  for (const record of data.links || []) {
    if (!record.url) continue;
    const url = new URL(record.url);
    const isMail = url.protocol === 'mailto:';
    if (!['https:', 'mailto:'].includes(url.protocol) || (!isMail && (url.username || url.password))) continue;
    const link = document.createElement('a');
    link.href = url.href;
    link.className = 'hub__link';
    link.setAttribute('aria-label', record.label);
    const icon = renderIcon(record.icon, icons);
    if (icon) link.append(icon);
    const label = document.createElement('span');
    label.className = 'hub__tooltip';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = record.label;
    link.append(label);
    target.append(link);
  }
}
