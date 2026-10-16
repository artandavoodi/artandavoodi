/* Deterministic static generation, compatible with GitHub Pages /docs publishing. */
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {head, image, route, escape, recording, releaseBody, documentPage} from './site/render.mjs';
import {newestReleases} from '../docs/assets/js/layers/site/music/publication.js';
import {contextMarkup} from '../docs/assets/js/layers/site/music/context/markup.js';
import {homepageMarkup} from '../docs/assets/js/layers/site/artist/homepage.js';
import {concertPageData,concertCalendar,concertUrl} from './site/concerts.mjs';
import {documentChrome} from './site/chrome.mjs';
const root=new URL('../',import.meta.url), docs=new URL('docs/',root);
const json=async p=>JSON.parse(await readFile(new URL(p,docs),'utf8'));
const [site,ui,artist,catalogue,icons,hub]=await Promise.all(['assets/data/site.json','assets/data/interface.json','assets/data/artist/profile.json','assets/data/music/releases.json','assets/data/icons.json','assets/data/hub.json'].map(json));
const origin=`https://${site.identity.domain}`;
const chrome=documentChrome(await readFile(new URL('assets/fragments/navigation.html',docs),'utf8'),await readFile(new URL('assets/fragments/footer.html',docs),'utf8'),ui,icons,site.identity);
catalogue.items = newestReleases(catalogue.items);
const person={'@type':'Person','@id':origin+'/#artist',name:artist.name,url:origin+'/',description:artist.biography,image:{'@type':'ImageObject',contentUrl:origin+'/'+artist.portrait.src,caption:artist.portrait.alt,width:artist.portrait.width,height:artist.portrait.height},sameAs:hub.links.filter(l=>l.url?.startsWith('https:')).map(l=>l.url)};
const website={'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:artist.name};
if(artist.alternateName) person.alternateName=artist.alternateName;
const output=async (path,html)=>{
  const url=new URL(path,docs);
  if(path.endsWith('.html') && html.includes('class="music-release-page"') && !html.includes('data-gallery-viewer="true"')) html=html.replace('<body><main',`<body>${chrome.header}<main`).replace('</main></body>',`</main>${chrome.footer}</body>`);
  if(path.endsWith('.html')) html=html.replace('<div data-fragment="navigation"></div>',`<div data-fragment="navigation"><nav aria-label="${escape(ui.navigationLabel)}">${[...ui.sections,...(ui.menuLinks||[])].map(s=>`<a href="${escape(s.path)}">${escape(s.label)}</a>`).join(' ')}</nav></div>`);
  await mkdir(new URL('./',url),{recursive:true}); await writeFile(url,html);
};
const privacy=await json('assets/data/privacy.json');
const concerts=await json('assets/data/concerts.json');
const {body:concertBody,graph:concertGraph}=concertPageData(concerts,person['@id'],origin);
await output('concerts/index.html',documentPage({title:`${concerts.title} · ${artist.name}`,description:concerts.description,path:'/concerts/',graph:[person,website,...concertGraph]},concertBody,origin,'Back to Artist').replace('href="/music/"','href="/"'));
for(const event of concerts.events) {
  const {body,graph}=concertPageData({...concerts,title:event.name,events:[event]},person['@id'],origin);
  await output(concertUrl(event).slice(1)+'index.html',documentPage({title:`${event.name} · ${artist.name}`,description:`${event.venue} · ${event.city}`,path:concertUrl(event),graph:[person,website,...graph]},body,origin,concerts.scheduleLabel).replace('href="/music/"','href="/concerts/"'));
  await output(concertUrl(event).slice(1)+'event.ics',concertCalendar(event,origin));
}
await output('assets/js/core/preference-config.js',`/* Generated from assets/data/privacy.json. */\nwindow.ArtanPreferenceConfig=Object.freeze(${JSON.stringify(privacy.storage)});\n`);
const privacyTopics=privacy.sections.slice(1);
const privacyBody=`<article class="privacy-document" data-information-tabs><h1>${escape(privacy.title)}</h1><p>Effective date: <time datetime="${escape(privacy.effectiveDate)}">${escape(privacy.effectiveDate)}</time> · Last updated: <time datetime="${escape(privacy.lastUpdated)}">${escape(privacy.lastUpdated)}</time></p><section id="privacy-0"><h2>${escape(privacy.sections[0].title)}</h2><p>${escape(privacy.sections[0].text)}</p></section><label class="information-section-picker" hidden><span>${escape(privacy.sectionLabel)}</span><select class="ui-field" data-information-select>${privacyTopics.map((section,index)=>`<option value="${index}">${escape(section.title)}</option>`).join('')}</select></label><nav aria-label="${escape(privacy.title)}">${privacyTopics.map((section,index)=>`<a href="#privacy-${index+1}">${escape(section.title)}</a>`).join('')}</nav>${privacyTopics.map((section,index)=>`<section id="privacy-${index+1}"><h2>${escape(section.title)}</h2><p>${escape(section.text)}</p>${(section.links||[]).map(link=>`<a href="${escape(link.href)}">${escape(link.label)}</a>`).join('')}</section>`).join('')}<a href="${escape(privacy.contact)}">${escape(privacy.contactLabel)}</a></article>`;
await output('privacy/index.html',documentPage({title:privacy.title,path:'/privacy/',description:privacy.title,graph:[]},privacyBody,origin,'Back to Hub').replace('href="/music/"','href="/hub/"').replace('index,follow,max-image-preview:large','noindex,follow'));
const musicLabel=ui.sections.find(s=>s.id==='music').label;
const musicContext=await json('assets/data/music/context.json');
const cards=catalogue.items.map(item=>`<article class="music-release"><figure class="music-release__cover"><a href="${route(item)}">${image(item.cover,true)}</a></figure><div class="music-release__content"><h2><a href="${route(item)}">${escape(item.title)}</a></h2><p>${escape(item.type)} · ${escape(item.artist)}</p><p>${escape(item.description)}</p></div></article>`).join('\n');
const collection={'@type':'CollectionPage','@id':origin+'/music/',url:origin+'/music/',name:musicLabel,mainEntity:{'@type':'ItemList',itemListElement:catalogue.items.map((r,i)=>({'@type':'ListItem',position:i+1,url:origin+route(r),name:r.title}))}};
for (const item of catalogue.items) {
  if (!/^[a-z0-9-]+$/.test(item.id)) throw new Error('Invalid release id');
  const path=route(item);
  for (const alias of item.aliases || []) {
    if (!/^[a-z0-9-]+$/.test(alias) || catalogue.items.some(record=>record.id===alias)) throw new Error('Invalid release alias');
    await output(`music/${alias}/index.html`,`<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(item.title)}</title><link rel="canonical" href="${origin}${path}"><meta http-equiv="refresh" content="0;url=${path}"></head><body><a href="${path}">${escape(item.title)}</a></body></html>\n`);
  }
  const entity=item.type==='Single'?recording(item,item,origin):{'@type':'MusicAlbum','@id':origin+path+'#album',name:item.title,url:origin+path,byArtist:{'@id':person['@id']},datePublished:item.releaseDate,genre:item.genre,image:item.cover ? origin+'/'+item.cover.src : undefined,description:item.description,numTracks:item.tracks?.length,track:(item.tracks||[]).map(t=>recording(t,item,origin)),sameAs:item.links.map(l=>l.url)};
  entity.creativeWorkStatus = item.status;
  if (item.label) entity.publisher = {'@type':'Organization',name:item.label};
  const breadcrumbs={'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:musicLabel,item:origin+'/music/'},{'@type':'ListItem',position:2,name:item.title,item:origin+path}]};
  await output(path.slice(1)+'index.html',documentPage({title:`${item.title} · ${artist.name}`,description:item.description,path,image:item.cover?.src,graph:[person,website,entity,breadcrumbs]},releaseBody(item,ui,icons),origin,ui.musicBack.label));
}
let shell=await readFile(new URL('tools/site/home.html',root),'utf8');
const musicShell=shell.replace('{{HEAD}}',head({title:`${musicLabel} · ${artist.name}`,description:artist.summary,path:'/music/',image:artist.portrait.src,graph:[person,website,collection]},origin))
  .replace('data-generated-page="true"','data-generated-page="true" data-initial-route="music"')
  .replace('<div data-fragment="artist">{{ARTIST}}</div>','<div data-fragment="artist" hidden></div>')
  .replace('<div data-fragment="music" hidden></div>',`<div data-fragment="music"><section class="site-section music"><h1>${escape(musicLabel)}</h1>${cards}<div class="music-context">${contextMarkup(musicContext,icons)}</div></section></div>`)
  .replaceAll('href="./assets/','href="/assets/').replaceAll('src="./assets/','src="/assets/');
await output('music/index.html',musicShell);
shell=shell.replace('{{HEAD}}',head({title:`${artist.name} · ${artist.headline}`,description:artist.biography,path:'/',image:artist.portrait.src,graph:[person,website]},origin));
const featured=await json('assets/data/featured.json');
const gallery=await json(site.catalogues.gallery);
await output(artist.homepage.portraitPath.slice(1)+'index.html',documentPage({title:`${artist.name} · Press portrait`,description:artist.portrait.alt,path:artist.homepage.portraitPath,image:artist.portrait.src,graph:[person]},`<article class="artist artist__press"><h1>${escape(artist.homepage.portraitsTitle)}</h1>${image(artist.portrait)}<a class="control" href="/${escape(artist.portrait.src)}" download>${escape(artist.homepage.downloadPortraitLabel)}</a></article>`,origin,artist.homepage.pressTitle).replace('href="/music/"','href="/press/#press-portraits"'));
const homepage=homepageMarkup(artist,catalogue,gallery,hub,concerts,icons);
await output(artist.homepage.biographyPath,`${artist.name}\n\n${artist.biography}\n\n${origin}/\n`);
const featuredImages=[...homepage.imageSources];
const featuredCards=[];
for(const selection of featured.items.filter(item=>item.enabled!==false)) {
  const records=await json(site.catalogues[selection.catalogue]);
  const item=records.items.find(item=>item.id===selection.id);
  if(!item) throw new Error('Unknown featured item');
  featuredImages.push((item.cover || item.image).src);
  featuredCards.push(`<a class="featured__item" href="${escape(selection.href)}"><figure>${image(item.cover || item.image,true)}</figure><h3>${escape(item.title)}</h3><p>${escape(item.subtitle || item.type)}</p></a>`);
}
shell=shell.replace('{{ARTIST}}',`<section class="artist"><div class="site-section artist__screen artist__introduction"><div class="artist__portrait"><figure>${image(artist.portrait)}</figure></div><h1>${escape(artist.name)}</h1><p class="artist__biography">${escape(artist.biography)}</p><div class="artist__actions">${homepage.actions}</div></div><section class="site-section artist__screen artist__latest">${homepage.latest}</section><div class="site-section artist__screen"><section class="featured"><h2>${escape(featured.title)}</h2><div class="featured__items">${featuredCards.join('')}</div></section></div><section class="site-section artist__screen artist__visual">${homepage.visual}</section></section>`);
await output('press/index.html',documentPage({title:`${artist.homepage.pressTitle} · ${artist.name}`,description:artist.homepage.pressIntroduction,path:'/press/',graph:[person,website]},`<article class="artist__press press-document">${homepage.press}</article>`,origin,'Back to Hub').replace('href="/music/"','href="/hub/"'));
shell=shell.replace('<div class="site-section artist__screen"><section class="featured">',`<section class="site-section artist__screen artist__concerts">${homepage.concerts}</section><div class="site-section artist__screen"><section class="featured">`);
await output('index.html',shell);
const routeShell=await readFile(new URL('tools/site/home.html',root),'utf8');
const galleryLabel=ui.sections.find(s=>s.id==='gallery').label;
const galleryHeaderAtmosphere=gallery.header?.grain?'<canvas class="gallery__grain" aria-hidden="true"></canvas>':'';
const galleryBody=gallery.collections.filter(c=>gallery.items.some(i=>i.collection===c.id)).map(c=>`<section class="gallery__collection"><h2>${escape(c.title)}</h2><div class="gallery__images">${gallery.items.filter(i=>i.collection===c.id).map(i=>`<a href="/gallery/${escape(i.id)}/">${image(i.image,true)}</a>`).join('')}</div></section>`).join('');
const hubBody=hub.groups.map(g=>`<section class="hub__group" data-presentation="${escape(g.presentation)}"><h2>${escape(g.label)}</h2><div class="hub__group-links">${hub.links.filter(l=>l.category===g.id&&l.url).sort((a,b)=>a.order-b.order).map(l=>{const icon=icons.items.find(i=>i.id===l.icon);return `<a class="hub__link" href="${escape(l.url)}" aria-label="${escape(l.label)}">${icon?`<img src="/${escape(icon.src)}" alt=""${icon.monochrome?' data-monochrome="true"':''}>`:''}<span class="hub__tooltip">${escape(l.label)}</span></a>`;}).join('')}</div></section>`).join('')+`<div class="hub__pages">${(hub.pages||[]).map(page=>`<a class="control" href="${escape(page.href)}">${escape(page.label)}</a>`).join('')}</div>`;
for(const [id,title,description,body] of [
  ['gallery',galleryLabel,`${galleryLabel} · ${artist.name}`,galleryBody],
  ['hub',hub.title,`Connect with ${artist.name}: music, social channels, websites and email.`,hubBody]
]) {
  const path=ui.sections.find(s=>s.id===id).path;
  const html=routeShell.replace('{{HEAD}}',head({title:`${title} · ${artist.name}`,description,path,image:artist.portrait.src,graph:[person,website,{'@type':'CollectionPage','@id':origin+path,url:origin+path,name:title}]},origin))
    .replace('data-generated-page="true"',`data-generated-page="true" data-initial-route="${id}"`)
    .replace('<div data-fragment="artist">{{ARTIST}}</div>','<div data-fragment="artist" hidden></div>')
    .replace(`<div data-fragment="${id}" hidden></div>`,`<div data-fragment="${id}"><section class="site-section ${id}">${id==='gallery'?`<header class="gallery__header">${galleryHeaderAtmosphere}<h1>${escape(title)}</h1></header>`:`<h1>${escape(title)}</h1>`}${body}</section></div>`)
    .replaceAll('href="./assets/','href="/assets/').replaceAll('src="./assets/','src="/assets/');
  await output(path.slice(1)+'index.html',html);
}
for(const collection of gallery.collections.filter(c=>gallery.items.some(i=>i.collection===c.id))) {
  const path=`/gallery/collections/${collection.id}/`;
  const records=gallery.items.filter(i=>i.collection===collection.id);
  const body=`<section class="gallery__collection"><h2>${escape(collection.title)}</h2><div class="gallery__images">${records.map(i=>`<a href="/gallery/${escape(i.id)}/?collection=${escape(collection.id)}">${image(i.image,true)}</a>`).join('')}</div></section>`;
  const html=routeShell.replace('{{HEAD}}',head({title:`${collection.title} · ${artist.name}`,description:`${collection.title} from the Art & Gallery collection of ${artist.name}.`,path,image:records[0].image.src,graph:[person,website,{'@type':'CollectionPage','@id':origin+path,url:origin+path,name:collection.title}]},origin))
    .replace('data-generated-page="true"','data-generated-page="true" data-initial-route="gallery"')
    .replace('<div data-fragment="artist">{{ARTIST}}</div>','<div data-fragment="artist" hidden></div>')
    .replace('<div data-fragment="gallery" hidden></div>',`<div data-fragment="gallery"><section class="site-section gallery"><header class="gallery__header">${galleryHeaderAtmosphere}<h1>${escape(galleryLabel)}</h1></header>${body}</section></div>`)
    .replaceAll('href="./assets/','href="/assets/').replaceAll('src="./assets/','src="/assets/');
  await output(path.slice(1)+'index.html',html);
}
for(const item of gallery.items) {
  if(!/^[a-z0-9-]+$/.test(item.id)) throw new Error('Invalid gallery id');
  const path=`/gallery/${item.id}/`, title=item.title||item.image.alt;
  const entity={'@type':'ImageObject','@id':origin+path+'#image',name:title,description:item.description||item.image.alt,contentUrl:origin+'/'+item.image.src,url:origin+path,width:item.image.width,height:item.image.height,...(item.creator===artist.name?{creator:{'@id':person['@id']}}:{about:{'@id':person['@id']}}),representativeOfPage:true,...(item.tags?.length?{keywords:item.tags.join(', ')}:{})};
  const original=item.image;
  const index=gallery.items.indexOf(item);
  const adjacent=(record,key,iconId)=>{const icon=icons.items.find(i=>i.id===iconId);return `<a data-photo-${key} ${record?`href="/gallery/${escape(record.id)}/"`:'hidden'} aria-label="${escape(gallery.controls[key])}"><img data-monochrome="true" src="/${escape(icon.src)}" alt=""></a>`;};
  const contact=hub.links.find(link=>link.category==='email'&&link.url?.startsWith('mailto:'));
  const enquiry=contact?`<a class="gallery__image-enquiry" href="/gallery/image-use/">${escape(gallery.controls.imageUse)}</a>`:'';
  const navigation=`<nav class="gallery__viewer-nav" aria-label="${escape(gallery.controls.photos)}">${adjacent(gallery.items[index-1],'previous','chevron-left')}<div class="gallery__viewer-information"><span data-photo-count>${index+1} / ${gallery.items.length}</span>${enquiry}</div>${adjacent(gallery.items[index+1],'next','chevron-right')}</nav>`;
  const atmosphere=`<div class="gallery__photo-atmosphere" aria-hidden="true">${image({...item.image,alt:''})}</div>`;
  const filmstrip=`<nav class="gallery__filmstrip" data-gallery-filmstrip aria-label="${escape(gallery.controls.filmstrip)}">${gallery.items.map(i=>{const preview=i.image.variants?.[0]||i.image;return `<a href="/gallery/${escape(i.id)}/" aria-label="${escape(i.image.alt)}"${i.id===item.id?' aria-current="page"':''}>${image({...i.image,src:preview.src,variants:[]},true)}</a>`;}).join('')}</nav>`;
  const body=`${atmosphere}<article data-gallery-photo="${escape(item.id)}"><h1 hidden>${escape(title)}</h1><a href="/${escape(item.image.src)}" aria-label="${escape(gallery.originalImageLabel)}">${image(original)}</a></article>${navigation}${filmstrip}`;
  await output(path.slice(1)+'index.html',documentPage({title:`${title} · ${artist.name}`,description:entity.description,path,image:item.image.src,graph:[person,website,entity]},body,origin,galleryLabel).replace('href="/music/"','href="/gallery/"').replace('<html lang="en"','<html lang="en" data-gallery-viewer="true"').replace('</head>','<script type="module" src="/assets/js/layers/site/gallery/viewer.js?v=2"></script></head>'));
}
const imageUse=gallery.imageUse;
const imageUseContact=hub.links.find(link=>link.category==='email'&&link.url?.startsWith('mailto:'));
await output('gallery/image-use/index.html',documentPage({title:`${imageUse.title} · ${artist.name}`,description:imageUse.introduction,path:'/gallery/image-use/',graph:[person,website]},`<article class="gallery__image-use"><h1>${escape(imageUse.title)}</h1><p>${escape(imageUse.introduction)}</p>${imageUse.sections.map(section=>`<section><h2>${escape(section.title)}</h2><p>${escape(section.text)}</p></section>`).join('')}${imageUseContact?`<a class="control" href="${escape(imageUseContact.url)}">${escape(imageUse.contactLabel)}</a>`:''}</article>`,origin,galleryLabel).replace('href="/music/"','href="/gallery/"'));
const urls=['/','/music/','/concerts/',...concerts.events.map(concertUrl),'/gallery/','/gallery/image-use/','/hub/','/press/',artist.homepage.portraitPath,...gallery.collections.filter(c=>gallery.items.some(i=>i.collection===c.id)).map(c=>`/gallery/collections/${c.id}/`),...gallery.items.map(i=>`/gallery/${i.id}/`),...catalogue.items.map(route)];
await output('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.map(p=>{
  const images=p==='/'?[...new Set([artist.portrait.src,...featuredImages])]:p.startsWith('/gallery/')?gallery.items.filter(i=>p==='/gallery/'||p===`/gallery/${i.id}/`||p===`/gallery/collections/${i.collection}/`).map(i=>i.image.src):catalogue.items.filter(r=>r.cover&&(p==='/music/'||p===route(r))).map(r=>r.cover.src);
  return `  <url><loc>${origin}${p}</loc>${images.map(src=>`<image:image><image:loc>${escape(origin+'/'+src)}</image:loc></image:image>`).join('')}</url>`;
}).join('\n')}\n</urlset>\n`);
console.log(`Generated homepage, concerts, catalogue, ${catalogue.items.length} releases and sitemap.`);
