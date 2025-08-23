<script>
  let imageNumber = 0;
  let uploadedImages = [];
  let pdfBytes = null;
  let currentZoomLevel = 1;

  // Handle file uploads and display images.
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

        const previewBtn = document.createElement("button");
        previewBtn.classList.add("action-btn");
        previewBtn.innerHTML =
          '<i class="fa fa-eye"></i><span class="btn-label">Preview</span>';
        previewBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          previewImage(imgElem);
        });

        const editBtn = document.createElement("button");
        editBtn.classList.add("action-btn");
        editBtn.innerHTML =
          '<i class="fa fa-pencil"></i><span class="btn-label">Edit</span>';
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          editImage(result.dataURL);
        });

        const rotateBtn = document.createElement("button");
        rotateBtn.classList.add("action-btn");
        rotateBtn.innerHTML =
          '<i class="fa fa-rotate-right"></i><span class="btn-label">Rotate</span>';
        rotateBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          rotateImage(imgElem);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("action-btn");
        deleteBtn.innerHTML =
          '<i class="fa fa-trash"></i><span class="btn-label">Delete</span>';
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteImage(imageWrapper.getAttribute("data-id"));
        });

        actionsDiv.appendChild(previewBtn);
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(rotateBtn);
        actionsDiv.appendChild(deleteBtn);
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

  // Toggle the display state of action buttons.
  function toggleActionButtons(imgElem) {
    document.querySelectorAll(".image-actions").forEach((div) => {
      div.style.display = "none";
    });
    const wrapper = imgElem.closest(".uploaded-image");
    const actionsDiv = wrapper.querySelector(".image-actions");
    actionsDiv.style.display =
      actionsDiv.style.display === "flex" ? "none" : "flex";
  }

  // Hide action buttons if click is outside an uploaded image.
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".uploaded-image")) {
      document.querySelectorAll(".image-actions").forEach((el) => {
        el.style.display = "none";
      });
    }
  });

  // Redirect to edit.html with the image data.
  function editImage(dataURL) {
    window.location.href = "edit.html?img=" + encodeURIComponent(dataURL);
  }

  // Convert uploaded images to PDF while applying rotation.
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
        const rotation = parseInt(
          imgElem.getAttribute("data-rotation") || "0",
          10
        ) % 360;

        let page;
        let imgWidth = embeddedImg.width;
        let imgHeight = embeddedImg.height;

        switch (rotation) {
          case 0:
            page = pdfDoc.addPage([imgWidth, imgHeight]);
            page.drawImage(embeddedImg, {
              x: 0,
              y: 0,
              width: imgWidth,
              height: imgHeight,
            });
            break;
          case 90:
            page = pdfDoc.addPage([imgHeight, imgWidth]);
            page.drawImage(embeddedImg, {
              x: 0,
              y: imgWidth,
              width: imgWidth,
              height: imgHeight,
              rotate: degrees(270),
            });
            break;
          case 180:
            page = pdfDoc.addPage([imgWidth, imgHeight]);
            page.drawImage(embeddedImg, {
              x: imgWidth,
              y: imgHeight,
              width: imgWidth,
              height: imgHeight,
              rotate: degrees(180),
            });
            break;
          case 270:
            page = pdfDoc.addPage([imgHeight, imgWidth]);
            page.drawImage(embeddedImg, {
              x: imgHeight,
              y: 0,
              width: imgWidth,
              height: imgHeight,
              rotate: degrees(90),
            });
            break;
          default:
            page = pdfDoc.addPage([imgWidth, imgHeight]);
            page.drawImage(embeddedImg, {
              x: 0,
              y: 0,
              width: imgWidth,
              height: imgHeight,
            });
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

  // Trigger PDF download.
  function downloadPdf() {
    if (pdfBytes) {
      download(pdfBytes, "images.pdf", "application/pdf");
    } else {
      alert("No PDF to download!");
    }
  }

  // Rotate the image element (visual rotation only) and update its container dimensions.
  function rotateImage(imgElem) {
    let currentRotation = parseInt(
      imgElem.getAttribute("data-rotation") || "0",
      10
    );
    currentRotation = (currentRotation + 90) % 360;
    imgElem.style.transform = "rotate(" + currentRotation + "deg)";
    imgElem.setAttribute("data-rotation", currentRotation);
    const imageContainer = imgElem.parentElement;
    let origWidth =
      parseFloat(imgElem.dataset.origWidth) ||
      parseFloat(window.getComputedStyle(imgElem).width);
    let origHeight =
      parseFloat(imgElem.dataset.origHeight) ||
      parseFloat(window.getComputedStyle(imgElem).height);
    if (currentRotation === 90 || currentRotation === 270) {
      imageContainer.style.width = origHeight + "px";
      imageContainer.style.height = origWidth + "px";
    } else {
      imageContainer.style.width = origWidth + "px";
      imageContainer.style.height = origHeight + "px";
    }
  }

  // Remove image from the list and update order.
  function deleteImage(imageId) {
    const index = uploadedImages.findIndex((img) => img.id == imageId);
    if (index !== -1) {
      uploadedImages[index].element.remove();
      uploadedImages.splice(index, 1);
      updateImageOrder();
    }
  }

  // Preview the selected image in the modal with updated (larger) layout.
  function previewImage(imgElem) {
    const modal = document.getElementById("previewModal");
    const modalImg = document.getElementById("previewModalImage");
    modalImg.src = imgElem.src;
    currentZoomLevel = 1;
    modalImg.style.transform = "scale(1)";
    modal.style.display = "flex";
  }

  // Close the preview modal.
  function closePreviewModal() {
    document.getElementById("previewModal").style.display = "none";
  }

  // Incrementally zoom in the previewed image.
  function zoomIn() {
    if (currentZoomLevel < 3) {
      currentZoomLevel += 0.2;
      document.getElementById("previewModalImage").style.transform =
        "scale(" + currentZoomLevel + ")";
    }
    if (currentZoomLevel > 1) {
      document.getElementById("modalZoomOut").style.display = "block";
    }
  }

  // Incrementally zoom out the previewed image.
  function zoomOut() {
    if (currentZoomLevel > 1) {
      currentZoomLevel -= 0.2;
      if (currentZoomLevel < 1) currentZoomLevel = 1;
      document.getElementById("previewModalImage").style.transform =
        "scale(" + currentZoomLevel + ")";
    }
    if (currentZoomLevel === 1) {
      document.getElementById("modalZoomOut").style.display = "none";
    }
  }

  // Update image numbers based on the current DOM order.
  function updateImageOrder() {
    const container = document.getElementById("uploadedImagesContainer");
    const children = Array.from(container.children);
    uploadedImages = children.map((child) =>
      uploadedImages.find((img) => img.id == child.getAttribute("data-id"))
    );
    children.forEach((child, index) => {
      const numberElem = child.querySelector(".uploaded-image-number");
      if (numberElem) {
        numberElem.innerText = `#${index + 1}`;
      }
    });
  }

  // Initialize SortableJS for drag-and-drop functionality and add modal button events after the DOM loads.
  document.addEventListener("DOMContentLoaded", function () {
    const uploadedImagesContainer = document.getElementById("uploadedImagesContainer");
    Sortable.create(uploadedImagesContainer, {
      animation: 150,
      onEnd: updateImageOrder,
    });

    document.getElementById("modalClose").addEventListener("click", closePreviewModal);
    document.getElementById("modalEdit").addEventListener("click", function () {
      editImage(document.getElementById("previewModalImage").src);
    });
    document.getElementById("modalZoomIn").addEventListener("click", zoomIn);
    document.getElementById("modalZoomOut").addEventListener("click", zoomOut);
  });
</script>
