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

/* Keep at least half a line of text together at the end of wrapped prose. */
(() => {
  const paragraphs = [...document.querySelectorAll(
    '.homepage .home-content p, .homepage .home-content li'
  )];
  if (!paragraphs.length) return;

  function protectEnding(element) {
    for (const tail of element.querySelectorAll('.paragraph-tail')) {
      tail.replaceWith(...tail.childNodes);
    }
    element.normalize();
    const style = getComputedStyle(element);
    const width = element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    const lines = new Map();
    let text = '';
    let node;
    while ((node = walker.nextNode())) {
      nodes.push({ node, start: text.length });
      text += node.textContent;
      for (const word of node.textContent.matchAll(/\S+/g)) {
        const range = document.createRange();
        range.setStart(node, word.index);
        range.setEnd(node, word.index + word[0].length);
        for (const rect of range.getClientRects()) {
          const key = Math.round(rect.top);
          const line = lines.get(key) || { left: rect.left, right: rect.right };
          line.left = Math.min(line.left, rect.left);
          line.right = Math.max(line.right, rect.right);
          lines.set(key, line);
        }
      }
    }
    const last = [...lines.entries()].sort((a, b) => a[0] - b[0]).at(-1)?.[1];
    if (lines.size < 2 || !last || last.right - last.left >= width / 2) return;

    const words = [...text.matchAll(/\S+/g)];
    const probe = document.createElement('span');
    probe.style.cssText = 'position:fixed;visibility:hidden;white-space:nowrap;text-wrap:nowrap;';
    element.append(probe);
    for (let i = words.length - 1; i >= 0; i--) {
      const offset = words[i].index;
      const start = nodes.findLast(item => item.start <= offset);
      const end = nodes.at(-1).node;
      const range = document.createRange();
      range.setStart(start.node, offset - start.start);
      range.setEnd(end, end.textContent.length);
      probe.replaceChildren(range.cloneContents());
      const length = probe.getBoundingClientRect().width;
      if (length < width / 2 + 1) continue;
      if (length <= width) {
        const tail = document.createElement('span');
        tail.className = 'paragraph-tail';
        tail.append(range.extractContents());
        range.insertNode(tail);
      }
      break;
    }
    probe.remove();
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      paragraphs.forEach(protectEnding);
    });
  }
  if ('ResizeObserver' in window) {
    const widths = new WeakMap();
    const observer = new ResizeObserver(entries => {
      let changed = false;
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (widths.get(entry.target) !== width) {
          widths.set(entry.target, width);
          changed = true;
        }
      }
      if (changed) schedule();
    });
    paragraphs.forEach(element => observer.observe(element));
  } else {
    window.addEventListener('resize', schedule);
  }
  document.fonts?.ready.then(schedule);
  schedule();
})();
