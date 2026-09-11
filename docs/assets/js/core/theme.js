/* ARTANDAVOODI · Two-state theme with storage-tolerant continuity. */
const key = 'artandavoodi-theme';
export function initializeTheme() {
  let value = 'light';
  try { if (localStorage.getItem(key) === 'dark') value = 'dark'; } catch { /* Storage is optional. */ }
  applyTheme(value);
}
function applyTheme(value) {
  document.documentElement.dataset.theme = value;
  document.documentElement.dataset.themeEffective = value;
}
export function bindTheme(labels) {
  const button = document.querySelector('[data-theme-toggle]');
  const render = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    button.textContent = dark ? labels.light : labels.dark;
    button.setAttribute('aria-pressed', String(dark));
  };
  button.addEventListener('click', () => {
    const value = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(value);
    try { localStorage.setItem(key, value); } catch { /* Theme remains usable without storage. */ }
    render();
  });
  render();
}
