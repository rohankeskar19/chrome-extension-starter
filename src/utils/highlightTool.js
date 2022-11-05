var previousText = "";

const initializeHighlightTool = () => {
  document.addEventListener("mouseup", positionTextHighlighter);
  document.addEventListener("mousedown", positionTextHighlighter);
};

const getSelectedText = () => {
  var text = "";
  const selection = window.getSelection();

  if (typeof window.getSelection != "undefined") {
    text = window.getSelection().toString();
  } else if (
    typeof document.selection != "undefined" &&
    document.selection.type == "Text"
  ) {
    text = document.selection.createRange().text;
  }
  if (selection.anchorNode && selection.focusNode) {
    if (
      selection.anchorNode.nodeType != Node.TEXT_NODE ||
      selection.focusNode.nodeType != Node.TEXT_NODE
    ) {
      text = "";
    }
  }

  if (isSelectionContentEditable(selection) && text != "") {
    text = "";
  }

  if (previousText == text) {
    text = "";
  }

  if (selection.anchorNode && selection.focusNode) {
    if (
      selection.anchorNode.parentElement.classList.contains(
        "notealy-highlighter-highlighted"
      )
    ) {
      text = "";
    }
    if (
      selection.focusNode.parentElement.classList.contains(
        "notealy-highlighter-highlighted"
      )
    ) {
      text = "";
    }
  }

  previousText = text;

  return text;
};

const positionTextHighlighter = (e) => {
  const highlightContainer = document.getElementById(
    "notealy-highlight-tool-iframe-container"
  );
  if (!highlightContainer.contains(e.target)) {
    const text = getSelectedText();
    const selection = window.getSelection();

    if (text != "") {
      var rects = selection.getRangeAt(0).getClientRects();
      var n = rects.length - 1;

      highlightContainer.style.left = `${
        rects[n].left + rects[n].width - 95
      }px`;
      highlightContainer.style.top = `${rects[n].top + rects[n].height + 5}px`;
      highlightContainer.style.display = "block";
    } else {
      highlightContainer.style.display = "none";
    }
  }
};

const isSelectionContentEditable = (selection) => {
  if (selection.anchorNode) {
    if (selection.anchorNode.parentNode.isContentEditable) {
      return true;
    }
  }

  if (selection.focusNode) {
    if (selection.focusNode.parentNode.isContentEditable) {
      return true;
    }
  }

  return false;
};
export default initializeHighlightTool;
