/* ARTANDAVOODI · Navigation behavior and menu state owner. */
import { bindMenu } from '../../core/menu.js';
import { renderIcon } from './media.js?v=6';
export function bindNavigation(ui, icons) {
  const branding = ui.sectionBranding?.[document.documentElement.dataset.initialRoute];
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

  const sections = Array.isArray(ui.sections) ? ui.sections : [];

  menuNavigation.setAttribute('aria-label', ui.menuLabel);
  for (const section of sections) {
    const link = document.createElement('a');
    link.href = section.path;
    link.textContent = section.label;
    link.dataset.menuRoute = section.id;
    menuNavigation.append(link);
  }

  bindMenu({ openLabel: ui.menuToggle.open, closeLabel: ui.menuToggle.close, selectors: {background:'main, [data-fragment="footer"]',menuControls:'[data-menu-theme]'} });
}
