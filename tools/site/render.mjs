/* Public documents generated from catalogue data; no separately authored release copy. */
import { publishedValue, metadataRows, archiveAssets } from '../../docs/assets/js/layers/site/music/publication.js';
export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const route = item => `/music/${item.id}/`;
const paragraphs = text => String(text || '').split(/\n\n+/).filter(Boolean).map(p => `<p>${escape(p)}</p>`).join('\n');
const duration = value => { const parts = String(value || '').split(':').map(Number); return parts.length === 2 && parts.every(Number.isFinite) ? `PT${parts[0]}M${parts[1]}S` : undefined; };
export function recording(item, album, origin) {
  const url = origin + route(album) + (item === album ? '' : `#track-${item.id}`);
  return { '@type':'MusicRecording', '@id':url+'-recording', url, name:item.title,
    byArtist:{'@id':origin+'/#artist'}, duration:duration(item.duration), isrcCode:item.isrc,
    datePublished:item.releaseDate || album.releaseDate, genre:item.genre || album.genre,
    image:origin+'/'+album.cover.src, description:item.description || undefined,
    ...(item !== album ? {inAlbum:{'@id':origin+route(album)+'#album'}} : {}),
    sameAs:(item.links || []).map(l=>l.url) };
}
export function head({title, description, path, image, graph}, origin) {
  const url=origin+path;
  return `<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${escape(url)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${escape(url)}">
<meta property="og:image" content="${escape(origin+'/'+image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(description)}">
<meta name="twitter:image" content="${escape(origin+'/'+image)}">
<script type="application/ld+json" id="site-structured-data">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script>`;
}
export function image(record, lazy=false) {
  return `<img src="/${escape(record.src)}" alt="${escape(record.alt)}" width="${record.width}" height="${record.height}" decoding="async"${lazy?' loading="lazy"':''}>`;
}
export function links(records, icons) {
  return `<div class="music-release__links">${[...(records || [])].sort((a,b)=>a.order-b.order).map(link=>{
    const icon=icons.items.find(i=>i.id===link.icon);
    if (!icon || !/^https:\/\//.test(link.url)) return '';
    return `<a class="music-release__platform" href="${escape(link.url)}" aria-label="${escape(link.label)}" target="_blank" rel="noopener noreferrer"><img src="/${escape(icon.src)}" alt=""${icon.monochrome?' data-monochrome="true"':''}><span class="music-release__platform-tooltip" aria-hidden="true">${escape(link.label)}</span></a>`;
  }).join('')}</div>`;
}
function disclosureIcon(ui, icons) {
  const icon=icons.items.find(i=>i.id===ui.musicDetailIcon);
  return icon ? `<img class="release-document__disclosure" src="/${escape(icon.src)}" alt=""${icon.monochrome?' data-monochrome="true"':''}>` : '';
}
const rows = records => records.map(record => `<p class="music-release-detail__row"><span class="music-release-detail__label">${escape(record.label)}</span><span class="music-release-detail__value">${escape(record.value)}</span></p>`).join('');
function sections(item, ui, icons, parent) {
  return ui.musicReaderFields.map(field=>{
    let body='';
    const value = publishedValue(item, field.key);
    if(field.key==='archive') body=(value?.tabs || []).filter(tab=>archiveAssets(tab).length).map(tab=>`<h3>${escape(tab.label)}</h3>${paragraphs(tab.description)}${archiveAssets(tab).map(a=>`${a.preview ? image(a.preview,true) : ''}<p><a href="${escape(a.url || '/'+a.path)}">${escape(a.title || a.label)}</a></p>${rows(metadataRows(a,ui.musicArchiveAssetDetails))}`).join('')}`).join('');
    else if (!parent || value !== publishedValue(parent,field.key)) body=paragraphs(value);
    body += rows(metadataRows(item,ui.musicSectionDetails?.[field.key],parent));
    if (!body) return '';
    return `<details class="release-document__section" id="${escape(item.id)}-${escape(field.key)}"><summary>${escape(field.label)}${disclosureIcon(ui,icons)}</summary>${body}</details>`;
  }).join('\n');
}
export function releaseBody(item, ui, icons) {
  const meta=rows(metadataRows(item,ui.musicDetails));
  return `<article class="music-release-detail music">
<figure class="music-release-detail__cover">${image(item.cover)}</figure>
<header class="music-release-detail__heading"><h1>${escape(item.title)}</h1><p>${escape(item.type)} · ${escape(item.artist)}</p></header>
${paragraphs(item.description)}<div class="music-release-detail__meta">${meta}</div>
${links(item.links,icons)}${sections(item,ui,icons)}
${item.tracks?.length ? `<section><h2>${escape(ui.musicTrackListLabel)}</h2><ol class="release-document__tracks">${item.tracks.map(t=>`<li id="track-${escape(t.id)}"><details><summary>${escape(t.title)} <span>${escape(t.duration)}</span>${disclosureIcon(ui,icons)}</summary>${sections(t,ui,icons,item)}${links(t.links,icons)}</details></li>`).join('')}</ol></section>`:''}
</article>`;
}
export function documentPage(metadata, body, origin, backLabel) {
  return `<!doctype html>
<!-- Generated by tools/build-site.mjs. Edit JSON or templates, not this output. -->
<html lang="en" data-generated-page="true"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
${head(metadata,origin)}
<link rel="stylesheet" href="/assets/css/core/00-orchestrator/style.css?v=15">
<link rel="stylesheet" href="/assets/css/layers/site/music-release/index.css?v=3">
<link rel="stylesheet" href="/assets/css/layers/site/music-release/document.css?v=3">
<script type="module" src="/assets/js/layers/site/music-release/document.js?v=2"></script>
</head><body><main class="music-release-page" id="main-content"><a class="site-back-link" data-document-back href="${metadata.path==='/music/'?'/':'/music/'}" aria-label="${escape(backLabel)}">${escape(backLabel)}</a>${body}</main></body></html>`;
}
