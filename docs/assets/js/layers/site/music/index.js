/* ARTANDAVOODI · Music showcase renderer; releases and UI labels are JSON-owned. */
import { assetUrl } from '../../../core/data.js?v=7';
import { renderIcon, renderEmpty } from '../media.js?v=5';
import { renderContext } from './context/index.js?v=2';
import { renderTracks, trackContext } from './tracks.js';
import { observeDividers } from './dividers.js';
import { collectTracks, renderTrackDirectory } from './track-directory.js';

const DEFAULT_CATEGORY = 'singles';
const DEFAULT_STATUS = 'all';

function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (textContent !== undefined) element.textContent = textContent;
  return element;
}

function sortedItems(items) {
  return [...(Array.isArray(items) ? items : [])].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function renderReleaseDetails(item, ui) {
  const details = createElement('div', 'music-release__details');
  details.hidden = true;
  for (const field of ui.musicDetails || []) {
    if (!item[field.key]) continue;
    const detail = createElement('p', 'music-release__detail');
    detail.append(
      createElement('span', 'music-release__detail-label', field.label),
      createElement('span', 'music-release__detail-value', item[field.key]),
    );
    details.append(detail);
  }
  return details;
}

function renderReleaseLinks(item, icons) {
  const links = createElement('div', 'music-release__links');
  for (const record of [...(item.links || [])].sort((a, b) => (a.order || 0) - (b.order || 0))) {
    const url = new URL(record.url);
    if (url.protocol !== 'https:' || url.username || url.password) continue;
    const link = createElement('a', 'music-release__platform');
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.platform = record.platform || record.label;
    link.setAttribute('aria-label', record.label);
    const icon = renderIcon(record.icon, icons);
    if (icon) link.append(icon);
    const label = createElement('span', 'music-release__platform-tooltip', record.label);
    label.setAttribute('aria-hidden', 'true');
    link.append(label);
    links.append(link);
  }
  return links;
}

function renderReleaseCover(item, icons) {
  const figure = createElement('figure', 'music-release__cover');
  const button = createElement('button', 'music-release__cover-button');
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', item.title);
  const image = createElement('img', 'music-release__cover-image');
  image.src = assetUrl(item.cover.src);
  image.alt = item.cover.alt;
  image.width = item.cover.width;
  image.height = item.cover.height;
  image.loading = 'lazy';
  image.decoding = 'async';
  const icon = renderIcon(item.icon, icons);
  if (icon) icon.className = 'music-release__cover-icon';
  button.append(image);
  if (icon) button.append(icon);
  figure.append(button);
  return { figure, button };
}

function renderRelease(item, ui, icons) {
  const article = createElement('article', 'music-release');
  article.dataset.musicId = item.id;
  const cover = renderReleaseCover(item, icons);
  const content = createElement('div', 'music-release__content');
  const title = createElement('h3', 'music-release__title');
  const titleLink = createElement('button', 'music-release__title-link', item.title);
  titleLink.type = 'button';
  titleLink.dataset.releasePreview = item.id;
  title.append(titleLink);
  const subtitle = createElement('p', 'music-release__subtitle', item.subtitle);
  const artist = createElement('p', 'music-release__artist', item.artist);
  const description = createElement('p', 'music-release__description', item.description);
  const details = renderReleaseDetails(item, ui);
  const tracks = item.tracks?.length ? renderTracks(item, ui) : null;
  const readMore = createElement('a', 'music-release__read-more', ui.musicReadMoreLabel);
  readMore.href = assetUrl(`music/${item.id}/`);
  readMore.dataset.releaseReadMore = item.id;
  readMore.setAttribute('aria-label', `${ui.musicReadMoreLabel}: ${item.title}`);
  readMore.title = ui.musicReadMoreLabel;
  const links = renderReleaseLinks(item, icons);
  const toggle = () => {
    const open = cover.button.getAttribute('aria-expanded') === 'true';
    const next = String(!open);
    cover.button.setAttribute('aria-expanded', next);
    article.dataset.expanded = next;
    details.hidden = open;
    if (tracks) tracks.hidden = open;
  };
  cover.button.addEventListener('click', toggle);
  titleLink.addEventListener('click', toggle);
  content.append(title, subtitle, artist, description, details);
  if (tracks) content.append(tracks);
  content.append(readMore, links);
  article.append(cover.figure, content);
  return article;
}

export async function render(data, ui, icons) {
  const target = document.querySelector('[data-music-items]');
  const categories = document.querySelector('[data-music-categories]');
  const status = document.querySelector('[data-music-status]');
  const filterIcon = renderIcon('filter', icons);
  if (filterIcon) {
    filterIcon.className = 'music__filter-icon';
    filterIcon.setAttribute('aria-hidden', 'true');
    document.querySelector('[data-music-filter-icon]').append(filterIcon);
  }
  let activeCategory = DEFAULT_CATEGORY;
  let activeStatus = DEFAULT_STATUS;
  let disconnectDividers = () => {};
  const update = () => {
    disconnectDividers();
    const items = sortedItems(data.items).filter(item => {
      const categoryMatches = activeCategory === 'tracks' || item.category === activeCategory;
      const statusMatches = activeStatus === DEFAULT_STATUS || String(item.status).toLowerCase() === activeStatus;
      return categoryMatches && statusMatches;
    });
    if (activeCategory === 'tracks' && collectTracks(items).length) target.replaceChildren(renderTrackDirectory(collectTracks(items), ui, icons, renderReleaseLinks));
    else if (activeCategory !== 'tracks' && items.length) target.replaceChildren(...items.map(item => renderRelease(item, ui, icons)));
    else renderEmpty(target, ui.empty.music);
    disconnectDividers = observeDividers([...target.querySelectorAll('.music-release, .music-tracks__link, .music-track-directory__row')]);
    for (const button of categories.children) button.setAttribute('aria-pressed', String(button.dataset.category === activeCategory));
    for (const button of status.children) button.setAttribute('aria-pressed', String(button.dataset.status === activeStatus));
  };
  for (const record of ui.musicCategories || []) {
    const button = createElement('button', 'music__category', record.label);
    button.type = 'button';
    button.dataset.category = record.id;
    button.addEventListener('click', () => { activeCategory = record.id; update(); });
    categories.append(button);
  }
  for (const record of ui.musicStatusFilters || []) {
    const button = createElement('button', 'music__status-option', record.label);
    button.type = 'button';
    button.dataset.status = record.id;
    button.addEventListener('click', () => { activeStatus = record.id; update(); });
    status.append(button);
  }
  update();
  await renderContext(icons);
  bindReleaseReader(data, ui, icons);
}

function bindReleaseReader(data, ui, icons) {
  const reader = document.querySelector('[data-music-release-reader]');
  const content = document.querySelector('[data-music-release-content]');
  if (!reader || !content || reader.dataset.bound === 'true') return;
  reader.dataset.bound = 'true';
  const close = () => { reader.hidden = true; reader.setAttribute('aria-hidden', 'true'); back.hidden = true; document.documentElement.removeAttribute('data-music-release-open'); };
  reader.querySelector('[data-music-release-close]').addEventListener('click', close);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  const back = reader.querySelector('[data-music-release-back]');
  const renderReaderHeader = (item, detail = false) => {
    const header = createElement('header', `music-release-reader__header${detail ? ' music-release-reader__header--detail' : ''}`);
    const cover = createElement('img', 'music-release-reader__cover');
    cover.src = assetUrl(item.cover.src);
    cover.alt = item.cover.alt;
    cover.width = item.cover.width;
    cover.height = item.cover.height;
    cover.loading = 'eager';
    cover.decoding = 'async';
    header.append(cover, createElement('h1', '', item.title));
    if (item.albumTitle) header.append(createElement('p', '', item.albumTitle));
    return header;
  };
  const showSection = (item, field) => {
    const section = createElement('section', 'music-release-reader__section');
    const heading = createElement('h2', 'music-release-reader__section-heading');
    if (field.key === 'archive') {
      const icon = renderIcon('archive', icons);
      if (icon) heading.append(icon);
    }
    heading.append(field.label);
    section.append(heading);
    if (field.key === 'archive') {
      const archiveTabs = item.archive?.tabs?.length ? item.archive.tabs : ui.musicArchiveTabs;
      const tabs = createElement('div', 'music-release-reader__archive-tabs');
      const panel = createElement('div', 'music-release-reader__archive-panel');
      const showTab = tab => {
        tabs.querySelectorAll('button').forEach(button => button.setAttribute('aria-selected', String(button.dataset.archiveTab === tab.id)));
        panel.replaceChildren(createElement('h3', '', tab.label), createElement('p', '', tab.description || ui.musicDetailsPending));
        for (const asset of tab.assets || []) {
          const link = createElement('a', 'music-release-reader__archive-asset', asset.label);
          const url = asset.url ? new URL(asset.url) : assetUrl(asset.path);
          if (asset.url && (url.protocol !== 'https:' || url.username || url.password)) continue;
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          panel.append(link);
        }
      };
      for (const tab of archiveTabs) {
        const button = createElement('button', '', tab.label);
        button.type = 'button';
        button.dataset.archiveTab = tab.id;
        button.setAttribute('aria-selected', 'false');
        button.addEventListener('click', () => showTab(tab));
        tabs.append(button);
      }
      section.append(tabs, panel);
      showTab(archiveTabs[0]);
    } else {
      section.append(createElement('p', '', item[field.key] || ui.musicDetailsPending));
      if (field.key === 'musicalDetails') {
        for (const key of ['format', 'genre', 'duration', 'isrc']) {
          const value = item[key];
          if (value) section.append(createElement('p', '', `${ui.musicFieldLabels[key]}: ${value}`));
        }
      }
    }
    content.replaceChildren(renderReaderHeader(item, true), section);
    back.hidden = false;
  };
  const renderSectionList = item => {
    const fields = ui.musicReaderFields;
    const sections = createElement('div', 'music-release-reader__sections');
    for (const field of fields) {
      const button = createElement('button', 'music-release-reader__section-link', field.label);
      button.type = 'button';
      const icon = renderIcon(ui.musicDetailIcon, icons);
      if (icon) button.append(icon);
      button.addEventListener('click', () => showSection(item, field));
      sections.append(button);
    }
    return sections;
  };
  back.replaceChildren(renderIcon(ui.musicBack?.icon, icons));
  back.setAttribute('aria-label', ui.musicBack?.label || 'Back to release details');
  back.title = back.getAttribute('aria-label');
  back.addEventListener('click', () => {
    if (back._release) {
      content.replaceChildren(renderReaderHeader(back._release), renderSectionList(back._release), renderReleaseLinks(back._release, icons));
      back.hidden = true;
    }
  });
  const openReader = item => {
    const header = renderReaderHeader(item);
    back._release = item;
    back.hidden = true;
    content.replaceChildren(header, renderSectionList(item), renderReleaseLinks(item, icons));
    reader.hidden = false;
    reader.setAttribute('aria-hidden', 'false');
    document.documentElement.setAttribute('data-music-release-open', 'true');
    reader.querySelector('.music-release-reader__panel').scrollTop = 0;
  };
  document.querySelector('[data-music-items]').addEventListener('click', event => {
    const button = event.target.closest('[data-release-read-more]');
    if (!button) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const item = data.items.find(record => record.id === button.dataset.releaseReadMore);
    if (!item) return;
    event.preventDefault();
    const track = button.dataset.trackId && item.tracks?.find(record => record.id === button.dataset.trackId);
    if (button.dataset.trackId && !track) return;
    openReader(track ? trackContext(item, track) : item);
  });
  reader.querySelector('[data-music-release-close]').setAttribute('aria-label', ui.musicReaderCloseLabel || 'Close release details');
}
