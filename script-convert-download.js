async function convertToPdf() {
  const { PDFDocument, degrees } = PDFLib;
  if (uploadedImages.length === 0) {
    alert("Please upload at least one image!");
    return;
  }

  document.getElementById("loader-overlay").style.display = "flex";

  try {
    const pdfDoc = await PDFDocument.create();

    for (let img of uploadedImages) {
      const response = await fetch(img.src);
      const imgBytes = await response.arrayBuffer();
      const mimeMatch = img.src.match(/^data:(image\/[a-zA-Z]+);base64,/);

      const embeddedImg = mimeMatch && mimeMatch[1] === "image/png"
        ? await pdfDoc.embedPng(imgBytes)
        : await pdfDoc.embedJpg(imgBytes);

      const imgElem = img.element.querySelector("img");
      const rotation = parseInt(imgElem.getAttribute("data-rotation") || "0", 10) % 360;
      const imgW = embeddedImg.width;
      const imgH = embeddedImg.height;
      let page;

      switch (rotation) {
        case 0:
          page = pdfDoc.addPage([imgW, imgH]);
          page.drawImage(embeddedImg, { x: 0, y: 0, width: imgW, height: imgH });
          break;
        case 90:
          page = pdfDoc.addPage([imgH, imgW]);
          page.drawImage(embeddedImg, { x: 0, y: imgW, width: imgW, height: imgH, rotate: degrees(270) });
          break;
        case 180:
          page = pdfDoc.addPage([imgW, imgH]);
          page.drawImage(embeddedImg, { x: imgW, y: imgH, width: imgW, height: imgH, rotate: degrees(180) });
          break;
        case 270:
          page = pdfDoc.addPage([imgH, imgW]);
          page.drawImage(embeddedImg, { x: imgH, y: 0, width: imgW, height: imgH, rotate: degrees(90) });
          break;
      }
    }

    pdfBytes = await pdfDoc.save();
    document.getElementById("downloadBtn").style.display = "block";
  } catch (error) {
    console.error("PDF conversion failed:", error);
    alert("An error occurred while creating the PDF.");
  } finally {
    document.getElementById("loader-overlay").style.display = "none";
  }
}

function downloadPdf() {
  if (pdfBytes) {
    download(pdfBytes, "images.pdf", "application/pdf");
  } else {
    alert("No PDF to download!");
  }
}
