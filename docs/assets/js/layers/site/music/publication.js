/* Shared publication policy for browser previews and generated documents. */
export function newestReleases(items) {
  return [...(items || [])].sort((a, b) => {
    const dateA = Date.parse(a.releaseDate);
    const dateB = Date.parse(b.releaseDate);
    // Undated releases retain the explicitly confirmed catalog chronology.
    const difference = Number.isFinite(dateA) && Number.isFinite(dateB)
      ? dateB - dateA : (b.order || 0) - (a.order || 0);
    return difference || (b.order || 0) - (a.order || 0) || a.id.localeCompare(b.id);
  });
}

export function publishedValue(item, key) {
  return item.editorial?.[key] === 'draft' ? undefined : item[key];
}

export function metadataRows(item, fields, parent) {
  return (fields || []).flatMap(field => {
    const value = field.key === 'trackCount' ? item.tracks?.length : publishedValue(item, field.key);
    if (!value || (field.when && value !== field.when)) return [];
    if (parent && value === publishedValue(parent, field.key)) return [];
    return [{ label: field.label, value }];
  });
}

export function archiveAssets(tab) {
  return (tab.assets || []).filter(asset => asset.status !== 'draft');
}
