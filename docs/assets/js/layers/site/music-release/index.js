/* Legacy query URLs resolve to generated canonical documents. */
import { loadJson, assetUrl } from '../../../core/data.js';
const root = document.querySelector('[data-release-content]');
try {
  const id = new URLSearchParams(location.search).get('item');
  const catalogue = await loadJson('assets/data/music/releases.json');
  const item = catalogue.items.find(record => record.id === id || record.aliases?.includes(id));
  if (item) location.replace(assetUrl(`music/${item.id}/`) + location.hash);
  else {
    const link = document.createElement('a');
    link.href = assetUrl('music/');
    link.textContent = (await loadJson('assets/data/interface.json')).sections.find(section => section.id === 'music').label;
    root.replaceChildren(link);
  }
} catch (error) {
  console.error('[release-route]', error);
}
