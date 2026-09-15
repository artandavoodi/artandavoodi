/* ARTANDAVOODI · Navigation behavior and menu state owner. */
export function bindNavigation(ui) {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const menuNavigation = document.querySelector('[data-menu-navigation]');
  if (!(toggle instanceof HTMLButtonElement) || !(menu instanceof HTMLElement) || !(menuNavigation instanceof HTMLElement)) return;

  const sections = Array.isArray(ui.sections) ? ui.sections : [];

  menuNavigation.setAttribute('aria-label', ui.menuLabel);
  for (const section of sections) {
    const link = document.createElement('a');
    link.href = section.id === 'music' ? '/music/' : `#${section.id}`;
    link.textContent = section.label;
    link.dataset.menuRoute = section.id;
    menuNavigation.append(link);
  }

  const setOpen = (isOpen) => {
    menu.hidden = !isOpen;
    menu.setAttribute('aria-hidden', String(!isOpen));
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? ui.menuToggle.close : ui.menuToggle.open);
    document.documentElement.toggleAttribute('data-menu-open', isOpen);
    document.body.toggleAttribute('data-menu-locked', isOpen);
  };

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-menu-toggle]') : null;
    if (target !== toggle) return;
    event.preventDefault();
    setOpen(menu.hidden);
  });
  menuNavigation.addEventListener('click', event => {
    const link = event.target.closest('[data-menu-route="music"]');
    if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      location.hash = 'music';
    }
    setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  setOpen(false);
}
