// pdfConverter.js
import { uploadedImages } from './upload.js';
import { PDFDocument, degrees } from 'https://unpkg.com/pdf-lib@1.4.0?module';
import download from 'https://unpkg.com/downloadjs@1.4.7?module';

let pdfBytes = null;

export async function convertToPdf() {
  if (!uploadedImages.length) {
    return alert('Upload at least one image!');
  }
  toggleLoader(true);

  const pdfDoc = await PDFDocument.create();
  for (let img of uploadedImages) {
    await addPageWithImage(pdfDoc, img);
  }
  pdfBytes = await pdfDoc.save();
  document.getElementById('downloadBtn').style.display = 'block';
  toggleLoader(false);
}

export function downloadPdf() {
  if (!pdfBytes) return alert('No PDF ready!');
  download(pdfBytes, 'images.pdf', 'application/pdf');
}

function toggleLoader(show) {
  document.getElementById('loader-overlay').style.display = show ? 'flex' : 'none';
}

async function addPageWithImage(pdfDoc, { src, element }) {
  // fetch src, embed PNG/JPG, read rotation from element…
  // switch-case rotation, addPage & drawImage as before
}
