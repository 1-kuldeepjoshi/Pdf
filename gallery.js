// gallery.js
import Sortable from 'sortablejs';
import { uploadedImages } from './upload.js';

export function initGallery() {
  const container = document.getElementById('uploadedImagesContainer');
  Sortable.create(container, { animation: 150, onEnd: updateImageOrder });
}

export function toggleActionButtons(targetImg) {
  hideAllActions();
  const wrapper    = targetImg.closest('.uploaded-image');
  const actionsDiv = wrapper.querySelector('.image-actions');
  actionsDiv.style.display = 'flex';
}

export function hideAllActions() {
  document.querySelectorAll('.image-actions')
          .forEach(div => div.style.display = 'none');
}

export function deleteImage(id) {
  const idx = uploadedImages.findIndex(img => img.id == id);
  if (idx > -1) {
    uploadedImages[idx].element.remove();
    uploadedImages.splice(idx, 1);
    updateImageOrder();
  }
}

export function updateImageOrder() {
  const container = document.getElementById('uploadedImagesContainer');
  const children  = Array.from(container.children);
  uploadedImages = children.map(ch =>
    uploadedImages.find(img => img.id == ch.getAttribute('data-id'))
  );
  children.forEach((ch, i) => {
    ch.querySelector('.uploaded-image-number').innerText = `#${i+1}`;
  });
}

export function rotateImage(imgElem) {
  let rot = (parseInt(imgElem.dataset.rotation||'0') + 90) % 360;
  imgElem.dataset.rotation = rot;
  imgElem.style.transform  = `rotate(${rot}deg)`;
  // swap container dims
  const cont = imgElem.parentElement;
  let ow = parseFloat(imgElem.dataset.origWidth),
      oh = parseFloat(imgElem.dataset.origHeight);
  if (rot===90||rot===270) cont.style.setProperty('width',  `${oh}px`),
                               cont.style.setProperty('height', `${ow}px`);
  else                    cont.style.setProperty('width',  `${ow}px`),
                               cont.style.setProperty('height', `${oh}px`);
}
