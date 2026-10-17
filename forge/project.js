const copyButton = document.getElementById('copy-bibtex');
copyButton.addEventListener('click', async () => {
  const citation = document.getElementById('bibtex-code');
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(citation.textContent);
    copyButton.textContent = 'Copied!';
    status.textContent = 'BibTeX copied to clipboard.';
    setTimeout(() => { copyButton.textContent = 'Copy'; status.textContent = ''; }, 2500);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(citation);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    status.textContent = 'Citation selected. Press Ctrl+C or ⌘C to copy.';
  }
});
