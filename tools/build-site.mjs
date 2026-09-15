/* Deterministic static generation, compatible with GitHub Pages /docs publishing. */
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {head, image, route, escape, recording, releaseBody, documentPage} from './site/render.mjs';
const root=new URL('../',import.meta.url), docs=new URL('docs/',root);
const json=async p=>JSON.parse(await readFile(new URL(p,docs),'utf8'));
const [site,ui,artist,catalogue,icons,hub]=await Promise.all(['assets/data/site.json','assets/data/interface.json','assets/data/artist/profile.json','assets/data/music/releases.json','assets/data/icons.json','assets/data/hub.json'].map(json));
const origin=`https://${site.identity.domain}`;
const person={'@type':'Person','@id':origin+'/#artist',name:artist.name,url:origin+'/',description:artist.biography,sameAs:hub.links.filter(l=>l.url?.startsWith('https:')).map(l=>l.url)};
const website={'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:artist.name};
const output=async (path,html)=>{ const url=new URL(path,docs); await mkdir(new URL('./',url),{recursive:true}); await writeFile(url,html); };
const musicLabel=ui.sections.find(s=>s.id==='music').label;
const cards=catalogue.items.map(item=>`<article class="music-release"><figure class="music-release__cover"><a href="${route(item)}">${image(item.cover,true)}</a></figure><div class="music-release__content"><h2><a href="${route(item)}">${escape(item.title)}</a></h2><p>${escape(item.type)} · ${escape(item.artist)}</p><p>${escape(item.description)}</p></div></article>`).join('\n');
const collection={'@type':'CollectionPage','@id':origin+'/music/',url:origin+'/music/',name:musicLabel,mainEntity:{'@type':'ItemList',itemListElement:catalogue.items.map((r,i)=>({'@type':'ListItem',position:i+1,url:origin+route(r),name:r.title}))}};
for (const item of catalogue.items) {
  if (!/^[a-z0-9-]+$/.test(item.id)) throw new Error('Invalid release id');
  const path=route(item);
  for (const alias of item.aliases || []) {
    if (!/^[a-z0-9-]+$/.test(alias) || catalogue.items.some(record=>record.id===alias)) throw new Error('Invalid release alias');
    await output(`music/${alias}/index.html`,`<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(item.title)}</title><link rel="canonical" href="${origin}${path}"><meta http-equiv="refresh" content="0;url=${path}"></head><body><a href="${path}">${escape(item.title)}</a></body></html>\n`);
  }
  const entity=item.type==='Single'?recording(item,item,origin):{'@type':'MusicAlbum','@id':origin+path+'#album',name:item.title,url:origin+path,byArtist:{'@id':person['@id']},datePublished:item.releaseDate,genre:item.genre,image:origin+'/'+item.cover.src,description:item.description,numTracks:item.tracks?.length,track:(item.tracks||[]).map(t=>recording(t,item,origin)),sameAs:item.links.map(l=>l.url)};
  const breadcrumbs={'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:musicLabel,item:origin+'/music/'},{'@type':'ListItem',position:2,name:item.title,item:origin+path}]};
  await output(path.slice(1)+'index.html',documentPage({title:`${item.title} · ${artist.name}`,description:item.description,path,image:item.cover.src,graph:[person,website,entity,breadcrumbs]},releaseBody(item,ui,icons),origin,ui.musicBack.label));
}
let shell=await readFile(new URL('tools/site/home.html',root),'utf8');
const musicShell=shell.replace('{{HEAD}}',head({title:`${musicLabel} · ${artist.name}`,description:artist.summary,path:'/music/',image:artist.portrait.src,graph:[person,website,collection]},origin))
  .replace('data-generated-page="true"','data-generated-page="true" data-initial-route="music"')
  .replace('<div data-fragment="artist">{{ARTIST}}</div>','<div data-fragment="artist" hidden></div>')
  .replace('<div data-fragment="music" hidden></div>',`<div data-fragment="music"><section class="site-section music"><h1>${escape(musicLabel)}</h1>${cards}</section></div>`)
  .replaceAll('href="./assets/','href="/assets/').replaceAll('src="./assets/','src="/assets/');
await output('music/index.html',musicShell);
shell=shell.replace('{{HEAD}}',head({title:`${artist.name} · ${artist.headline}`,description:artist.biography,path:'/',image:artist.portrait.src,graph:[person,website]},origin));
shell=shell.replace('{{ARTIST}}',`<section class="site-section artist"><div class="artist__portrait"><figure>${image(artist.portrait)}</figure></div><h1>${escape(artist.name)}</h1><p class="artist__biography">${escape(artist.biography)}</p><a href="/music/">${escape(musicLabel)}</a></section>`);
await output('index.html',shell);
const urls=['/','/music/',...catalogue.items.map(route)];
await output('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(p=>`  <url><loc>${origin}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Generated homepage, catalogue, ${catalogue.items.length} releases and sitemap.`);
