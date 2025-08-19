// gallery.js
import Sortable from 'sortablejs';
import { uploadedImages } from './upload.js';

export function initGallery() {
  const container = document.getElementById('uploadedImagesContainer');
  Sortable.create(container, { animation: 150, onEnd: updateImageOrder });

  document.addEventListener('click', hideAllActions);
}

export function toggleActionButtons(imgElem) {
  hideAllActions();
  const wrapper = imgElem.closest('.uploaded-image');
  wrapper.querySelector('.image-actions').style.display = 'flex';
}

export function hideAllActions() {
  document.querySelectorAll('.image-actions').forEach(div => {
    div.style.display = 'none';
  });
}

export function deleteImage(imageId) {
  // remove from DOM & uploadedImages array
  // then updateImageOrder()
}

export function updateImageOrder() {
  // resequence uploadedImages & relabel numbers
}
