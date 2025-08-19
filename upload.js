// upload.js
export let uploadedImages = [];
export let imageNumber = 0;

export function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  const uploadContainer       = document.getElementById('uploadContainer');
  const descContainer         = document.querySelector('.description-container');
  const galleryContainer      = document.getElementById('uploadedImagesContainer');
  const addImageBtnContainer  = document.getElementById('addImageBtnContainer');

  // toggle UI
  uploadContainer.style.display      = 'none';
  descContainer.style.display        = 'none';
  galleryContainer.style.display     = 'flex';
  addImageBtnContainer.style.display = 'flex';

  // read files
  Promise.all(files.map(readFile)).then(results => {
    results.sort((a, b) => a.index - b.index)
           .forEach(createThumbnail);
    dispatchImagesReady();
  });
}

function readFile(file, index) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload    = e => resolve({ file, dataURL: e.target.result, index });
    reader.onerror   = reject;
    reader.readAsDataURL(file);
  });
}

function createThumbnail({ file, dataURL }) {
  imageNumber++;
  // build elements (wrapper → number, container→ img, name, actions)…
  // attach event listeners:
  //   img click        → dispatch 'toggleActions' custom event
  //   rotate/delete/preview/edit buttons are delegated in main.js
  // keep the same DOM structure as before
  // finally push:
  uploadedImages.push({ id: imageNumber, src: dataURL, element: wrapper });
}

function dispatchImagesReady() {
  document.dispatchEvent(new Event('imagesReady'));
}
