function createImageCard({ file, dataURL }) {
  imageNumber++;
  const uploadedImagesContainer = document.getElementById("uploadedImagesContainer");

  const imageWrapper = document.createElement("div");
  imageWrapper.classList.add("uploaded-image");
  imageWrapper.setAttribute("data-id", imageNumber);

  const numElem = document.createElement("div");
  numElem.classList.add("uploaded-image-number");
  numElem.innerText = `#${imageNumber}`;

  const imgContainer = document.createElement("div");
  imgContainer.classList.add("image-container");

  const imgElem = document.createElement("img");
  imgElem.src = dataURL;
  imgElem.setAttribute("data-rotation", "0");
  imgElem.onload = function () {
    const compStyle = window.getComputedStyle(imgElem);
    imgElem.dataset.origWidth = compStyle.width;
    imgElem.dataset.origHeight = compStyle.height;
    imgContainer.style.width = compStyle.width;
    imgContainer.style.height = compStyle.height;
  };
  imgElem.addEventListener("click", e => {
    e.stopPropagation();
    toggleActionButtons(imgElem);
  });

  imgContainer.appendChild(imgElem);

  const nameElem = document.createElement("div");
  nameElem.classList.add("uploaded-image-name");
  nameElem.innerText = file.name;

  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("image-actions");

  const previewBtn = makeActionButton("fa-eye", "Preview", () => previewImage(imgElem));
  const editBtn = makeActionButton("fa-pencil", "Edit", () => editImage(dataURL));
  const rotateBtn = makeActionButton("fa-rotate-right", "Rotate", () => rotateImage(imgElem));
  const deleteBtn = makeActionButton("fa-trash", "Delete", () => deleteImage(imageNumber));

  [previewBtn, editBtn, rotateBtn, deleteBtn].forEach(btn => actionsDiv.appendChild(btn));

  imageWrapper.append(numElem, imgContainer, nameElem, actionsDiv);
  uploadedImagesContainer.appendChild(imageWrapper);

  uploadedImages.push({ id: imageNumber, src: dataURL, element: imageWrapper });
}

function makeActionButton(icon, label, onClick) {
  const btn = document.createElement("button");
  btn.classList.add("action-btn");
  btn.innerHTML = `<i class="fa ${icon}"></i><span class="btn-label">${label}</span>`;
  btn.addEventListener("click", e => { e.stopPropagation(); onClick(); });
  return btn;
}

function toggleActionButtons(imgElem) {
  document.querySelectorAll(".image-actions").forEach(div => div.style.display = "none");
  const wrapper = imgElem.closest(".uploaded-image");
  const actionsDiv = wrapper.querySelector(".image-actions");
  actionsDiv.style.display = actionsDiv.style.display === "flex" ? "none" : "flex";
}

document.addEventListener("click", e => {
  if (!e.target.closest(".uploaded-image")) {
    document.querySelectorAll(".image-actions").forEach(el => el.style.display = "none");
  }
});

function editImage(dataURL) {
  window.location.href = "edit.html?img=" + encodeURIComponent(dataURL);
}

function rotateImage(imgElem) {
  let currentRotation = parseInt(imgElem.getAttribute("data-rotation") || "0", 10);
  currentRotation = (currentRotation + 90) % 360;
  imgElem.style.transform = `rotate(${currentRotation}deg)`;
  imgElem.setAttribute("data-rotation", currentRotation);
  const container = imgElem.parentElement;
  const origW = parseFloat(imgElem.dataset.origWidth);
  const origH = parseFloat(imgElem.dataset.origHeight);
  if (currentRotation === 90 || currentRotation === 270) {
    container.style.width = origH;
    container.style.height = origW;
  } else {
    container.style.width = origW;
    container.style.height = origH;
  }
}

function deleteImage(imageId) {
  const index = uploadedImages.findIndex(img => img.id == imageId);
  if (index !== -1) {
    uploadedImages[index].element.remove();
    uploadedImages.splice(index, 1);
    updateImageOrder();
  }
}
