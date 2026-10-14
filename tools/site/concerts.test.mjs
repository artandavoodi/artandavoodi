import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {concertPageData,concertCalendar} from './concerts.mjs';
const schedule=JSON.parse(await readFile(new URL('../../docs/assets/data/concerts.json',import.meta.url)));
const event={id:'fixture',name:'Fixture performance',startDate:'2027-01-01T20:00:00+01:00',updatedAt:'2026-10-14T18:00:00Z',timeZone:'Europe/Zagreb',venue:'Fixture venue',city:'Zagreb',country:'HR',ticketUrl:'https://example.com/tickets'};
const render=events=>concertPageData({...schedule,events},'https://example.com/#artist','https://example.com');
test('empty schedule does not invent events',()=>assert.equal(render([]).graph.length,0));
test('event page and calendar preserve canonical identity and timezone',()=>{
  assert.equal(render([event]).graph[0].url,'https://example.com/concerts/fixture/');
  assert.match(concertCalendar(event,'https://example.com'),/DTSTART:20270101T190000Z\r\n/);
});
test('cancellation preserves the event and removes ticket action',()=>{
  const result=render([{...event,status:'Cancelled'}]);
  assert.equal(result.graph[0].eventStatus,'https://schema.org/EventCancelled');
  assert.ok(!result.body.includes(event.ticketUrl));
});
test('invalid IDs, duplicates, dates and rescheduling fail closed',()=>{
  for(const invalid of [{...event,id:undefined},{...event,id:'../escape'},{...event,startDate:'2027-01-01'},{...event,status:'Unknown'},{...event,status:'Rescheduled'},{...event,ticketUrl:'javascript:alert(1)'},{...event,endDate:'2027-01-01T19:00:00+01:00'}]) assert.throws(()=>render([invalid]));
  assert.throws(()=>render([event,event]));
});
test('calendar text is escaped and UTF-8 lines folded',()=>{
  const result=concertCalendar({...event,name:'Line\n'+('é'.repeat(80))},'https://example.com');
  assert.match(result,/SUMMARY:Line\\n/);
  for(const line of result.split('\r\n')) assert.ok(Buffer.byteLength(line)<=75);
});
