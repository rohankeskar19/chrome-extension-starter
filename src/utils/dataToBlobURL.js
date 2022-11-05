const dataToBlobURL = (dataURL) => {
  /*
   * Converts a data:// URL (i.e. `canvas.toDataURL("image/png")`) to a blob:// URL.
   * This allows a shorter URL and a simple management of big data objects.
   *
   * Contributor: Ben Ellis <https://github.com/ble>
   */
  var parts = dataURL.match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);

  if (parts && parts.length >= 3) {
    // Assume base64 encoding
    var binStr = atob(parts[3]);

    // Convert to binary in ArrayBuffer
    var buf = new ArrayBuffer(binStr.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i < view.length; i++) view[i] = binStr.charCodeAt(i);

    // Create blob with mime type, create URL for it
    var blob = new Blob([view], { type: parts[1] });
    var objectURL = window.URL.createObjectURL(blob);

    return objectURL;
  } else {
    return null;
  }
};

export default dataToBlobURL;
