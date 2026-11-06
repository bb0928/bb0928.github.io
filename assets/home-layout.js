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

/* Balance the complete paragraph without forcing its ending onto a new line. */
(() => {
  const paragraphs = [...document.querySelectorAll('.homepage .home-content p, .homepage .home-content li')];
  let pending = false;
  function balance() {
    pending = false;
    for (const paragraph of paragraphs) {
      paragraph.style.removeProperty('max-inline-size');
      const width = paragraph.getBoundingClientRect().width;
      const height = paragraph.getBoundingClientRect().height;
      const lineHeight = parseFloat(getComputedStyle(paragraph).lineHeight);
      if (height < lineHeight * 1.5) continue;
      let low = width / 2;
      let high = width;
      // Find the narrowest measure that preserves the original line count.
      for (let i = 0; i < 11; i++) {
        const middle = (low + high) / 2;
        paragraph.style.maxInlineSize = `${middle}px`;
        if (paragraph.getBoundingClientRect().height > height + 0.5) low = middle;
        else high = middle;
      }
      paragraph.style.maxInlineSize = `${Math.ceil(high)}px`;
    }
  }
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(balance);
  }
  if ('ResizeObserver' in window) {
    const widths = new WeakMap();
    const observer = new ResizeObserver(entries => {
      let changed = false;
      for (const entry of entries) {
        if (widths.get(entry.target) !== entry.contentRect.width) {
          widths.set(entry.target, entry.contentRect.width);
          changed = true;
        }
      }
      if (changed) schedule();
    });
    new Set(paragraphs.map(paragraph => paragraph.parentElement)).forEach(parent => observer.observe(parent));
  } else window.addEventListener('resize', schedule);
  document.fonts?.ready.then(schedule);
  schedule();
})();
