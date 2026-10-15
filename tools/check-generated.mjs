/* Verify crawlable output against the canonical catalogue, without running browser JS. */
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {escape,route,releaseBody} from './site/render.mjs';
import {selection,photoUrl} from '../docs/assets/js/layers/site/gallery/model.js';
import {publishedValue, metadataRows, archiveAssets, newestReleases, displayDuration, hasPerformanceMaterial} from '../docs/assets/js/layers/site/music/publication.js';
const docs=new URL('../docs/',import.meta.url);
const read=p=>readFile(new URL(p,docs),'utf8');
const data=JSON.parse(await read('assets/data/music/releases.json'));
const sitemap=await read('sitemap.xml');
const catalogue=await read('music/index.html');
const gallery=JSON.parse(await read('assets/data/gallery/images.json'));
const homepageProfile=JSON.parse(await read('assets/data/artist/profile.json'));
const home=await read('index.html');
const latestHome=newestReleases(data.items.filter(item=>String(item.status).toLowerCase()==='released'))[0];
assert.ok(home.includes(`href="/music/${latestHome.id}/"`));
for(const action of homepageProfile.homepage.actions) assert.ok(home.includes(`href="${action.id==='latest'?`/music/${latestHome.id}/`:action.href}"`));
for(const id of homepageProfile.homepage.visualIds) assert.ok(home.includes(`href="/gallery/${id}/"`));
assert.ok((await read(homepageProfile.homepage.biographyPath)).includes(homepageProfile.biography));
assert.ok(!home.includes(escape(homepageProfile.homepage.pressTitle)));
assert.ok((await read('press/index.html')).includes(escape(homepageProfile.homepage.pressTitle)));
assert.ok((await read('press/index.html')).includes('mailto:press@artandavoodi.com'));
const press=await read('press/index.html');
assert.ok(press.includes('href="#biography"') && !press.includes(' download'),'Biography is readable without a download action');
for(const id of homepageProfile.homepage.pressPortraitIds)assert.ok(press.includes(`href="/gallery/${id}/"`),'Press portraits reuse gallery records');
assert.ok((await read('hub/index.html')).includes('https://artan.live/about/'),'Hub links directly to the portfolio biography');
assert.ok((await read('hub/index.html')).includes('href="/press/"'));
assert.ok((await read('privacy/index.html')).includes('noindex,follow'));
const privacyHtml=await read('privacy/index.html');
assert.ok(privacyHtml.indexOf('id="privacy-0"')<privacyHtml.indexOf('<nav aria-label="Privacy &amp; preferences"'),'Privacy introduction precedes topic navigation');
assert.ok(privacyHtml.includes('data-information-select') && privacyHtml.includes('Read a section'),'Phone section picker is generated from the same topics');
assert.ok(!privacyHtml.includes('href="#privacy-0"'),'Introduction is not a hidden tab');
for(const collection of gallery.collections.filter(c=>gallery.items.some(i=>i.collection===c.id))) {
  const path=`gallery/collections/${collection.id}/index.html`;
  assert.ok((await read(path)).includes(`https://artandavoodi.com/gallery/collections/${collection.id}/`));
  assert.ok(sitemap.includes(`https://artandavoodi.com/gallery/collections/${collection.id}/`));
}
assert.equal(selection(gallery,new URLSearchParams()).length,gallery.items.length);
assert.ok(selection(gallery,new URLSearchParams('collection=portfolio')).every(item=>item.collection==='portfolio'));
assert.equal(selection(gallery,new URLSearchParams('q=does-not-match-any-photo')).length,0);
assert.equal(selection({items:[{year:2024,title:'Test',image:{alt:'Test'}}]},new URLSearchParams('year=2024')).length,1);
assert.ok(photoUrl(gallery.items[0],new URLSearchParams('view=compact')).endsWith('?view=compact'));
for(const path of ['/hub/','/gallery/',...gallery.items.map(item=>`/gallery/${item.id}/`)]) {
  const html=await read(path.slice(1)+'index.html');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes(`rel="canonical" href="https://artandavoodi.com${path}"`));
  assert.ok(sitemap.includes(`https://artandavoodi.com${path}`));
  assert.ok(!html.includes('{{'));
}
const hub=JSON.parse(await read('assets/data/hub.json'));
const hubHtml=await read('hub/index.html');
for(const link of hub.links.filter(link=>link.url)) assert.ok(hubHtml.includes(`href="${escape(link.url)}"`));
for(const item of gallery.items) {
  const html=await read(`gallery/${item.id}/index.html`);
  assert.ok(html.includes('ImageObject') && html.includes(escape(item.image.alt)));
  assert.ok((await read('gallery/index.html')).includes(`href="/gallery/${item.id}/"`));
  const graph=JSON.parse(html.match(/type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1])['@graph'];
  const person=graph.find(entity=>entity['@type']==='Person');
  const image=graph.find(entity=>entity['@type']==='ImageObject');
  assert.equal(person.alternateName,'Saeed Davoodi');
  assert.equal((item.creator ? image.creator : image.about)['@id'],person['@id']);
  assert.ok(sitemap.includes('https://artandavoodi.com/'+item.image.src));
  assert.ok(html.includes(`<h1 hidden>${escape(item.title)}</h1>`));
  assert.ok(html.includes('data-photo-next') && html.includes('data-photo-previous'));
  assert.ok(html.includes('gallery__photo-atmosphere') && html.includes('srcset='));
  assert.ok(html.includes('data-gallery-filmstrip') && html.includes('href="/gallery/image-use/"'));
  assert.ok(html.includes(`href="/${item.image.src}" aria-label="View original image"`));
  const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').split('<body>')[1];
  assert.ok(!visible.includes(person.alternateName),'Legal name must remain metadata-only');
}
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
  for (const record of [item, ...(item.tracks || [])]) {
    for (const line of (record.lyrics || '').split('\n').filter(Boolean)) assert.ok(html.includes(escape(line)), 'Lyrics must be indexable');
  }
  for(const track of item.tracks||[]) {
    assert.ok(html.includes(`id="track-${track.id}"`));
    assert.ok(html.includes(escape(track.title)));
    if (track.duration) assert.ok(html.includes(track.duration));
    else assert.ok(!html.includes('undefined'));
  }
}
const remnant = data.items.find(item=>item.id==='remnant');
assert.equal(remnant.status, 'Upcoming');
assert.equal(remnant.releaseDate, undefined);
assert.deepEqual(remnant.tracks.map(track=>track.title), ['Station','Shadow','Wonder','Elsewhere','You','Lullaby','Filippa','Still']);
assert.equal(data.items.find(item=>item.id==='still-live-acoustic').status, 'Released');
assert.deepEqual(newestReleases(data.items.filter(item=>item.status==='Released')).map(item=>item.id), ['still-live-acoustic','dream','salim','solum','gone']);
for(const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) assert.ok(!/[?#]/.test(match[1]) && !match[1].includes('/workspace/'));
console.log('PASS: initial HTML, canonical URLs, all track anchors, JSON-LD and sitemap.');
assert.deepEqual(metadataRows({status:'Released'},[{key:'status',when:'Upcoming'}]),[]);
assert.deepEqual(metadataRows({format:'Instrumental'},[{key:'format'}],{format:'Instrumental'}),[]);
assert.equal(publishedValue({story:'Unapproved',editorial:{story:'draft'}},'story'),undefined);
assert.equal(archiveAssets({assets:[{status:'draft'}]}).length,0);
const ui=JSON.parse(await read('assets/data/interface.json'));
assert.equal(displayDuration({duration:'2:00'},ui,{status:'Upcoming'}),'Unreleased');
assert.equal(displayDuration({status:'Released',duration:'2:00'},ui),'2:00');
assert.equal(displayDuration({status:'upcoming'},ui),'Unreleased');
assert.equal(displayDuration({},ui,{status:'Upcoming'}),'Unreleased');
assert.equal(displayDuration({status:'Unreleased',duration:'—'},ui),'Unreleased');
assert.ok(catalogue.includes('class="music-context__brand" href="https://artanrecords.com/"'));
assert.ok(!catalogue.includes('<h3>Instruments &amp; studio</h3>'));
assert.ok((await read('music/remnant/index.html')).includes('<span>Unreleased</span>'));
assert.ok(!(await read('gallery/index.html')).includes('Artworks will appear here'));
const icons=JSON.parse(await read('assets/data/icons.json'));
const specimen={...data.items[0],tracks:[],archive:{tabs:[{label:'Score',assets:[{title:'Piano score',url:'https://example.com/score.pdf',instrument:'Piano',version:'1',preview:data.items[0].cover}]}]}};
const specimenHtml=releaseBody(specimen,ui,icons);
assert.ok(specimenHtml.includes('https://example.com/score.pdf') && specimenHtml.includes('Piano score') && specimenHtml.includes('Version'));
assert.ok(specimenHtml.includes('data-performance-toggle'),'Published archive assets enable performance reading');
assert.ok(!/<header[^>]*>[\s\S]*?data-performance-toggle[\s\S]*?<\/header>/.test(specimenHtml),'Performance action must not be promoted in the release heading');
assert.ok(/data-music-section="musicalDetails"[\s\S]*?data-performance-toggle/.test(specimenHtml),'Performance action belongs to musical details');
assert.ok(specimenHtml.includes('data-music-section="archive"'),'Archive sections retain semantic ownership');
assert.equal(hasPerformanceMaterial({key:'A minor'},ui),true,'Confirmed musical metadata enables performance reading');
assert.equal(hasPerformanceMaterial({key:'A minor',editorial:{key:'draft'}},ui),false,'Draft metadata does not enable a published performance action');
assert.equal(metadataRows({capo:0},[{key:'capo',label:'Capo'}])[0].value,0,'Zero capo is valid musical data');
const chordSpecimen=releaseBody({...specimen,archive:undefined,key:'A minor',chords:'Am F C G',chordProgression:'i VI III VII',timeSignature:'4/4',structure:'Verse / Chorus'},ui,icons);
for(const value of ['Am F C G','i VI III VII','4/4','Verse / Chorus'])assert.ok(chordSpecimen.includes(escape(value)),'Performance metadata must remain crawlable');
assert.ok((await read('music/remnant/index.html')).includes('Climax Chorus'),'Confirmed Remnant form is published');
console.log('PASS: editorial visibility, inherited details, archive assets and release-link boundaries.');
