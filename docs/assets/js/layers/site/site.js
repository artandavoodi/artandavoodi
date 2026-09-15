/* ARTANDAVOODI · Site domain importer, menu navigation and section lifecycle. */
import { loadJson } from '../../core/data.js?v=9';
import { bindTheme } from '../../core/theme.js?v=5';
import { bindNavigation } from './navigation.js?v=8';
import { applyMetadata } from '../../core/metadata.js?v=1';
import { bindRoutes } from './routes.js';
import { render as renderFeatured } from './featured/index.js';
const modules = {
  artist: () => import('./artist/index.js?v=5'),
  music: () => import('./music/index.js?v=10'),
  gallery: () => import('./gallery/index.js?v=4'),
  hub: () => import('./hub/index.js?v=5'),
};
export async function initializeSite() {
  const [site, ui, metadata, icons] = await Promise.all([
    loadJson('assets/data/site.json'),
    loadJson('assets/data/interface.json'),
    loadJson('assets/data/metadata/site.json'),
    loadJson('assets/data/icons.json'),
  ]);
  applyMetadata(metadata);
  document.querySelector('[data-skip]').textContent = ui.skipLabel;
  for (const section of ui.sections) {
    const title = document.querySelector(`[data-section-title="${section.id}"]`);
    if (title) title.textContent = section.label;
    if (title && section.id === 'music' && document.documentElement.dataset.initialRoute === 'music') {
      const heading = document.createElement('h1');
      for (const attribute of title.attributes) heading.setAttribute(attribute.name, attribute.value);
      heading.textContent = title.textContent;
      title.replaceWith(heading);
    }
  }
  document.querySelector('[data-copyright]').textContent = `© ${new Date().getFullYear()} ${site.identity.name}`;
  bindTheme(ui.theme);
  bindNavigation(ui);
  const results = await Promise.allSettled(Object.entries(modules).map(async ([name, load]) => {
    const [module, data] = await Promise.all([load(), loadJson(site.catalogues[name])]);
    await module.render(data, ui, icons);
  }));
  const failed = results.filter(result => result.status === 'rejected');
  if (failed.length) {
    const error = document.querySelector('[data-error]');
    error.textContent = ui.error;
    error.hidden = false;
    throw new AggregateError(failed.map(result => result.reason), 'Catalogue loading failed');
  }
  await renderFeatured(await loadJson(site.featured), site);
  bindRoutes(ui, metadata);
}
