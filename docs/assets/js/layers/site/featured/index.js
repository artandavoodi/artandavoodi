/* ARTANDAVOODI · Resolve featured references without duplicating catalogue content. */
import { loadJson } from '../../../core/data.js?v=9';
import { featuredMarkup } from './markup.js';

export async function render(config, site, icons) {
  const selections = config.items.filter(item => item.enabled !== false);
  const catalogues = new Map();
  for (const name of new Set(selections.map(item => item.catalogue))) {
    if (!site.catalogues[name]) throw new Error(`Unregistered featured catalogue: ${name}`);
    catalogues.set(name, await loadJson(site.catalogues[name]));
  }
  const entries = selections.map(selection => {
    const record = catalogues.get(selection.catalogue).items.find(item => item.id === selection.id);
    if (!record) throw new Error(`Unknown featured item: ${selection.id}`);
    const url = new URL(selection.href, location.href);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid featured destination');
    return {record,href:selection.href};
  });
  document.querySelector('[data-featured-title]').textContent = config.title;
  document.querySelector('[data-featured-items]').innerHTML=featuredMarkup(config,entries,icons);
  const featured=document.querySelector('[data-featured]');
  featured.hidden = entries.length === 0;
  bindFeaturedCarousel(featured);
}

/* Same native-scroll/dot-selection model as the Records homepage; no autoplay. */
export function bindFeaturedCarousel(featured){
  if(!featured||featured.hasAttribute('data-carousel-ready'))return;
  const track=featured.querySelector('[data-featured-track]');
  const slides=[...track.children];
  const dots=[...featured.querySelectorAll('[data-featured-dot]')];
  if(slides.length<2)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const status=featured.querySelector('[data-featured-status]');
  let frame=0,active=0;
  const nearest=()=>slides.reduce((best,slide,index)=>Math.abs(slide.offsetLeft-track.scrollLeft)<Math.abs(slides[best].offsetLeft-track.scrollLeft)?index:best,0);
  const update=()=>{
    frame=0;
    const index=nearest();
    dots.forEach((dot,i)=>{if(i===index)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});
    if(active!==index)status.textContent=slides[index].getAttribute('aria-label');
    active=index;
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  const go=index=>track.scrollTo({left:slides[Math.max(0,Math.min(slides.length-1,index))].offsetLeft,behavior:reduced.matches?'auto':'smooth'});
  dots.forEach((dot,index)=>dot.addEventListener('click',()=>go(index)));
  track.addEventListener('keydown',event=>{
    const index=nearest(),targets={ArrowLeft:index-1,ArrowRight:index+1,Home:0,End:slides.length-1};
    if(!(event.key in targets)||event.altKey||event.ctrlKey||event.metaKey)return;
    event.preventDefault();go(targets[event.key]);
  });
  track.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  featured.querySelector('[data-featured-dots]').hidden=false;
  featured.setAttribute('data-carousel-ready','');
  update();
}
