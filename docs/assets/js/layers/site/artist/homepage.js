/* Shared, data-owned homepage markup for initial HTML and browser enhancement. */
import { newestReleases } from '../music/publication.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const picture = (record, sizes) => `<img src="/${escape(record.src)}" alt="${escape(record.alt)}" width="${record.width}" height="${record.height}" loading="lazy" decoding="async"${record.variants?.length ? ` srcset="${record.variants.map(v => `/${escape(v.src)} ${v.width}w`).join(', ')}" sizes="${escape(sizes || record.sizes)}"` : ''}>`;
const action = (record, icon) => `<a class="control"${record.emphasis==='primary'?' data-emphasis="primary"':''} href="${escape(record.href)}">${icon?`<img src="/${escape(icon.fallbackSrc||icon.src)}" alt=""${icon.monochrome?' data-monochrome="true"':''}>`:''}${escape(record.label)}</a>`;
export function homepageMarkup(profile, music, gallery, hub, concerts, icons) {
  const config = profile.homepage;
  const latest = newestReleases(music.items.filter(item => String(item.status).toLowerCase() === 'released'))[0];
  const contact = hub.contacts.find(link => link.id === 'press');
  const upcoming=concerts.events.filter(event=>!['Cancelled','Postponed'].includes(event.status)&&Date.parse(event.startDate)>=Date.now()).sort((a,b)=>Date.parse(a.startDate)-Date.parse(b.startDate));
  const visuals = config.visualIds.map(id => {
    const item = gallery.items.find(record => record.id === id);
    if (!item) throw Error(`Unknown homepage visual: ${id}`);
    return `<a href="/gallery/${escape(item.id)}/" aria-label="${escape(item.image.alt)}">${picture(item.image,'(max-width: 860px) 100vw, 33vw')}</a>`;
  });
  const portraits=(config.pressPortraitIds || []).map(id=>{
    const item=gallery.items.find(record=>record.id===id);
    if(!item || item.collection!=='portfolio')throw Error(`Unknown press portrait: ${id}`);
    return `<a href="/${escape(item.image.src)}" download aria-label="${escape(config.downloadPortraitLabel)}: ${escape(item.image.alt)}">${picture(item.image)}</a>`;
  });
  portraits.unshift(`<a href="/${escape(profile.portrait.src)}" download aria-label="${escape(config.downloadPortraitLabel)}: ${escape(profile.portrait.alt)}">${picture(profile.portrait)}</a>`);
  const enquiry=config.enquiry;
  const contacts=hub.contacts.map(record=>`<p>${escape(record.label)}<br><a href="${escape(record.url)}">${escape(record.url.replace(/^mailto:/,''))}</a></p>`).join('');
  const enquiryForm=`<section id="enquiries"><h2>${escape(enquiry.title)}</h2><p>${escape(enquiry.description)}</p><form class="artist__enquiry" data-artist-enquiry><label>${escape(enquiry.name)} *<input class="ui-field" name="name" autocomplete="name" required maxlength="150"></label><label>${escape(enquiry.email)} *<input class="ui-field" name="email" type="email" autocomplete="email" required maxlength="254"></label><label>${escape(enquiry.purpose)} *<select class="ui-field" name="purpose" required>${enquiry.purposes.map(p=>`<option value="${escape(p.value)}">${escape(p.label)}</option>`).join('')}</select></label><label>${escape(enquiry.message)} *<textarea class="ui-field" name="message" required maxlength="5000"></textarea></label><button class="control" type="submit">${escape(enquiry.submit)}</button></form><div class="artist__contacts">${contacts}</div></section>`;
  return {
    concerts: `<h2>${escape(concerts.upcomingTitle)}</h2>${upcoming.map(event=>`<section><h3><a href="/concerts/${escape(event.id)}/">${escape(event.name)}</a></h3><p><time datetime="${escape(event.startDate)}">${escape(new Intl.DateTimeFormat('en-GB',{dateStyle:'long',timeStyle:'short',timeZone:event.timeZone}).format(new Date(event.startDate)))}</time> · ${escape(event.timeZone)}</p><p>${escape(event.venue)} · ${escape(event.city)}</p><div class="artist__actions">${event.ticketUrl?action({label:concerts.ticketLabel,href:event.ticketUrl}):''}${action({label:concerts.calendarLabel,href:`/concerts/${event.id}/event.ics`})}</div></section>`).join('')||`<p>${escape(concerts.emptyMessage)}</p>`}${action({label:concerts.scheduleLabel,href:'/concerts/'},icons.items.find(icon=>icon.id===concerts.scheduleIcon))}`,
    imageSources: [latest?.cover?.src, ...config.visualIds.map(id => gallery.items.find(item => item.id === id).image.src)].filter(Boolean),
    actions: config.actions.map(record=>{
      const icon=icons.items.find(item=>item.id===record.icon);
      if(!icon) throw Error(`Unknown homepage action icon: ${record.icon}`);
      return action(record,icon);
    }).join(''),
    latest: latest ? `<h2>${escape(config.latestTitle)}</h2><div class="artist__release"><a class="artist__release-cover" href="/music/${escape(latest.id)}/" aria-label="${escape(latest.title)}">${picture(latest.cover)}</a><div><h3>${escape(latest.title)}</h3><p>${escape(latest.type)} · <time datetime="${escape(latest.releaseDate)}">${escape(latest.releaseDate)}</time></p><p>${escape(latest.description)}</p>${action({label:config.latestAction,emphasis:config.latestEmphasis,href:`/music/${latest.id}/`},icons.items.find(icon=>icon.id===config.latestIcon))}</div></div>` : '',
    visual: `<h2>${escape(config.visualTitle)}</h2><div class="artist__visual-grid">${visuals.join('')}</div>${action({label:config.visualAction,href:'/gallery/'})}`,
    press: `<h1>${escape(config.pressTitle)}</h1><p>${escape(config.pressIntroduction)}</p><nav class="artist__actions" aria-label="${escape(config.pressTitle)}">${action({label:config.biographyAction,href:'#biography'})}${action({label:config.portraitAction,href:'#press-portraits'})}${action({label:enquiry.title,href:'#enquiries'})}</nav><section id="biography"><h2>${escape(config.biographyTitle)}</h2><p>${escape(profile.biography)}</p></section><section id="press-portraits"><h2>${escape(config.portraitsTitle)}</h2><div class="artist__visual-grid">${portraits.join('')}</div></section>${enquiryForm}`
  };
}
