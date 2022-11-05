const isMultipleSelected = (editor) => {
  if (editor.selection) {
    const anchor = editor.selection.anchor
      ? editor.selection.anchor
      : undefined;

    const focus = editor.selection.focus ? editor.selection.focus : undefined;

    if (anchor && focus) {
      const anchorPath = anchor.path;
      const focusPath = focus.path;

      if (anchorPath[0] != focusPath[0]) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export default isMultipleSelected;
