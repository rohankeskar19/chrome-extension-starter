import { Editor } from "slate";

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);

  return marks
    ? marks[format] != undefined
      ? marks[format]
      : undefined
    : undefined;
};
export default isMarkActive;
