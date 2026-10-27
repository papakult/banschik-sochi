(() => {
  const useFallback = (img) => {
    if (img.dataset.fallbackActive || !img.dataset.fallback) return;
    img.dataset.fallbackActive = 'true';
    img.src = img.dataset.fallback;
    img.alt = img.dataset.fallbackAlt || 'Художественная сцена';
    const parent = img.parentElement;
    if (parent && getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    const label = document.createElement('span');
    label.className = 'media-fallback-label';
    label.textContent = 'Художественная сцена';
    parent?.appendChild(label);
  };
  document.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', () => useFallback(img), { once: true });
    if (img.complete && !img.naturalWidth) useFallback(img);
  });
})();
