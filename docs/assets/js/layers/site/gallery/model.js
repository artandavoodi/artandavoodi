/* Shared selection rules for the library and dedicated photo pages. */
export function selection(data, params) {
  const query = (params.get('q') || '').trim().toLocaleLowerCase();
  return data.items.filter(item =>
    (!params.get('collection') || item.collection === params.get('collection')) &&
    (!params.get('year') || String(item.year || 'undated') === params.get('year')) &&
    (!params.get('subject') || item.subjects?.includes(params.get('subject'))) &&
    (!query || [item.title, item.image.alt, ...(item.tags || [])].join(' ').toLocaleLowerCase().includes(query))
  );
}
export function photoUrl(item, params) {
  const query = params.toString();
  return `/gallery/${item.id}/${query ? `?${query}` : ''}`;
}
