export function editImage(dataURL) {
  window.location.href = `edit.html?img=${encodeURIComponent(dataURL)}`;
}
