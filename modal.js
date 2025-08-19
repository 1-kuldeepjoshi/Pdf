// modal.js
let currentZoom = 1;

export function initModal() {
  document.getElementById('modalClose').addEventListener('click', close);
  document.getElementById('modalZoomIn').addEventListener('click', zoomIn);
  document.getElementById('modalZoomOut').addEventListener('click', zoomOut);
  // also wire up “Preview” buttons via delegation
}

export function previewImage(src) {
  const modal = document.getElementById('previewModal');
  const img   = document.getElementById('previewModalImage');
  img.src = src;
  currentZoom = 1;
  img.style.transform = 'scale(1)';
  modal.style.display = 'flex';
}

function close() {
  document.getElementById('previewModal').style.display = 'none';
}

function zoomIn() {
  if (currentZoom < 3) currentZoom += 0.2;
  applyZoom();
}

function zoomOut() {
  if (currentZoom > 1) currentZoom -= 0.2;
  applyZoom();
}

function applyZoom() {
  const img = document.getElementById('previewModalImage');
  img.style.transform = `scale(${currentZoom})`;
  document.getElementById('modalZoomOut').style.display =
    currentZoom > 1 ? 'block' : 'none';
}
