/* ARTANDAVOODI · Navigation behavior and menu state owner. */
import { bindMenu } from '../../core/menu.js';
export function bindNavigation(ui) {
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

  bindMenu({ openLabel: ui.menuToggle.open, closeLabel: ui.menuToggle.close });
}
