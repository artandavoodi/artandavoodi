/* One data-owned presentation for the crawlable page and browser enhancement. */
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

export function contextMarkup(data, icons, theme = 'light') {
  return data.sections.filter(record => record.publish !== false && (record.description || record.link || record.groups?.some(group => group.items?.length))).map(record => {
    let brand = '';
    if (record.link) {
      const url = new URL(record.link.url);
      if (url.protocol !== 'https:' || url.username || url.password) throw Error('Invalid label URL');
      const icon = icons.items.find(item => item.id === record.link.icon);
      if (!icon) throw Error('Unregistered label mark');
      brand = `<a class="music-context__brand" href="${escape(url.href)}" aria-label="${escape(record.link.label)}"><img src="/${escape(theme === 'dark' && icon.darkSrc ? icon.darkSrc : icon.src)}"${icon.darkSrc ? ` data-light-src="/${escape(icon.src)}" data-dark-src="/${escape(icon.darkSrc)}"` : ''} alt="${escape(icon.alt)}" decoding="async"></a>`;
    }
    const facts = (record.groups || []).filter(group => group.items?.length).map(group => `<div><dt>${escape(group.title)}</dt><dd>${group.items.map(item => escape(item.title)).join(' · ')}</dd></div>`).join('');
    return `<section class="music-context__section"><h3>${escape(record.title)}</h3>${brand}${record.description ? `<p>${escape(record.description)}</p>` : ''}${facts ? `<dl class="music-context__facts">${facts}</dl>` : ''}</section>`;
  }).join('');
}
