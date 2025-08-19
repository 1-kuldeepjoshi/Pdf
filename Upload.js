// upload.js
export let uploadedImages = [];
export let imageNumber = 0;

export function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  // hide/show containers…
  // read files via Promise.all…
  // for each result, call createThumbnail(result);
  // finally: dispatch a custom event so main.js shows the Convert button
}

// Thumbnail creation helper
function createThumbnail({ file, dataURL, index }) {
  imageNumber++;
  // Build DOM elements (wrapper, img, actions) exactly as before
  // Push into uploadedImages with { id, src: dataURL, element }
  // Attach imgElem click → dispatch toggle-actions event
}

// Fire a custom event when images are ready
function dispatchReadyEvent() {
  document.dispatchEvent(new Event('imagesReady'));
}
