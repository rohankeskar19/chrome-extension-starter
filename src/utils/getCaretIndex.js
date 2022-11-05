const getCaretIndex = (selection) => {
  var position = 0;
  if (selection) {
    if (selection.anchor) {
      position = selection.anchor.offset;
    } else if (selection.focus) {
      position = selection.focus.offset;
    }
  }

  return position;
};

export default getCaretIndex;
