import {escape} from './render.mjs';

export function concertPageData(schedule, artistId, origin) {
  const events=[...schedule.events].sort((a,b)=>Date.parse(a.startDate)-Date.parse(b.startDate));
  const ids=new Set();
  for(const event of events) {
    if(!event.id || ids.has(event.id)) throw new Error('Concert IDs must be unique');
    ids.add(event.id);
    if(!event.name || !event.venue || !event.city || !event.country || !event.timeZone || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(event.startDate) || !Number.isFinite(Date.parse(event.startDate))) throw new Error('Concert requires location and a date with timezone offset');
    new Intl.DateTimeFormat('en-GB',{timeZone:event.timeZone}).format(new Date(event.startDate));
    if(event.ticketUrl && new URL(event.ticketUrl).protocol!=='https:') throw new Error('Concert ticket URL must use HTTPS');
  }
  const graph=events.map(event=>({'@type':'MusicEvent',name:event.name,startDate:event.startDate,location:{'@type':'Place',name:event.venue,address:{'@type':'PostalAddress',addressLocality:event.city,addressCountry:event.country}},performer:{'@id':artistId},url:origin+'/concerts/#'+event.id}));
  const body=`<article><h1>${escape(schedule.title)}</h1><p>${escape(schedule.description)}</p>${events.length?events.map(event=>{
    const date=new Intl.DateTimeFormat('en-GB',{dateStyle:'long',timeStyle:'short',timeZone:event.timeZone}).format(new Date(event.startDate));
    return `<section id="${escape(event.id)}"><h2>${escape(event.name)}</h2><p><time datetime="${escape(event.startDate)}">${escape(date)}</time> · ${escape(event.timeZone)}</p><p>${escape(event.venue)} · ${escape(event.city)}</p>${event.ticketUrl?`<a class="control" href="${escape(event.ticketUrl)}">${escape(schedule.ticketLabel)}</a>`:''}</section>`;
  }).join(''):`<p>${escape(schedule.emptyMessage)}</p>`}</article>`;
  return {body,graph};
}
