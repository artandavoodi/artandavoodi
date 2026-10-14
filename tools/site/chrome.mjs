import {escape} from './render.mjs';

export function documentChrome(navigation, footer, ui, icons, identity) {
  const branding=ui.sectionBranding.artist;
  const icon=icons.items.find(item=>item.id===branding.icon);
  if(!icon) throw new Error('Unregistered document wordmark');
  const links=[...ui.sections];
  for(const item of ui.menuLinks||[]) {
    const index=links.findIndex(link=>link.id===item.after);
    links.splice(index<0?links.length:index+1,0,item);
  }
  const header=navigation.replace('data-skip></a>',`data-skip>${escape(ui.skipLabel)}</a>`)
    .replace('data-site-brand href="/" hidden></a>',`data-site-brand href="${escape(branding.href)}" aria-label="${escape(branding.label)}"><img src="/${escape(icon.src)}" alt=""${icon.monochrome?' data-monochrome="true"':''}></a>`)
    .replace('data-menu-navigation aria-label="Site menu"></nav>',`data-menu-navigation aria-label="${escape(ui.menuLabel)}">${links.map(link=>`<a href="${escape(link.path)}">${escape(link.label)}</a>`).join('')}</nav>`);
  const fallback=`<noscript><nav class="site-section" aria-label="${escape(ui.navigationLabel)}">${links.map(link=>`<a class="control" href="${escape(link.path)}">${escape(link.label)}</a>`).join(' ')}</nav></noscript>`;
  return {header:`<div data-fragment="navigation">${header}</div>${fallback}`,footer:`<div data-fragment="footer">${footer.replace('<p data-copyright></p>',`<p data-copyright>© ${new Date().getUTCFullYear()} ${escape(identity.name)}</p>`)}</div>`};
}
