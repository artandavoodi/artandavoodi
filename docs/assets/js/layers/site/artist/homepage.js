/* Shared, data-owned homepage markup for initial HTML and browser enhancement. */
import { newestReleases } from '../music/publication.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const picture = (record, sizes) => `<img src="/${escape(record.src)}" alt="${escape(record.alt)}" width="${record.width}" height="${record.height}" loading="lazy" decoding="async"${record.variants?.length ? ` srcset="${record.variants.map(v => `/${escape(v.src)} ${v.width}w`).join(', ')}" sizes="${escape(sizes || record.sizes)}"` : ''}>`;
const action = record => `<a class="control" href="${escape(record.href)}">${escape(record.label)}</a>`;
export function homepageMarkup(profile, music, gallery, hub) {
  const config = profile.homepage;
  const latest = newestReleases(music.items.filter(item => String(item.status).toLowerCase() === 'released'))[0];
  const contact = hub.contacts.find(link => link.id === 'press');
  const visuals = config.visualIds.map(id => {
    const item = gallery.items.find(record => record.id === id);
    if (!item) throw Error(`Unknown homepage visual: ${id}`);
    return `<a href="/gallery/${escape(item.id)}/" aria-label="${escape(item.image.alt)}">${picture(item.image,'(max-width: 860px) 100vw, 33vw')}</a>`;
  });
  return {
    imageSources: [latest?.cover?.src, ...config.visualIds.map(id => gallery.items.find(item => item.id === id).image.src)].filter(Boolean),
    actions: config.actions.filter(record=>record.id!=='latest'||latest).map(record=>action(record.id==='latest'?{...record,href:`/music/${latest.id}/`}:record)).join(''),
    latest: latest ? `<h2>${escape(config.latestTitle)}</h2><div class="artist__release"><a class="artist__release-cover" href="/music/${escape(latest.id)}/" aria-label="${escape(latest.title)}">${picture(latest.cover)}</a><div><h3>${escape(latest.title)}</h3><p>${escape(latest.type)} · <time datetime="${escape(latest.releaseDate)}">${escape(latest.releaseDate)}</time></p><p>${escape(latest.description)}</p>${action({label:config.latestAction,href:`/music/${latest.id}/`})}</div></div>` : '',
    visual: `<h2>${escape(config.visualTitle)}</h2><div class="artist__visual-grid">${visuals.join('')}</div>${action({label:config.visualAction,href:'/gallery/'})}`,
    press: `<h1>${escape(config.pressTitle)}</h1><p>${escape(config.pressIntroduction)}</p><p>${escape(profile.biography)}</p><div class="artist__actions">${contact ? action({label:contact.label,href:contact.url}) : ''}<a class="control" href="/${escape(config.biographyPath)}" download>${escape(config.biographyAction)}</a>${action({label:config.portraitAction,href:`/${profile.portrait.src}`})}</div><div class="artist__actions">${hub.contacts.filter(record=>record.id!=='press').map(record=>action({label:record.label,href:record.url})).join('')}</div>`
  };
}
