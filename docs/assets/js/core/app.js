/* ARTANDAVOODI · App entry: shared systems then site domain orchestration. */
import { mountFragments } from './fragments.js?v=9';
import { initializeTheme } from './theme.js?v=5';
import { initializeSite } from '../layers/site/site.js?v=18';
initializeTheme();
try {
  await mountFragments();
  await initializeSite();
  document.documentElement.dataset.appReady = 'true';
} catch (error) {
  document.documentElement.dataset.appReady = 'error';
  const status = document.querySelector('[data-error]');
  status.textContent = 'The website could not load. Please reload the page.';
  status.hidden = false;
  console.error('[artandavoodi]', error);
}
