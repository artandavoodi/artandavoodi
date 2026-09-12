/* ARTANDAVOODI · Shared detail renderer; context.json owns all item content. */
import { loadJson } from '../../../../core/data.js';
import { initializeTheme } from '../../../../core/theme.js';
import { renderImage } from '../../media.js';
import { bindBackLink } from '../../back-link.js';

initializeTheme();
const root = document.querySelector('[data-workspace-content]');
function text(tag, value) {
  const element = document.createElement(tag);
  element.textContent = value;
  return element;
}
try {
  const [data, ui, icons] = await Promise.all([
    loadJson('assets/data/music/context.json'),
    loadJson('assets/data/interface.json'),
    loadJson('assets/data/icons.json'),
  ]);
  bindBackLink(document.querySelector('[data-workspace-back]'), ui.musicBack, icons);
  const id = new URLSearchParams(location.search).get('item');
  const groups = data.sections.flatMap(section => section.groups || []);
  const group = groups.find(group => group.items?.some(item => item.id === id));
  const item = group?.items.find(item => item.id === id);
  if (!item) {
    root.append(text('p', data.notFoundLabel));
  } else {
    document.title = `${item.title} · ${group.title}`;
    root.append(text('p', group.title), text('h1', item.title));
    if (item.description) root.append(text('p', item.description));
    for (const record of item.sections || []) {
      if (!record.body) continue;
      const section = document.createElement('section');
      section.append(text('h2', record.title), text('p', record.body));
      root.append(section);
    }
    for (const image of item.media || []) root.append(renderImage(image));
  }
} catch (error) {
  root.setAttribute('role', 'alert');
  root.textContent = 'Unable to load this item. Please reload.';
  console.error(error);
}
