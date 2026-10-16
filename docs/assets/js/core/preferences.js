/* Optional preference UI; no trackers, account systems or payments are initialized. */
import {loadJson} from './data.js';
import {renderIcon} from '../layers/site/media.js?v=6';
import './close-button.js?v=1';
export async function initializePreferences() {
  const [data,icons] = await Promise.all([loadJson('assets/data/privacy.json'),loadJson('assets/data/icons.json')]);
  const state = window.ArtanPreferences;
  if (!state || document.querySelector('[data-preferences-panel]')) return;
  const panel = document.createElement('dialog'); panel.dataset.preferencesPanel = '';
  panel.className = 'privacy-preferences'; panel.setAttribute('aria-label',data.preferences.title);
  const title = document.createElement('h2'); title.textContent = data.preferences.title;
  const description = document.createElement('p'); description.textContent = data.preferences.description;
  const actions = document.createElement('div'); actions.className = 'artist__actions';
  for (const [choice,label] of [['allow',data.preferences.allow],['reject',data.preferences.reject]]) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'control'; button.textContent = label;
    const icon=renderIcon(choice==='allow' ? data.preferences.allowIcon : data.preferences.rejectIcon,icons);
    if(icon){icon.alt='';button.prepend(icon);}
    button.addEventListener('click',()=>{state.setChoice(choice); if(choice==='allow')state.saveTheme(document.documentElement.dataset.themeEffective); panel.close();});
    actions.append(button);
  }
  const privacy = document.createElement('a'); privacy.href = '/privacy/'; privacy.textContent = data.preferences.link;
  privacy.className='privacy-preferences__notice';
  const close=document.createElement('button');close.type='button';close.className='privacy-preferences__close global-close-button';close.setAttribute('aria-label',data.preferences.close);window.NeuroartanCloseButtons.initCloseButtonPrimitive(close);close.addEventListener('click',()=>panel.close());
  panel.append(close,title,description,actions,privacy); document.body.append(panel);
  const links = document.createElement('nav'); links.className = 'privacy-links'; links.setAttribute('aria-label',data.title);
  links.append(privacy.cloneNode(true));
  const settings = document.createElement('button'); settings.type='button'; settings.textContent=data.preferences.settings;
  settings.addEventListener('click',()=>{if(!panel.open)panel.showModal();}); links.append(settings);
  const footer=document.querySelector('.site-footer');
  if(footer)footer.insertBefore(links,footer.querySelector('[data-copyright]'));
  else document.querySelector('main').append(links);
  const show = () => { if(state.choice()===null&&!panel.open)panel.showModal(); };
  const intro = async () => {
    if (location.pathname!=='/' || state.introSeen() || matchMedia('(prefers-reduced-motion: reduce)').matches) { show(); return; }
    const element=document.createElement('div'); element.className='artist-brand-intro'; element.setAttribute('aria-hidden','true');
    const mark=renderIcon(data.intro.icon,icons); element.append(mark); document.body.append(element);
    await mark.decode().catch(()=>{});
    const motion=getComputedStyle(document.documentElement);
    const duration=parseFloat(motion.getPropertyValue('--site-header-motion-duration')) || 420;
    try { await mark.animate([{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'scale(1)',offset:.4},{opacity:1,transform:'scale(1)',offset:.7},{opacity:0,transform:'scale(.94)'}],{duration:duration*2,easing:motion.getPropertyValue('--site-navigation-ease').trim()}).finished; } catch { /* Motion is optional. */ }
    state.markIntro(); element.remove(); show();
  };
  if (document.documentElement.hasAttribute('data-loading')) window.addEventListener('site:ready',intro,{once:true}); else await intro();
}
initializePreferences().catch(error=>console.error('[preferences]',error));
