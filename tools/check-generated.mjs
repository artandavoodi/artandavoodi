/* Verify crawlable output against the canonical catalogue, without running browser JS. */
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {escape,route} from './site/render.mjs';
const docs=new URL('../docs/',import.meta.url);
const read=p=>readFile(new URL(p,docs),'utf8');
const data=JSON.parse(await read('assets/data/music/releases.json'));
const sitemap=await read('sitemap.xml');
const catalogue=await read('music/index.html');
for(const item of data.items) {
  const html=await read(route(item).slice(1)+'index.html');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes(escape(item.title)) && html.includes(escape(item.description)));
  assert.ok(html.includes(`rel="canonical" href="https://artandavoodi.com${route(item)}"`));
  assert.ok(catalogue.includes(`href="${route(item)}"`));
  assert.ok(sitemap.includes(`https://artandavoodi.com${route(item)}`));
  for(const alias of item.aliases || []) {
    const redirect=await read(`music/${alias}/index.html`);
    assert.ok(redirect.includes(`content="0;url=${route(item)}"`));
    assert.ok(!sitemap.includes(`/music/${alias}/`));
  }
  const graph=JSON.parse(html.match(/type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1]);
  assert.ok(graph['@graph'].some(e=>['MusicAlbum','MusicRecording'].includes(e['@type'])));
  for(const track of item.tracks||[]) {
    assert.ok(html.includes(`id="track-${track.id}"`));
    assert.ok(html.includes(escape(track.title)) && html.includes(track.duration));
  }
}
for(const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) assert.ok(!/[?#]/.test(match[1]) && !match[1].includes('/workspace/'));
console.log('PASS: initial HTML, canonical URLs, all track anchors, JSON-LD and sitemap.');
