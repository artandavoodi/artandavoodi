/* ARTANDAVOODI · Public base URL and validated local data loading. */
export const siteBase = new URL('../../../', import.meta.url);
export function assetUrl(value) {
  const url = new URL(value, siteBase);
  if (!url.href.startsWith(siteBase.href) || url.origin !== siteBase.origin) {
    throw new Error('Asset path must stay within this public site.');
  }
  return url.href;
}
export async function loadJson(value) {
  const response = await fetch(assetUrl(value));
  if (!response.ok) throw new Error(`Unable to load ${value}: ${response.status}`);
  return response.json();
}
