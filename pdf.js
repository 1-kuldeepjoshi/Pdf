let imageNumber = 0;
let uploadedImages = [];
let pdfBytes = null;
let currentZoomLevel = 1;

// Handle file uploads and display images
function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  const uploadedImagesContainer = document.getElementById("uploadedImagesContainer");
  const uploadContainer = document.getElementById("uploadContainer");
  const addImageBtnContainer = document.getElementById("addImageBtnContainer");
  const descriptionContainer = document.querySelector(".description-container");

  uploadContainer.style.display = "none";
  descriptionContainer.style.display = "none";
  uploadedImagesContainer.style.display = "flex";
  addImageBtnContainer.style.display = "flex";

  const fileReadPromises = files.map((file, index) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        resolve({ file, dataURL: e.target.result, index });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });

  Promise.all(fileReadPromises).then((results) => {
    results.sort((a, b) => a.index - b.index);
    results.forEach((result) => {
      imageNumber++;
      const imageWrapper = document.createElement("div");
      imageWrapper.classList.add("uploaded-image");
      imageWrapper.setAttribute("data-id", imageNumber);

      const imageNumberElem = document.createElement("div");
      imageNumberElem.classList.add("uploaded-image-number");
      imageNumberElem.innerText = `#${imageNumber}`;

      const imageContainer = document.createElement("div");
      imageContainer.classList.add("image-container");

      const imgElem = document.createElement("img");
      imgElem.src = result.dataURL;
      imgElem.setAttribute("data-rotation", "0");

      imgElem.onload = function () {
        const compStyle = window.getComputedStyle(imgElem);
        imgElem.dataset.origWidth = compStyle.width;
        imgElem.dataset.origHeight = compStyle.height;
        imageContainer.style.width = compStyle.width;
        imageContainer.style.height = compStyle.height;
      };

      imgElem.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleActionButtons(imgElem);
      });

      imageContainer.appendChild(imgElem);

      const nameElem = document.createElement("div");
      nameElem.classList.add("uploaded-image-name");
      nameElem.innerText = result.file.name;

      imageWrapper.appendChild(imageNumberElem);
      imageWrapper.appendChild(imageContainer);
      imageWrapper.appendChild(nameElem);

      const actionsDiv = document.createElement("div");
      actionsDiv.classList.add("image-actions");

      // Action buttons are created in action.js (Preview, Edit, Rotate, Delete)
      imageWrapper.appendChild(actionsDiv);

      uploadedImagesContainer.appendChild(imageWrapper);
      uploadedImages.push({
        id: imageNumber,
        src: result.dataURL,
        element: imageWrapper,
      });
    });
    document.getElementById("convertBtn").style.display = "block";
  });
}

// Toggle the display state of action buttons
function toggleActionButtons(imgElem) {
  document.querySelectorAll(".image-actions").forEach((div) => {
    div.style.display = "none";
  });
  const wrapper = imgElem.closest(".uploaded-image");
  const actionsDiv = wrapper.querySelector(".image-actions");
  actionsDiv.style.display =
    actionsDiv.style.display === "flex" ? "none" : "flex";
}

// Convert uploaded images to PDF
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

      let embeddedImg;
      if (mimeMatch && mimeMatch[1] === "image/png") {
        embeddedImg = await pdfDoc.embedPng(imgBytes);
      } else {
        embeddedImg = await pdfDoc.embedJpg(imgBytes);
      }

      const imgElem = img.element.querySelector("img");
      const rotation = parseInt(imgElem.getAttribute("data-rotation") || "0", 10) % 360;

      let page;
      let imgWidth = embeddedImg.width;
      let imgHeight = embeddedImg.height;

      switch (rotation) {
        case 0:
          page = pdfDoc.addPage([imgWidth, imgHeight]);
          page.drawImage(embeddedImg, { x: 0, y: 0, width: imgWidth, height: imgHeight });
          break;
        case 90:
          page = pdfDoc.addPage([imgHeight, imgWidth]);
          page.drawImage(embeddedImg, { x: 0, y: imgWidth, width: imgWidth, height: imgHeight, rotate: degrees(270) });
          break;
        case 180:
          page = pdfDoc.addPage([imgWidth, imgHeight]);
          page.drawImage(embeddedImg, { x: imgWidth, y: imgHeight, width: imgWidth, height: imgHeight, rotate: degrees(180) });
          break;
        case 270:
          page = pdfDoc.addPage([imgHeight, imgWidth]);
          page.drawImage(embeddedImg, { x: imgHeight, y: 0, width: imgWidth, height: imgHeight, rotate: degrees(90) });
          break;
        default:
          page = pdfDoc.addPage([imgWidth, imgHeight]);
          page.drawImage(embeddedImg, { x: 0, y: 0, width: imgWidth, height: imgHeight });
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

// Download PDF
function downloadPdf() {
  if (pdfBytes) {
    download(pdfBytes, "images.pdf", "application/pdf");
  } else {
    alert("No PDF to download!");
  }
}

// Initialize SortableJS
document.addEventListener("DOMContentLoaded", function () {
  const uploadedImagesContainer = document.getElementById("uploadedImagesContainer");
  Sortable.create(uploadedImagesContainer, {
    animation: 150,
    onEnd: updateImageOrder,
  });
});
