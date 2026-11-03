const sectionLinks = [...document.querySelectorAll(".contents a")];
const articleSections = [...document.querySelectorAll(".article section")];

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting);
    if (!visible.length) return;
    const currentId = visible[0].target.id;
    sectionLinks.forEach((link) => {
      if (link.hash === `#${currentId}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-10% 0px -65% 0px", threshold: 0 });
  articleSections.forEach((section) => observer.observe(section));
}

document.getElementById("copy-citation").addEventListener("click", async () => {
  const citation = document.getElementById("bibtex");
  const status = document.getElementById("copy-status");
  try {
    await navigator.clipboard.writeText(citation.textContent);
    status.textContent = "Copied.";
  } catch {
    const range = document.createRange();
    range.selectNodeContents(citation);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = "Citation selected. Press Ctrl+C or ⌘C to copy.";
  }
});
