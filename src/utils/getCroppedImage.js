const getCroppedImage = (imageData, x, y, width, height, callback) => {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  var imageObj = new Image();

  // set canvas dimensions

  canvas.width = width;
  canvas.height = height;

  imageObj.onload = function () {
    context.drawImage(imageObj, x, y, width, height, 0, 0, width, height);
    callback(canvas.toDataURL());
  };

  imageObj.src = imageData;
};

export default getCroppedImage;
