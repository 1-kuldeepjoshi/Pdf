import { state } from './state.js';
import { updateImageOrder } from './uiActions.js';

export function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  const gallery = document.getElementById('uploadedImagesContainer');
  const uploadSec = document.getElementById('uploadContainer');
  const descSec = document.querySelector('.description-container');
  const addBtnCtn = document.getElementById('addImageBtnContainer');

  uploadSec.style.display = 'none';
  descSec.style.display = 'none';
  gallery.style.display = 'flex';
  addBtnCtn.style.display = 'flex';

  const reads = files.map((file, idx) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => res({ file, dataURL: e.target.result, index: idx });
    reader.onerror = rej;
    reader.readAsDataURL(file);
  }));

  Promise.all(reads).then(results => {
    results.sort((a, b) => a.index - b.index);
    results.forEach(item => {
      state.imageNumber++;
      const wrapper = document.createElement('div');
      wrapper.className = 'uploaded-image';
      wrapper.dataset.id = state.imageNumber;

      // number
      const num = document.createElement('div');
      num.className = 'uploaded-image-number';
      num.innerText = `#${state.imageNumber}`;

      // image container
      const imgCtn = document.createElement('div');
      imgCtn.className = 'image-container';

      const imgEl = document.createElement('img');
      imgEl.src = item.dataURL;
      imgEl.dataset.rotation = '0';

      imgEl.onload = () => {
        const cs = getComputedStyle(imgEl);
        imgEl.dataset.origWidth = cs.width;
        imgEl.dataset.origHeight = cs.height;
        imgCtn.style.width = cs.width;
        imgCtn.style.height = cs.height;
      };

      imgEl.addEventListener('click', e => e.stopPropagation());

      imgCtn.appendChild(imgEl);

      // filename
      const nameEl = document.createElement('div');
      nameEl.className = 'uploaded-image-name';
      nameEl.innerText = item.file.name;

      // actions placeholder
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'image-actions';

      wrapper.append(num, imgCtn, nameEl, actionsDiv);
      gallery.appendChild(wrapper);

      state.uploadedImages.push({
        id: state.imageNumber,
        src: item.dataURL,
        element: wrapper,
      });
    });

    document.getElementById('convertBtn').style.display = 'block';
  });
}

export function deleteImage(imageId) {
  const idx = state.uploadedImages.findIndex(img => img.id == imageId);
  if (idx > -1) {
    state.uploadedImages[idx].element.remove();
    state.uploadedImages.splice(idx, 1);
    updateImageOrder();
  }
}
