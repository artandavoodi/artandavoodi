/* ARTANDAVOODI · Album track list and track-to-release context. */
export function renderTracks(album, ui) {
  const list = document.createElement('ol');
  list.className = 'music-tracks';
  list.hidden = true;
  list.setAttribute('aria-label', ui.musicTrackListLabel);
  for (const track of [...(album.tracks || [])].sort((a, b) => a.position - b.position)) {
    const row = document.createElement('li');
    const button = document.createElement('a');
    button.href = `/music/${album.id}/#track-${track.id}`;
    button.className = 'music-tracks__link';
    button.dataset.releaseReadMore = album.id;
    button.dataset.trackId = track.id;
    for (const value of [track.position, track.title, track.duration || ui.musicDurationPending]) {
      const span = document.createElement('span');
      span.textContent = value;
      button.append(span);
    }
    row.append(button);
    list.append(row);
  }
  return list;
}

export function trackContext(album, track) {
  return {
    artist: album.artist, cover: album.cover, albumTitle: album.title,
    format: album.format, genre: album.genre, label: album.label,
    releaseDate: album.releaseDate, status: album.status,
    ...track,
  };
}
