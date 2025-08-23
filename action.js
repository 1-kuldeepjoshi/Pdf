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

      // ✅ Create Action Buttons here
      const actionsDiv = document.createElement("div");
      actionsDiv.classList.add("image-actions");

      // Preview Button
      const previewBtn = document.createElement("button");
      previewBtn.classList.add("action-btn");
      previewBtn.innerHTML =
        '<i class="fa fa-eye"></i><span class="btn-label">Preview</span>';
      previewBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        previewImage(imgElem); // in action.js
      });

      // Edit Button
      const editBtn = document.createElement("button");
      editBtn.classList.add("action-btn");
      editBtn.innerHTML =
        '<i class="fa fa-pencil"></i><span class="btn-label">Edit</span>';
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        editImage(result.dataURL); // uses existing function
      });

      // Rotate Button
      const rotateBtn = document.createElement("button");
      rotateBtn.classList.add("action-btn");
      rotateBtn.innerHTML =
        '<i class="fa fa-rotate-right"></i><span class="btn-label">Rotate</span>';
      rotateBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        rotateImage(imgElem); // in action.js
      });

      // Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("action-btn");
      deleteBtn.innerHTML =
        '<i class="fa fa-trash"></i><span class="btn-label">Delete</span>';
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteImage(imageWrapper.getAttribute("data-id")); // in action.js
      });

      // Append all buttons
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
