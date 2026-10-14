import {escape} from './render.mjs';
export const concertUrl=event=>`/concerts/${event.id}/`;
export function concertCalendar(event,origin) {
  const clean=value=>String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const stamp=value=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Artan Davoodi//Concerts//EN','BEGIN:VEVENT',`UID:${event.id}@${new URL(origin).hostname}`,`DTSTAMP:${stamp(event.startDate)}`,`DTSTART:${stamp(event.startDate)}`,...(event.endDate?[`DTEND:${stamp(event.endDate)}`]:[]),`SUMMARY:${clean(event.name)}`,`LOCATION:${clean(event.venue+', '+event.city+', '+event.country)}`,`URL:${origin+concertUrl(event)}`,`STATUS:${event.status==='Cancelled'?'CANCELLED':event.status==='Postponed'?'TENTATIVE':'CONFIRMED'}`,'END:VEVENT','END:VCALENDAR'];
  return lines.map(line=>{let result='',length=0;for(const char of line){const bytes=Buffer.byteLength(char);if(length+bytes>73){result+='\r\n ';length=1;}result+=char;length+=bytes;}return result;}).join('\r\n')+'\r\n';
}

export function concertPageData(schedule, artistId, origin) {
  const events=[...schedule.events].sort((a,b)=>Date.parse(a.startDate)-Date.parse(b.startDate));
  const ids=new Set();
  for(const event of events) {
    if(typeof event.id!=='string' || !/^[a-z0-9-]+$/.test(event.id) || ids.has(event.id)) throw new Error('Concert IDs must be unique slugs');
    ids.add(event.id);
    if(!event.name || !event.venue || !event.city || !event.country || !event.timeZone || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(event.startDate) || !Number.isFinite(Date.parse(event.startDate))) throw new Error('Concert requires location and a date with timezone offset');
    new Intl.DateTimeFormat('en-GB',{timeZone:event.timeZone}).format(new Date(event.startDate));
    if(event.ticketUrl && new URL(event.ticketUrl).protocol!=='https:') throw new Error('Concert ticket URL must use HTTPS');
    if(event.status && !['Scheduled','Cancelled','Postponed','Rescheduled'].includes(event.status)) throw new Error('Invalid concert status');
    for(const date of [event.endDate,event.previousStartDate].filter(Boolean)) if(!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(date)||!Number.isFinite(Date.parse(date))) throw new Error('Invalid concert date');
    if(event.endDate && Date.parse(event.endDate)<=Date.parse(event.startDate)) throw new Error('Concert end must follow start');
    if(event.status==='Rescheduled'&&!event.previousStartDate) throw new Error('Rescheduled concerts require their original date');
  }
  const graph=events.map(event=>({'@type':'MusicEvent',name:event.name,startDate:event.startDate,...(event.endDate?{endDate:event.endDate}:{}),...(event.previousStartDate?{previousStartDate:event.previousStartDate}:{}),eventStatus:'https://schema.org/Event'+(event.status||'Scheduled'),eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',location:{'@type':'Place',name:event.venue,address:{'@type':'PostalAddress',addressLocality:event.city,addressCountry:event.country,...(event.streetAddress?{streetAddress:event.streetAddress}:{})}},performer:{'@id':artistId},url:origin+concertUrl(event)}));
  const body=`<article><h1>${escape(schedule.title)}</h1><p>${escape(schedule.description)}</p>${events.length?events.map(event=>{
    const date=new Intl.DateTimeFormat('en-GB',{dateStyle:'long',timeStyle:'short',timeZone:event.timeZone}).format(new Date(event.startDate));
    return `<section id="${escape(event.id)}"><h2><a href="${concertUrl(event)}">${escape(event.name)}</a></h2><p><time datetime="${escape(event.startDate)}">${escape(date)}</time> · ${escape(event.timeZone)}</p><p>${escape(event.venue)} · ${escape(event.city)}</p><p>${escape(schedule.statusLabels[event.status||'Scheduled'])}</p><div class="artist__actions">${event.ticketUrl&&!['Cancelled','Postponed'].includes(event.status)?`<a class="control" href="${escape(event.ticketUrl)}">${escape(schedule.ticketLabel)}</a>`:''}<a class="control" href="${concertUrl(event)}event.ics" download>${escape(schedule.calendarLabel)}</a></div></section>`;
  }).join(''):`<p>${escape(schedule.emptyMessage)}</p>`}</article>`;
  return {body,graph};
}
