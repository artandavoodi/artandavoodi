/* Enhance generated documents without replacing their crawlable content. */
import {initializeTheme} from '../../../core/theme.js';
import {loadJson} from '../../../core/data.js';
import {renderIcon} from '../media.js';
initializeTheme();
const [ui,icons]=await Promise.all([loadJson('assets/data/interface.json'),loadJson('assets/data/icons.json')]);
const back=document.querySelector('[data-document-back]');
const icon=renderIcon(ui.musicBack.icon,icons);
if(icon && back) { icon.alt=''; back.replaceChildren(icon); }
const revealTrack=()=>{
  let id;
  try { id=decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target=document.getElementById(id);
  if(target?.matches('.release-document__tracks > li')) target.querySelector('details').open=true;
};
revealTrack();
window.addEventListener('hashchange',revealTrack);
