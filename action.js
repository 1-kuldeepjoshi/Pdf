// Preview image in modal
function previewImage(imgElem) {
  const modal = document.getElementById("previewModal");
  const modalImg = document.getElementById("previewModalImage");
  modalImg.src = imgElem.src;
  currentZoomLevel = 1;
  modalImg.style.transform = "scale(1)";
  modal.style.display = "flex";
}

// Close modal
function closePreviewModal() {
  document.getElementById("previewModal").style.display = "none";
}

// Zoom in modal preview
function zoomIn() {
  if (currentZoomLevel < 3) {
    currentZoomLevel += 0.2;
    document.getElementById("previewModalImage").style.transform = "scale(" + currentZoomLevel + ")";
  }
  if (currentZoomLevel > 1) {
    document.getElementById("modalZoomOut").style.display = "block";
  }
}

// Zoom out modal preview
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

// Delete uploaded image
function deleteImage(imageId) {
  const index = uploadedImages.findIndex((img) => img.id == imageId);
  if (index !== -1) {
    uploadedImages[index].element.remove();
    uploadedImages.splice(index, 1);
    updateImageOrder();
  }
}

// Rotate uploaded image
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

// Update image order (used by SortableJS)
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

// Add modal button events
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("modalClose").addEventListener("click", closePreviewModal);
  document.getElementById("modalEdit").addEventListener("click", function () {
    editImage(document.getElementById("previewModalImage").src);
  });
  document.getElementById("modalZoomIn").addEventListener("click", zoomIn);
  document.getElementById("modalZoomOut").addEventListener("click", zoomOut);
});
