const isOrContains = (node, container) => {
  while (node) {
    if (node === container) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

const elementContainsSelection = (el) => {
  var sel;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount > 0) {
      for (var i = 0; i < sel.rangeCount; ++i) {
        if (!isOrContains(sel.getRangeAt(i).commonAncestorContainer, el)) {
          return false;
        }
      }
      return true;
    }
  } else if ((sel = document.selection) && sel.type != "Control") {
    return isOrContains(sel.createRange().parentElement(), el);
  }
  return false;
};

export default elementContainsSelection;
