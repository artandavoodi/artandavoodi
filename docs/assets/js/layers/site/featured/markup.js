/* One catalogue-driven slide structure for static publication and enhancement. */
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function featuredMarkup(config,entries,icons){
  const icon=icons.items.find(item=>item.id===config.listenIcon);
  if(!icon)throw Error(`Unknown featured action icon: ${config.listenIcon}`);
  const listenIcon=`<img src="/${escape(icon.fallbackSrc||icon.src)}" alt=""${icon.monochrome?' data-monochrome="true"':''}>`;
  const slides=entries.map(({record,href},index)=>{
    const image=record.cover||record.image;
    const artwork=`<img src="/${escape(image.src)}" alt="${escape(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async"${image.variants?.length?` srcset="${image.variants.map(v=>`/${escape(v.src)} ${v.width}w`).join(', ')}" sizes="(max-width: 1024px) 90vw, 40vw"`:''}>`;
    return `<article class="featured__item" aria-label="${index+1} / ${entries.length} · ${escape(record.title)}"><a class="featured__artwork" href="${escape(href)}" aria-label="${escape(record.title)}"><figure>${artwork}</figure></a><div class="featured__copy"><h3><a href="${escape(href)}">${escape(record.title)}</a></h3><p>${escape(record.subtitle||record.type)}</p><a class="control" data-emphasis="${escape(config.listenEmphasis)}" href="${escape(href)}">${listenIcon}${escape(config.listenLabel)}</a></div></article>`;
  }).join('');
  const dots=entries.map(({record},index)=>`<button type="button" data-featured-dot="${index}" aria-label="${escape(record.title)}"${index===0?' aria-current="true"':''}></button>`).join('');
  return `<div class="featured__items" data-featured-track tabindex="0" role="group" aria-label="${escape(config.title)}">${slides}</div><nav class="featured__dots" data-featured-dots aria-label="${escape(config.navigationLabel)}" hidden>${dots}</nav><p class="visually-hidden" data-featured-status aria-live="polite" aria-atomic="true"></p>`;
}
