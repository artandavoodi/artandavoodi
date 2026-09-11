/* ARTANDAVOODI · Site domain importer, navigation and section lifecycle. */
import { loadJson } from '../../core/data.js';
import { bindTheme } from '../../core/theme.js';
const modules = {
  artist: () => import('./artist/index.js'),
  music: () => import('./music/index.js'),
  publications: () => import('./publications/index.js'),
  gallery: () => import('./gallery/index.js'),
};
export async function initializeSite() {
  const [site, ui] = await Promise.all([loadJson('assets/data/site.json'), loadJson('assets/data/interface.json')]);
  document.querySelector('[data-brand]').textContent = site.identity.name;
  document.querySelector('[data-skip]').textContent = ui.skipLabel;
  const navigation = document.querySelector('[data-navigation]');
  navigation.setAttribute('aria-label', ui.navigationLabel);
  for (const section of ui.sections) {
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.textContent = section.label;
    navigation.append(link);
    const title = document.querySelector(`[data-section-title="${section.id}"]`);
    if (title) title.textContent = section.label;
  }
  const updateNavigation = () => {
    const current = location.hash || '#artist';
    for (const link of navigation.children) {
      if (link.hash === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  window.addEventListener('hashchange', updateNavigation);
  updateNavigation();
  const hub = document.querySelector('[data-hub-link]');
  const hubUrl = new URL(site.identity.hubUrl);
  if (hubUrl.protocol !== 'https:') throw new Error('Invalid hub URL');
  hub.href = hubUrl.href;
  hub.textContent = ui.hubLabel;
  document.querySelector('[data-copyright]').textContent = `© ${new Date().getFullYear()} ${site.identity.name}`;
  bindTheme(ui.theme);
  const results = await Promise.allSettled(Object.entries(modules).map(async ([name, load]) => {
    const [module, data] = await Promise.all([load(), loadJson(site.catalogues[name])]);
    module.render(data, ui);
  }));
  const failed = results.filter(result => result.status === 'rejected');
  if (failed.length) {
    const error = document.querySelector('[data-error]');
    error.textContent = ui.error;
    error.hidden = false;
    throw new AggregateError(failed.map(result => result.reason), 'Catalogue loading failed');
  }
}
