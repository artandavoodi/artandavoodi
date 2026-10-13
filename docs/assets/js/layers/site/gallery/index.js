/* ARTANDAVOODI · Gallery collection renderer. */
import { renderImage, renderIcon } from '../media.js?v=6';
import { bindGalleryGrain } from './grain.js';
import { selection, photoUrl } from './model.js';
import { rememberGallery, restoreGallery } from './continuity.js';
let stopGrain;
let controlEvents;
export function render(data, ui, icons) {
  controlEvents?.abort();
  controlEvents = new AbortController();
  const target = document.querySelector('[data-gallery-items]');
  stopGrain?.();
  stopGrain = bindGalleryGrain(document.querySelector('[data-gallery-grain]'), data.header?.grain);
  const params = new URLSearchParams(location.search);
  const collectionRoute = location.pathname.match(/^\/gallery\/collections\/([^/]+)\/$/);
  if (collectionRoute && data.collections.some(c => c.id === collectionRoute[1])) params.set('collection', collectionRoute[1]);
  const controls = document.createElement('div');
  controls.className = 'gallery__controls';
  const panels = [];
  function panel(icon, label, closeLabel) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.setAttribute('aria-label', label);
    summary.setAttribute('aria-expanded', 'false');
    summary.append(renderIcon(icon, icons), renderIcon('close', icons));
    details.append(summary);
    details.addEventListener('toggle', () => {
      summary.setAttribute('aria-expanded', String(details.open));
      summary.setAttribute('aria-label', details.open ? closeLabel : label);
      if (details.open) panels.filter(other => other !== details).forEach(other => { other.open = false; });
    });
    panels.push(details); controls.append(details);
    return details;
  }
  const filters = panel('filter', data.controls.filter, data.controls.close);
  const viewPanel = panel('gallery-view', data.controls.view, data.controls.closeView);
  const reset = document.createElement('button');
  reset.type = 'button'; reset.className = 'gallery__reset';
  reset.setAttribute('aria-label', data.controls.clear);
  reset.title = data.controls.clear; reset.append(renderIcon('reset', icons));
  reset.addEventListener('click', () => {
    for (const key of ['collection','year','subject','q']) params.delete(key);
    if (collectionRoute) params.set('collection', collectionRoute[1]);
    fields.querySelectorAll('select').forEach(input => { input.value = params.get(input.name) || ''; });
    search.value = ''; update();
    filters.querySelector('summary').focus();
  });
  controls.append(reset);
  const activeFilters = document.createElement('div');
  activeFilters.className = 'gallery__active-filters';
  activeFilters.setAttribute('aria-label', data.controls.active);
  controls.append(activeFilters);
  controls.addEventListener('keydown', event => {
    const open = panels.find(item => item.open);
    if (event.key === 'Escape' && open) { open.open = false; open.querySelector('summary').focus(); event.preventDefault(); }
  });
  document.addEventListener('pointerdown', event => {
    panels.forEach(item => { if (item.open && !item.contains(event.target)) item.open = false; });
  }, {signal:controlEvents.signal});
  const fields = document.createElement('div');
  fields.className = 'gallery__filters';
  function select(key, label, options, parent = fields) {
    const wrapper = document.createElement('label');
    wrapper.append(document.createTextNode(label));
    const input = document.createElement('select');
    input.name = key;
    input.setAttribute('aria-label', label);
    for (const [value, text] of options) input.add(new Option(text, value));
    input.value = params.get(key) || options[0][0];
    input.addEventListener('change', () => { if (input.value) params.set(key, input.value); else params.delete(key); update(); });
    wrapper.append(input);
    parent.append(wrapper);
  }
  select('collection', data.controls.collection, [['', data.controls.all], ...data.collections.filter(c => data.items.some(i => i.collection === c.id)).map(c => [c.id, c.title])]);
  select('year', data.controls.year, [['', data.controls.all], ...[...new Set(data.items.map(i => i.year).filter(Boolean))].sort((a,b) => b-a).map(y => [String(y), String(y)]), ['undated', data.controls.undated]]);
  select('subject', data.controls.subject, [['', data.controls.all], ...data.subjects.map(s => [s.id, s.label])]);
  const searchLabel = document.createElement('label');
  searchLabel.append(document.createTextNode(data.controls.search));
  const search = document.createElement('input');
  search.type = 'search'; search.value = params.get('q') || '';
  search.addEventListener('input', () => { if (search.value.trim()) params.set('q', search.value.trim()); else params.delete('q'); update(); });
  searchLabel.append(search); fields.append(searchLabel);
  filters.append(fields);
  const options = document.createElement('div');
  options.className = 'gallery__filters gallery__view-options';
  options.setAttribute('role', 'group'); options.setAttribute('aria-label', data.controls.view);
  for (const view of data.views) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = view.label; button.dataset.galleryView = view.id;
    button.addEventListener('click', () => { params.set('view', view.id); update(); viewPanel.open = false; viewPanel.querySelector('summary').focus(); });
    options.append(button);
  }
  viewPanel.append(options);
  const count = document.createElement('output');
  count.setAttribute('aria-live', 'polite'); controls.append(count);
  document.querySelector('[data-gallery-controls]')?.replaceChildren(controls);
  function update() {
    const records = selection(data, params);
    target.dataset.view = data.views.some(v => v.id === params.get('view')) ? params.get('view') : data.views[0].id;
    options.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.galleryView === target.dataset.view)));
    count.textContent = `${records.length} ${data.controls.photos}`;
    const active = ['collection','year','subject','q'].filter(key => params.get(key) && !(key === 'collection' && collectionRoute));
    reset.hidden = !active.length;
    activeFilters.replaceChildren(...active.map(key => {
      const button = document.createElement('button'); button.type = 'button';
      const input = fields.querySelector(`select[name="${key}"]`);
      const value = input?.selectedOptions[0]?.textContent || params.get(key);
      button.setAttribute('aria-label', `${data.controls.remove}: ${value}`);
      button.append(document.createTextNode(value), renderIcon('close', icons));
      button.addEventListener('click', () => { params.delete(key); if (input) input.value = ''; else search.value = ''; update(); filters.querySelector('summary').focus(); });
      return button;
    }));
    const query = params.toString();
    history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}`);
    target.replaceChildren(...data.collections.filter(collection => records.some(item => item.collection === collection.id)).map(collection => {
    const section = document.createElement('section');
    section.className = 'gallery__collection';
    const title = document.createElement('h3');
    const collectionLink = document.createElement('a');
    collectionLink.href = `/gallery/collections/${collection.id}/`;
    collectionLink.textContent = collection.title; title.append(collectionLink);
    const items = document.createElement('div');
    items.className = 'gallery__images';
    const collectionRecords = records.filter(item => item.collection === collection.id);
    if (collectionRecords.length) items.append(...collectionRecords.map(item => {
      const link = document.createElement('a');
      link.href = photoUrl(item, params);
      link.dataset.galleryPhotoId = item.id;
      link.addEventListener('click', event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) rememberGallery(item.id); });
      link.append(renderImage(item.image));
      return link;
    }));
    section.append(title, items);
    return section;
    }));
    if (!records.length) { const empty = document.createElement('p'); empty.className = 'gallery__empty'; empty.textContent = data.controls.empty; target.append(empty); }
  }
  update();
  window.addEventListener('site:ready', restoreGallery, {once:true,signal:controlEvents.signal});
  window.addEventListener('pageshow', event => { if (event.persisted) restoreGallery(); }, {signal:controlEvents.signal});
}
