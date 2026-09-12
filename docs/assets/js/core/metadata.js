/* ARTANDAVOODI · Search metadata and structured identity owner. */
export function applyMetadata(metadata) {
  document.title = metadata.title;
  setMeta('description', metadata.description);
  setMeta('keywords', metadata.keywords.join(', '));
  setMeta('og:title', metadata.title, 'property');
  setMeta('og:description', metadata.description, 'property');
  setMeta('og:url', metadata.url, 'property');
  setMeta('og:type', 'profile', 'property');

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = metadata.url;

  let structured = document.getElementById('site-structured-data');
  if (!structured) {
    structured = document.createElement('script');
    structured.id = 'site-structured-data';
    structured.type = 'application/ld+json';
    document.head.append(structured);
  }
  structured.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': metadata.siteType,
    name: metadata.creator.name,
    alternateName: metadata.creator.alternateName,
    url: metadata.creator.url,
    description: metadata.description,
    sameAs: metadata.sameAs,
  });
}

function setMeta(name, content, attribute = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.append(meta);
  }
  meta.content = content;
}
