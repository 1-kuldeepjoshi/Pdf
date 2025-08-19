// main.js
import { handleFileUpload } from '.upload.js';
import { initGallery, toggleActionButtons } from '.gallery.js';
import { initModal, previewImage } from '.modal.js';
import { convertToPdf, downloadPdf } from '.pdfConverter.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Wire the upload input
  document.getElementById('upload-file')
    .addEventListener('change', handleFileUpload);

  // 2. Show Convert button once images are loaded
  document.addEventListener('imagesReady', () => {
    document.getElementById('convertBtn').style.display = 'block';
  });

  // 3. Hook Convert & Download
  document.getElementById('convertBtn')
    .addEventListener('click', convertToPdf);
  document.getElementById('downloadBtn')
    .addEventListener('click', downloadPdf);

  // 4. Initialize gallery sorting & modal logic
  initGallery();
  initModal();

  // 5. Delegate clicks for showing action buttons & preview
  document.getElementById('uploadedImagesContainer')
    .addEventListener('click', (e) => {
      if (e.target.tagName === 'IMG' && e.target.closest('.uploaded-image')) {
        toggleActionButtons(e.target);
      }
      if (e.target.closest('.action-btn')?.querySelector('.fa-eye')) {
        previewImage(
          e.target.closest('.uploaded-image').querySelector('img').src
        );
      }
    });
});
