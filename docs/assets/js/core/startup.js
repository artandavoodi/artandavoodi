/* Pre-paint theme and bounded enhancement lifecycle; static HTML remains the fallback. */
(() => {
  const root = document.documentElement;
  try {
    const theme = localStorage.getItem('artandavoodi-theme') === 'dark' ? 'dark' : 'light';
    root.dataset.theme = theme;
    root.dataset.themeEffective = theme;
  } catch { /* The default light theme remains usable without storage. */ }
  root.dataset.loading = 'true';
  const finish = () => {
    delete root.dataset.loading;
    clearTimeout(timeout);
  };
  const timeout = setTimeout(finish, 8000);
  window.addEventListener('site:ready', finish, {once: true});
  window.addEventListener('pageshow', event => { if (event.persisted) finish(); });
})();
