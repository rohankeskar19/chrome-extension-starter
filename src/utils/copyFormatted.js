const copyFormatted = (html) => {
  // Create container for the HTML
  // [1]
  var container = document.createElement("div");
  container.innerHTML = html;
  // Hide element
  // [2]
  container.style.width = "0px";
  container.style.height = "0";
  container.style.visibility = "none";
  container.style.display = "none";
  container.style.position = "fixed";
  container.style.pointerEvents = "none";
  container.style.opacity = 0;

  // Detect all style sheets of the page
  var activeSheets = Array.prototype.slice
    .call(document.styleSheets)
    .filter(function (sheet) {
      return !sheet.disabled;
    });

  // Mount the container to the DOM to make `contentWindow` available
  // [3]
  document.body.appendChild(container);

  // Copy to clipboard
  // [4]
  window.getSelection().removeAllRanges();

  var range = document.createRange();
  range.selectNode(container);
  window.getSelection().addRange(range);

  // [5.1]
  document.execCommand("copy");

  // [5.2]
  for (var i = 0; i < activeSheets.length; i++) activeSheets[i].disabled = true;

  // [5.3]
  document.execCommand("copy");

  // [5.4]
  for (var i = 0; i < activeSheets.length; i++)
    activeSheets[i].disabled = false;

  // Remove the container
  // [6]
  document.body.removeChild(container);
};

export default copyFormatted;
