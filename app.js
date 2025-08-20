import { state } from './state.js';
import { handleFileUpload, deleteImage } from '.fileHandler.js';
import {
  toggleActionButtons,
  hideActionsOnClickOutside,
  previewImage,
  closePreviewModal,
  zoomIn,
  zoomOut,
  updateImageOrder,
} from '.uiActions.js';
import { editImage } from '.navigation.js';
import { convertToPdf, downloadPdf } from '.pdfConverter.js';

window.addEventListener('DOMContentLoaded', () => {
  // File input
  document
    .getElementById('upload-file')
    .addEventListener('change', handleFileUpload);

  // “Add more” button
  document
    .querySelector('.add-image-btn')
    .addEventListener('click', () => document.getElementById('upload-file').click());

  // Convert & Download
  document
    .getElementById('convertBtn')
    .addEventListener('click', convertToPdf);
  document
    .getElementById('downloadBtn')
    .addEventListener('click', downloadPdf);

  // Global click
  document.addEventListener('click', hideActionsOnClickOutside);

  // Sortable
  const gallery = document.getElementById('uploadedImagesContainer');
  Sortable.create(gallery, {
    animation: 150,
    onEnd: updateImageOrder,
  });

  // Preview modal controls
  document
    .getElementById('modalClose')
    .addEventListener('click', closePreviewModal);
  document
    .getElementById('modalEdit')
    .addEventListener('click', () =>
      editImage(document.getElementById('previewModalImage').src)
    );
  document
    .getElementById('modalZoomIn')
    .addEventListener('click', zoomIn);
  document
    .getElementById('modalZoomOut')
    .addEventListener('click', zoomOut);

  // Delegate image-wrapper click to toggle action buttons & preview/edit/delete/rotate
  gallery.addEventListener('click', e => {
    const wrapper = e.target.closest('.uploaded-image');
    if (!wrapper) return;

    // Show/hide actions
    toggleActionButtons(wrapper);

    // If click on a specific action button, handle it
    const btn = e.target.closest('.action-btn');
    if (!btn) return;

    const imgEl = wrapper.querySelector('img');
    if (btn.querySelector('.fa-eye')) previewImage(imgEl.src);
    if (btn.querySelector('.fa-pencil')) editImage(imgEl.src);
    if (btn.querySelector('.fa-rotate-right')) {
      const currentRotation = (parseInt(imgEl.dataset.rotation) + 90) % 360;
      imgEl.style.transform = `rotate(${currentRotation}deg)`;
      imgEl.dataset.rotation = currentRotation;
      // adjust container
      const ctn = imgEl.parentElement;
      const ow = parseFloat(imgEl.dataset.origWidth);
      const oh = parseFloat(imgEl.dataset.origHeight);
      if (currentRotation === 90 || currentRotation === 270) {
        ctn.style.width = `${oh}px`;
        ctn.style.height = `${ow}px`;
      } else {
        ctn.style.width = `${ow}px`;
        ctn.style.height = `${oh}px`;
      }
    }
    if (btn.querySelector('.fa-trash')) deleteImage(wrapper.dataset.id);
  });
});
