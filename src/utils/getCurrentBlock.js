const getCurrentBlock = (editor) => {
  var selection = editor.selection;
  var currentBlock = {};
  if (selection) {
    if (selection.anchor) {
      if (selection.anchor.path) {
        currentBlock = editor.children[selection.anchor.path[0]];
      } else {
        currentBlock = editor.children[selection.anchor];
      }
    } else if (selection.focus) {
      if (selection.focus.path) {
        currentBlock = editor.children[selection.focus.path[0]];
      } else {
        currentBlock = editor.children[selection.focus];
      }
    }
  } else {
    selection = undefined;
  }

  return currentBlock;
};

export default getCurrentBlock;
