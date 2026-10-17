import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {featuredMarkup} from '../../docs/assets/js/layers/site/featured/markup.js';
const read=path=>readFile(new URL('../../'+path,import.meta.url),'utf8');
const json=async path=>JSON.parse(await read(path));
test('selected music uses catalogue records, native slides and registered icons',async()=>{
  const config=await json('docs/assets/data/featured.json');
  const music=await json('docs/assets/data/music/releases.json');
  const icons=await json('docs/assets/data/icons.json');
  const entries=config.items.filter(item=>item.enabled!==false).map(item=>({record:music.items.find(record=>record.id===item.id),href:item.href}));
  const markup=featuredMarkup(config,entries,icons);
  assert.equal((markup.match(/class="featured__item"/g)||[]).length,3);
  assert.equal((markup.match(/data-featured-dot=/g)||[]).length,3);
  for(const entry of entries)assert.ok(markup.includes(`href="${entry.href}"`));
  assert.ok(markup.includes('data-emphasis="primary"'));
  const listen=icons.items.find(icon=>icon.id===config.listenIcon);
  assert.ok(markup.includes(listen.fallbackSrc||listen.src));
});
test('allowed appearance survives a fresh page; declined storage stays declined',async()=>{
  const config=(await json('docs/assets/data/privacy.json')).storage;
  const source=await read('docs/assets/js/core/preference-state.js');
  const values=new Map();
  const create=()=>{
    const window={ArtanPreferenceConfig:config,dispatchEvent(){}};
    vm.runInNewContext(source,{window,Event:class{},localStorage:{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)}});
    return window.ArtanPreferences;
  };
  const first=create();first.setChoice('allow');first.saveTheme('dark');
  assert.equal(create().theme(),'dark');
  create().setChoice('reject');
  assert.equal(create().theme(),'light');
  create().saveTheme('dark');assert.equal(values.has(config.themeKey),false);
});
