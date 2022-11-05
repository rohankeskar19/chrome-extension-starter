import { Editor, Range } from "slate";

export const unhangRange = (editor, options = {}) => {
  const { at = editor.selection, voids, unhang = true } = options;

  if (Range.isRange(at) && unhang) {
    options.at = Editor.unhangRange(editor, at, { voids });
  }
};
