/* Legacy query URLs resolve to generated canonical documents. */
import { loadJson, assetUrl } from '../../../core/data.js';
try {
  const id = new URLSearchParams(location.search).get('item');
  const catalogue = id ? await loadJson('assets/data/music/releases.json') : {items:[]};
  const item = catalogue.items.find(record => record.id === id || record.aliases?.includes(id));
  if (item) location.replace(assetUrl(`music/${item.id}/`) + location.hash);
  else location.replace(assetUrl('music/'));
} catch (error) {
  console.error('[release-route]', error);
}
