// main.js
import { handleFileUpload }  from '.upload.js';
import { initGallery, toggleActionButtons, deleteImage, rotateImage } from '.gallery.js';
import { initModal, previewImage } from '.modal.js';
import { convertToPdf, downloadPdf } from '.pdfConverter.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. File input & Add More
  const fileInput = document.getElementById('upload-file');
  fileInput.addEventListener('change', handleFileUpload);
  document.getElementById('addImageBtnContainer')
          .addEventListener('click', () => fileInput.click());

  // 2. Convert & Download
  document.addEventListener('imagesReady', () => {
    document.getElementById('convertBtn').style.display = 'block';
  });
  document.getElementById('convertBtn')
          .addEventListener('click', convertToPdf);
  document.getElementById('downloadBtn')
          .addEventListener('click', downloadPdf);

  // 3. Gallery sorting
  initGallery();

  // 4. Modal
  initModal();

  // 5. Delegate image‐action clicks
  document.getElementById('uploadedImagesContainer')
          .addEventListener('click', e => {
    const target = e.target;
    const wrapper = target.closest('.uploaded-image');
    if (!wrapper) return;

    // toggle the action buttons
    if (target.tagName === 'IMG') {
      toggleActionButtons(target);
    }

    // detect which action was clicked
    if (target.closest('.action-btn')) {
      e.stopPropagation();
      const btn = target.closest('.action-btn');
      const imgElem = wrapper.querySelector('img');
      const id = wrapper.getAttribute('data-id');

      if (btn.querySelector('.fa-eye'))     previewImage(imgElem.src);
      else if (btn.querySelector('.fa-trash')) deleteImage(id);
      else if (btn.querySelector('.fa-rotate-right')) rotateImage(imgElem);
      else if (btn.querySelector('.fa-pencil')) {
        window.location.href = 'edit.html?img=' + encodeURIComponent(imgElem.src);
      }
    }
  });
});
