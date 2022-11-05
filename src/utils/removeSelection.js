const removeSelection = () => {
  (window.getSelection ? window.getSelection() : document.selection).empty();
};

export default removeSelection;
