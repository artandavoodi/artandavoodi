/* Enhance generated documents without replacing their crawlable content. */
import {initializeTheme,bindTheme} from '../../../core/theme.js';
import {bindNavigation} from '../navigation.js?v=16';
import {loadJson} from '../../../core/data.js';
import {renderIcon} from '../media.js';
import {bindInformationTabs} from '../information-tabs.js?v=2';
import {bindArtistEnquiry} from '../artist/enquiry.js';
initializeTheme();
bindInformationTabs();
bindArtistEnquiry();
const [ui,icons]=await Promise.all([loadJson('assets/data/interface.json'),loadJson('assets/data/icons.json')]);
const performanceToggle=document.querySelector('[data-performance-toggle]');
let readingState=[];
performanceToggle?.addEventListener('click',()=>{
  const active=performanceToggle.getAttribute('aria-pressed')!=='true';
  performanceToggle.setAttribute('aria-pressed',String(active));
  performanceToggle.textContent=active ? ui.musicPerformance.close : ui.musicPerformance.open;
  document.documentElement.classList.toggle('music-performance',active);
  if(active){
    readingState=[...document.querySelectorAll('details')].map(section=>[section,section.open]);
    document.querySelectorAll('[data-music-section="lyrics"], [data-music-section="archive"], [data-music-section="musicalDetails"]').forEach(section=>{
      section.open=true;
      const track=section.closest('li')?.querySelector('details');
      if(track) track.open=true;
    });
  } else readingState.forEach(([section,open])=>{section.open=open;});
});
if(document.querySelector('[data-site-navigation]')) {
  document.querySelector('[data-skip]').textContent=ui.skipLabel;
  bindTheme(ui.theme);
  bindNavigation(ui,icons);
}
const back=document.querySelector('[data-document-back]');
const icon=renderIcon(ui.musicBack.icon,icons);
if(icon && back) { icon.alt=''; back.replaceChildren(icon); }
const revealTrack=()=>{
  let id;
  try { id=decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target=document.getElementById(id);
  if(target?.matches('.release-document__tracks > li')) target.querySelector('details').open=true;
  if(target?.matches('details.release-document__section')) {
    target.open=true;
    const parent=target.closest('li')?.querySelector('details');
    if(parent) parent.open=true;
  }
};
revealTrack();
window.addEventListener('hashchange',revealTrack);
document.querySelectorAll('details.release-document__section').forEach(section=>{
  section.addEventListener('toggle',()=>{
    if(section.open && !document.documentElement.classList.contains('music-performance')) history.replaceState(null,'',`#${section.id}`);
  });
});
