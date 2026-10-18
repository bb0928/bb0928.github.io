(() => {
  const grid = document.querySelector('.homepage .project-grid');
  if (!grid || !('ResizeObserver' in window)) return;

  const cards = Array.from(grid.children);
  let pending = false;

  function layout() {
    pending = false;
    const style = getComputedStyle(grid);
    const columns = Number(style.getPropertyValue('--project-columns')) || 1;
    if (columns === 1) {
      grid.removeAttribute('data-masonry-ready');
      grid.style.removeProperty('height');
      return;
    }

    const gap = parseFloat(style.getPropertyValue('--project-gap')) || 16;
    const width = (grid.clientWidth - gap * (columns - 1)) / columns;
    grid.style.setProperty('--project-width', `${width}px`);
    grid.setAttribute('data-masonry-ready', '');
    const heights = Array(columns).fill(0);

    for (const card of cards) {
      const column = heights.indexOf(Math.min(...heights));
      card.style.setProperty('--project-x', `${column * (width + gap)}px`);
      card.style.setProperty('--project-y', `${heights[column]}px`);
      heights[column] += card.getBoundingClientRect().height + gap;
    }
    grid.style.height = `${Math.max(...heights) - gap}px`;
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(layout);
  }

  const observer = new ResizeObserver(schedule);
  observer.observe(grid);
  cards.forEach(card => observer.observe(card));
  layout();
})();
