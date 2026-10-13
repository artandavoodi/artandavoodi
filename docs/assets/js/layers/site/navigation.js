/* ARTANDAVOODI · Navigation behavior and menu state owner. */
import { bindMenu } from '../../core/menu.js?v=2';
import { renderIcon } from './media.js?v=6';
export function bindNavigation(ui, icons) {
  const branding = ui.sectionBranding?.[document.documentElement.dataset.initialRoute || 'artist'];
  const brand = document.querySelector('[data-site-brand]');
  if (branding && brand) {
    brand.href = branding.href;
    brand.setAttribute('aria-label', branding.label);
    const mark = renderIcon(branding.icon, icons);
    if (!mark) throw Error('Unregistered navigation wordmark');
    brand.replaceChildren(mark);
    brand.hidden = false;
  }
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const menuNavigation = document.querySelector('[data-menu-navigation]');
  if (!(toggle instanceof HTMLButtonElement) || !(menu instanceof HTMLElement) || !(menuNavigation instanceof HTMLElement)) return;

  const sections = [...(Array.isArray(ui.sections) ? ui.sections : [])];
  for (const item of Array.isArray(ui.menuLinks) ? ui.menuLinks : []) {
    const index = sections.findIndex(section => section.id === item.after);
    sections.splice(index < 0 ? sections.length : index + 1, 0, item);
  }

  menuNavigation.setAttribute('aria-label', ui.menuLabel);
  for (const section of sections) {
    const link = document.createElement('a');
    link.href = section.path;
    link.textContent = section.label;
    link.dataset.menuRoute = section.id;
    menuNavigation.append(link);
  }

  bindMenu({ openLabel: ui.menuToggle.open, closeLabel: ui.menuToggle.close, persistentHeader: Boolean(branding), selectors: {background:'main, [data-fragment="footer"]',menuControls:'[data-menu-theme]',drawerItems: '[data-site-brand]'} });
}
