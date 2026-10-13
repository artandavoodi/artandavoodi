/* ARTANDAVOODI · Two-state theme with storage-tolerant continuity. */
export function initializeTheme() {
  let value = 'light';
  value = window.ArtanPreferences?.theme() || 'light';
  applyTheme(value);
}
function applyTheme(value) {
  document.documentElement.dataset.theme = value;
  document.documentElement.dataset.themeEffective = value;
  for (const image of document.querySelectorAll('img[data-light-src][data-dark-src]')) {
    image.src = value === 'dark' ? image.dataset.darkSrc : image.dataset.lightSrc;
  }
}
export function bindTheme(labels) {
  const button = document.querySelector('[data-theme-toggle]');
  if (!(button instanceof HTMLButtonElement)) return;
  const render = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    button.setAttribute('aria-label', dark ? labels.light : labels.dark);
    button.setAttribute('aria-pressed', String(dark));
  };
  button.addEventListener('click', () => {
    const value = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(value);
    window.ArtanPreferences?.saveTheme(value);
    render();
  });
  render();
}
