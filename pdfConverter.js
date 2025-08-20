import { state } from '.state.js';

export async function convertToPdf() {
  const { PDFDocument, degrees } = PDFLib;
  if (!state.uploadedImages.length) {
    alert('Please upload at least one image!');
    return;
  }

  document.getElementById('loader-overlay').style.display = 'flex';

  try {
    const pdfDoc = await PDFDocument.create();

    for (const img of state.uploadedImages) {
      const response = await fetch(img.src);
      const bytes = await response.arrayBuffer();
      const mime = img.src.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1];
      const embedded =
        mime === 'image/png'
          ? await pdfDoc.embedPng(bytes)
          : await pdfDoc.embedJpg(bytes);

      const imgEl = img.element.querySelector('img');
      const rot = (parseInt(imgEl.dataset.rotation, 10) || 0) % 360;
      let page, w = embedded.width, h = embedded.height;

      switch (rot) {
        case 90:
          page = pdfDoc.addPage([h, w]);
          page.drawImage(embedded, { x: 0, y: w, width: w, height: h, rotate: degrees(270) });
          break;
        case 180:
          page = pdfDoc.addPage([w, h]);
          page.drawImage(embedded, { x: w, y: h, width: w, height: h, rotate: degrees(180) });
          break;
        case 270:
          page = pdfDoc.addPage([h, w]);
          page.drawImage(embedded, { x: h, y: 0, width: w, height: h, rotate: degrees(90) });
          break;
        default:
          page = pdfDoc.addPage([w, h]);
          page.drawImage(embedded, { x: 0, y: 0, width: w, height: h });
      }
    }

    state.pdfBytes = await pdfDoc.save();
    document.getElementById('downloadBtn').style.display = 'block';
  } catch (err) {
    console.error('PDF conversion failed:', err);
    alert('An error occurred while creating the PDF.');
  } finally {
    document.getElementById('loader-overlay').style.display = 'none';
  }
}

export function downloadPdf() {
  if (state.pdfBytes) {
    download(state.pdfBytes, 'images.pdf', 'application/pdf');
  } else {
    alert('No PDF to download!');
  }
}
