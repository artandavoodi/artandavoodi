/* ARTANDAVOODI · Hash destinations own visibility, history and page metadata. */
import { applyMetadata } from '../../core/metadata.js?v=2';
export function bindRoutes(ui, metadata) {
  const update = () => {
    const requested = location.hash.slice(1) || document.documentElement.dataset.initialRoute || 'artist';
    const route = ui.sections.find(item => item.id === requested) || ui.sections[0];
    for (const section of document.querySelectorAll('main > [data-fragment]')) {
      section.hidden = section.dataset.fragment !== route.id;
    }
    for (const link of document.querySelectorAll('[data-menu-route]')) {
      if (link.dataset.menuRoute === route.id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    applyMetadata({ ...metadata, ...metadata.pages?.[route.id] });
    document.documentElement.dataset.route = route.id;
    window.scrollTo(0, 0);
  };
  window.addEventListener('hashchange', update);
  update();
}
