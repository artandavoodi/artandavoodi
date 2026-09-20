/* Shared publication policy for browser previews and generated documents. */
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
