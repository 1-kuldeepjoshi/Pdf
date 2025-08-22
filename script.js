function toggleActionButtons(imgElem) {
  document.querySelectorAll(".image-actions").forEach((div) => {
    div.style.display = "none";
  });
  const wrapper = imgElem.closest(".uploaded-image");
  const actionsDiv = wrapper.querySelector(".image-actions");
  actionsDiv.style.display = actionsDiv.style.display === "flex" ? "none" : "flex";
}

// Hide action buttons when clicking outside
document.addEventListener("click", function (e) {
  if (!e.target.closest(".uploaded-image")) {
    document.querySelectorAll(".image-actions").forEach((el) => {
      el.style.display = "none";
    });
  }
});

function editImage(dataURL) {
  window.location.href = "edit.html?img=" + encodeURIComponent(dataURL);
}

// ✅ Rotation function (for UI + keeping rotation state for PDF)
function rotateImage(imgElem) {
  let currentRotation = parseInt(imgElem.getAttribute("data-rotation") || "0", 10);
  currentRotation = (currentRotation + 90) % 360;
  imgElem.style.transform = "rotate(" + currentRotation + "deg)";
  imgElem.setAttribute("data-rotation", currentRotation);

  const imageContainer = imgElem.parentElement;
  let origWidth = parseFloat(imgElem.dataset.origWidth) || parseFloat(window.getComputedStyle(imgElem).width);
  let origHeight = parseFloat(imgElem.dataset.origHeight) || parseFloat(window.getComputedStyle(imgElem).height);

  if (currentRotation === 90 || currentRotation === 270) {
    imageContainer.style.width = origHeight + "px";
    imageContainer.style.height = origWidth + "px";
  } else {
    imageContainer.style.width = origWidth + "px";
    imageContainer.style.height = origHeight + "px";
  }
}

// ✅ Helper for PDF rotation (to be used inside convertToPdf in upload_convert_download.js)
function getPdfRotationParams(rotation, embeddedImg, imgWidth, imgHeight, degrees) {
  let page;
  switch (rotation) {
    case 0:
      page = { size: [imgWidth, imgHeight], x: 0, y: 0, rotate: null };
      break;
    case 90:
      page = { size: [imgHeight, imgWidth], x: 0, y: imgWidth, rotate: degrees(270) };
      break;
    case 180:
      page = { size: [imgWidth, imgHeight], x: imgWidth, y: imgHeight, rotate: degrees(180) };
      break;
    case 270:
      page = { size: [imgHeight, imgWidth], x: imgHeight, y: 0, rotate: degrees(90) };
      break;
    default:
      page = { size: [imgWidth, imgHeight], x: 0, y: 0, rotate: null };
  }
  return page;
}

function deleteImage(imageId) {
  const index = uploadedImages.findIndex((img) => img.id == imageId);
  if (index !== -1) {
    uploadedImages[index].element.remove();
    uploadedImages.splice(index, 1);
    updateImageOrder();
  }
}

function previewImage(imgElem) {
  const modal = document.getElementById("previewModal");
  const modalImg = document.getElementById("previewModalImage");
  modalImg.src = imgElem.src;
  currentZoomLevel = 1;
  modalImg.style.transform = "scale(1)";
  modal.style.display = "flex";
}

function closePreviewModal() {
  document.getElementById("previewModal").style.display = "none";
}

function zoomIn() {
  if (currentZoomLevel < 3) {
    currentZoomLevel += 0.2;
    document.getElementById("previewModalImage").style.transform = "scale(" + currentZoomLevel + ")";
  }
  if (currentZoomLevel > 1) {
    document.getElementById("modalZoomOut").style.display = "block";
  }
}

function zoomOut() {
  if (currentZoomLevel > 1) {
    currentZoomLevel -= 0.2;
    if (currentZoomLevel < 1) currentZoomLevel = 1;
    document.getElementById("previewModalImage").style.transform = "scale(" + currentZoomLevel + ")";
  }
  if (currentZoomLevel === 1) {
    document.getElementById("modalZoomOut").style.display = "none";
  }
}

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

document.addEventListener("DOMContentLoaded", function () {
  const uploadedImagesContainer = document.getElementById("uploadedImagesContainer");
  Sortable.create(uploadedImagesContainer, { animation: 150, onEnd: updateImageOrder });

  document.getElementById("modalClose").addEventListener("click", closePreviewModal);
  document.getElementById("modalEdit").addEventListener("click", function () {
    editImage(document.getElementById("previewModalImage").src);
  });
  document.getElementById("modalZoomIn").addEventListener("click", zoomIn);
  document.getElementById("modalZoomOut").addEventListener("click", zoomOut);
});
