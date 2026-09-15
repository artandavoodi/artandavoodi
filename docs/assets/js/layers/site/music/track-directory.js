/* Derived track directory: parent releases remain the source of category and album. */
export function collectTracks(releases) {
  return releases.flatMap(release => release.tracks?.length
    ? [...release.tracks].sort((a, b) => a.position - b.position).map(track => ({ release, track }))
    : release.category === 'singles' ? [{ release, track: release }] : []);
}

export function renderTrackDirectory(records, ui, icons, renderLinks) {
  const list = document.createElement('ul');
  list.className = 'music-track-directory';
  list.setAttribute('aria-label', ui.musicTrackListLabel);
  for (const { release, track } of records) {
    const row = document.createElement('li');
    row.className = 'music-track-directory__row';
    const title = document.createElement('a');
    title.href = `/music/${release.id}/${track !== release ? `#track-${track.id}` : ''}`;
    title.className = 'music-release__title-link';
    title.textContent = track.title;
    title.dataset.releaseReadMore = release.id;
    if (track !== release) title.dataset.trackId = track.id;
    const context = document.createElement('span');
    context.className = 'music-track-directory__context';
    context.textContent = track === release ? release.type : `${release.type} · ${release.title}`;
    const duration = document.createElement('span');
    duration.className = 'music-track-directory__duration';
    duration.textContent = track.duration || ui.musicDurationPending;
    row.append(title, duration, context);
    if (track.links?.length) row.append(renderLinks(track, icons));
    list.append(row);
  }
  return list;
}
