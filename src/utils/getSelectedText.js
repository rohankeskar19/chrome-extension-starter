const getSelectedText = (currentSelectedText) => {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection) {
    text = document.selection.createRange().text;
  }
  // If user clicks on selected text then return "" to hide toolbar
  if (currentSelectedText == text) {
    text = "";
  }

  return text;
};

export default getSelectedText;
