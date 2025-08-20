import { state } from '.state.js';
import { deleteImage } from '.fileHandler.js';
import { editImage } from '.navigation.js';

export function toggleActionButtons(wrapper) {
  document.querySelectorAll('.image-actions').forEach(div => {
    div.style.display = 'none';
  });
  const actions = wrapper.querySelector('.image-actions');
  actions.style.display = actions.style.display === 'flex' ? 'none' : 'flex';
}

export function hideActionsOnClickOutside() {
  if (!event.target.closest('.uploaded-image')) {
    document.querySelectorAll('.image-actions').forEach(el => {
      el.style.display = 'none';
    });
  }
}

export function previewImage(src) {
  const modal = document.getElementById('previewModal');
  const modalImg = document.getElementById('previewModalImage');
  modalImg.src = src;
  state.currentZoomLevel = 1;
  modalImg.style.transform = 'scale(1)';
  modal.style.display = 'flex';
}

export function closePreviewModal() {
  document.getElementById('previewModal').style.display = 'none';
}

export function zoomIn() {
  if (state.currentZoomLevel < 3) {
    state.currentZoomLevel += 0.2;
    document
      .getElementById('previewModalImage')
      .style.transform = `scale(${state.currentZoomLevel})`;
  }
  if (state.currentZoomLevel > 1) {
    document.getElementById('modalZoomOut').style.display = 'block';
  }
}

export function zoomOut() {
  if (state.currentZoomLevel > 1) {
    state.currentZoomLevel = Math.max(1, state.currentZoomLevel - 0.2);
    document
      .getElementById('previewModalImage')
      .style.transform = `scale(${state.currentZoomLevel})`;
  }
  if (state.currentZoomLevel === 1) {
    document.getElementById('modalZoomOut').style.display = 'none';
  }
}

export function updateImageOrder() {
  const container = document.getElementById('uploadedImagesContainer');
  const items = Array.from(container.children);
  state.uploadedImages = items.map(child =>
    state.uploadedImages.find(img => img.id == child.dataset.id)
  );
  items.forEach((child, i) => {
    child.querySelector('.uploaded-image-number').innerText = `#${i + 1}`;
  });
}
