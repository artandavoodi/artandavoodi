/* Session-scoped return context; unavailable storage must never block browsing. */
const key = 'artandavoodi-gallery-return';
export function rememberGallery(id) {
  try { sessionStorage.setItem(key, JSON.stringify({path:location.pathname,query:location.search,id,scroll:scrollY})); } catch { /* Storage is optional. */ }
}
export function returnContext() {
  try {
    const state = JSON.parse(sessionStorage.getItem(key));
    if (!state || !/^\/gallery\/(?:collections\/[a-z0-9-]+\/)?$/.test(state.path) || typeof state.query !== 'string' || (state.query && !state.query.startsWith('?')) || !/^[a-z0-9-]+$/.test(state.id) || !Number.isFinite(state.scroll) || state.scroll < 0) return null;
    return state;
  } catch { return null; }
}
export function restoreGallery() {
  const state = returnContext();
  if (!state || state.path !== location.pathname || state.query !== location.search) return;
  const tile = [...document.querySelectorAll('[data-gallery-photo-id]')].find(link => link.dataset.galleryPhotoId === state.id);
  if (!tile) return;
  tile.focus({preventScroll:true});
  window.scrollTo(0, state.scroll);
  try { sessionStorage.removeItem(key); } catch { /* Storage is optional. */ }
}
