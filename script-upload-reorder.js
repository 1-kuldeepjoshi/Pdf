let imageNumber = 0;
let uploadedImages = [];
let currentZoomLevel = 1;
let pdfBytes = null;

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

  const fileReadPromises = files.map((file, index) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve({ file, dataURL: e.target.result, index });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    })
  );

  Promise.all(fileReadPromises).then(results => {
    results.sort((a, b) => a.index - b.index);
    results.forEach(result => createImageCard(result));
    document.getElementById("convertBtn").style.display = "block";
  });
}

function createImageCard({ file, dataURL }) {
  imageNumber++;
  const container = document.getElementById("uploadedImagesContainer");

  const wrapper = document.createElement("div");
  wrapper.classList.add("uploaded-image");
  wrapper.setAttribute("data-id", imageNumber);

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

  actionsDiv.appendChild(makeActionButton("fa-eye", "Preview", () => previewImage(imgElem)));
  actionsDiv.appendChild(makeActionButton("fa-pencil", "Edit", () => editImage(dataURL)));
  actionsDiv.appendChild(makeActionButton("fa-rotate-right", "Rotate", () => rotateImage(imgElem)));
  actionsDiv.appendChild(makeActionButton("fa-trash", "Delete", () => deleteImage(imageNumber)));

  wrapper.append(numElem, imgContainer, nameElem, actionsDiv);
  container.appendChild(wrapper);

  uploadedImages.push({ id: imageNumber, src: dataURL, element: wrapper });
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

function updateImageOrder() {
  const container = document.getElementById("uploadedImagesContainer");
  const children = Array.from(container.children);
  uploadedImages = children.map(child =>
    uploadedImages.find(img => img.id == child.getAttribute("data-id"))
  );
  children.forEach((child, index) => {
    const numElem = child.querySelector(".uploaded-image-number");
    if (numElem) numElem.innerText = `#${index + 1}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  Sortable.create(document.getElementById("uploadedImagesContainer"), {
    animation: 150,
    onEnd: updateImageOrder,
  });
});
