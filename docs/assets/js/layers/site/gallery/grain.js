/* Pixel/tile algorithm and JSON settings match Artan Records' artist-grain.js.
   Gallery ownership changes only the bounds and adds explicit lifecycle cleanup. */
export function bindGalleryGrain(canvas, grain) {
  if (!canvas || !grain) return;
  const context = canvas.getContext('2d');
  const tile = document.createElement('canvas');
  tile.width = tile.height = grain.tileSize;
  const tileContext = tile.getContext('2d');
  if (!context || !tileContext) return;
  canvas.style.setProperty('--gallery-grain-opacity', grain.opacity);
  const pixels = tileContext.createImageData(tile.width, tile.height);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let timer;
  function paint() {
    for (let i = 0; i < pixels.data.length; i += 4) {
      const value = Math.random() < 0.5 ? 0 : 255;
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
      pixels.data[i + 3] = 255;
    }
    tileContext.putImageData(pixels, 0, 0);
    context.fillStyle = context.createPattern(tile, 'repeat');
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  function schedule() {
    clearTimeout(timer);
    if (!visible || document.hidden || motion.matches) return;
    timer = setTimeout(() => { paint(); schedule(); }, 1000 / grain.framesPerSecond);
  }
  const resize = new ResizeObserver(() => {
    const bounds = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(bounds.width));
    canvas.height = Math.max(1, Math.round(bounds.height));
    paint();
  });
  resize.observe(canvas.parentElement);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  });
  intersection.observe(canvas);
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', schedule);
  return () => {
    clearTimeout(timer);
    resize.disconnect();
    intersection.disconnect();
    document.removeEventListener('visibilitychange', schedule);
    motion.removeEventListener('change', schedule);
  };
}
