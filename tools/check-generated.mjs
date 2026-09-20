/* Verify crawlable output against the canonical catalogue, without running browser JS. */
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {escape,route,releaseBody} from './site/render.mjs';
import {publishedValue, metadataRows, archiveAssets} from '../docs/assets/js/layers/site/music/publication.js';
const docs=new URL('../docs/',import.meta.url);
const read=p=>readFile(new URL(p,docs),'utf8');
const data=JSON.parse(await read('assets/data/music/releases.json'));
const sitemap=await read('sitemap.xml');
const catalogue=await read('music/index.html');
assert.ok(!(await read('assets/js/layers/site/music/index.js')).includes('bindReleaseReader'));
assert.ok((await read('assets/js/layers/site/music/tracks.js')).includes('button.href = `/music/${album.id}/#track-${track.id}`'));
for(const item of data.items) {
  const html=await read(route(item).slice(1)+'index.html');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes(escape(item.title)) && html.includes(escape(item.description)));
  assert.ok(html.includes(`rel="canonical" href="https://artandavoodi.com${route(item)}"`));
  assert.ok(catalogue.includes(`href="${route(item)}"`));
  assert.ok(sitemap.includes(`https://artandavoodi.com${route(item)}`));
  if(publishedValue(item,'story')) assert.ok(html.includes(`id="${item.id}-story"`));
  const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
  assert.ok(!visible.includes('ISRC:') && !visible.includes('UPC:'), 'Identifiers must not be presented as public copy');
  for(const record of [item,...(item.tracks || [])]) {
    for(const [field,status] of Object.entries(record.editorial || {})) {
      assert.ok(['draft','approved'].includes(status), 'Unknown editorial state');
      if(status==='draft' && typeof record[field]==='string') assert.ok(!html.includes(escape(record[field])), `Draft published: ${record.id}/${field}`);
    }
    for(const tab of record.archive?.tabs || []) for(const asset of archiveAssets(tab)) {
      assert.ok(asset.title || asset.label, 'Archive assets require a readable title');
      if(asset.path) {
        assert.ok(!asset.path.includes('..') && !asset.path.startsWith('/'));
        await read(asset.path);
      } else assert.ok(/^https:\/\//.test(asset.url), 'Archive assets require a local file or HTTPS URL');
      if(asset.preview) await read(asset.preview.src);
    }
    for(const link of record.links || []) {
      const url=new URL(link.url);
      assert.equal(url.protocol,'https:');
      assert.ok(!url.pathname.includes('/artist/') && !url.pathname.includes('/artists/') && !url.pathname.startsWith('/@'), 'Release links must not target artist profiles');
    }
  }
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
assert.deepEqual(metadataRows({status:'Released'},[{key:'status',when:'Upcoming'}]),[]);
assert.deepEqual(metadataRows({format:'Instrumental'},[{key:'format'}],{format:'Instrumental'}),[]);
assert.equal(publishedValue({story:'Unapproved',editorial:{story:'draft'}},'story'),undefined);
assert.equal(archiveAssets({assets:[{status:'draft'}]}).length,0);
const ui=JSON.parse(await read('assets/data/interface.json'));
const icons=JSON.parse(await read('assets/data/icons.json'));
const specimen={...data.items[0],tracks:[],archive:{tabs:[{label:'Score',assets:[{title:'Piano score',url:'https://example.com/score.pdf',instrument:'Piano',version:'1',preview:data.items[0].cover}]}]}};
const specimenHtml=releaseBody(specimen,ui,icons);
assert.ok(specimenHtml.includes('https://example.com/score.pdf') && specimenHtml.includes('Piano score') && specimenHtml.includes('Version'));
console.log('PASS: editorial visibility, inherited details, archive assets and release-link boundaries.');
