/* ARTANDAVOODI · Shared icon back-link binding; interface JSON owns destination and label. */
import { assetUrl } from '../../core/data.js';
import { renderIcon } from './media.js';
export function bindBackLink(target, config, icons) {
  const icon = renderIcon(config.icon, icons);
  if (!icon) throw new Error(`Missing back-link icon: ${config.icon}`);
  target.classList.add('site-back-link');
  target.href = assetUrl(config.href);
  target.setAttribute('aria-label', config.label);
  target.title = config.label;
  icon.setAttribute('aria-hidden', 'true');
  target.replaceChildren(icon);
}
