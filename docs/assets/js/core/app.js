/* ARTANDAVOODI · App entry: shared systems then site domain orchestration. */
import { mountFragments } from './fragments.js?v=9';
import { initializeTheme } from './theme.js?v=5';
import { initializeSite } from '../layers/site/site.js?v=22';
initializeTheme();
try {
  await mountFragments();
  await initializeSite();
  await Promise.race([
    Promise.all([
      document.fonts.ready,
      ...[...document.querySelectorAll('main > [data-fragment]:not([hidden]) img')]
        .filter(image => image.getBoundingClientRect().top < innerHeight)
        .map(image => image.decode().catch(() => {})),
    ]),
    new Promise(resolve => setTimeout(resolve, 1500)),
  ]);
  document.documentElement.dataset.appReady = 'true';
} catch (error) {
  document.documentElement.dataset.appReady = 'error';
  const status = document.querySelector('[data-error]');
  status.textContent = 'The website could not load. Please reload the page.';
  status.hidden = false;
  console.error('[artandavoodi]', error);
} finally {
  window.dispatchEvent(new Event('site:ready'));
}
