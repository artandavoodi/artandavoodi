/* Shared music divider visibility; observe compact headings for tall releases. */
export function observeDividers(elements) {
  const targets = new Map(elements.map(element => [
    element.matches('.music-release') ? element.querySelector('.music-release__title') : element,
    element,
  ]));
  if (!('IntersectionObserver' in window)) {
    elements.forEach(element => { element.dataset.dividerVisible = 'true'; });
    return () => {};
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      targets.get(entry.target).dataset.dividerVisible = String(entry.isIntersecting);
    }
  }, { root: null, threshold: 0.42 });
  targets.forEach((element, target) => observer.observe(target));
  return () => observer.disconnect();
}
