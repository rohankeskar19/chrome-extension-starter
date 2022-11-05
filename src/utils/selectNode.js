import { Transforms } from "slate";
import { ReactEditor } from "slate-react";

const selectNode = (editor, element) => {
  const path = ReactEditor.findPath(editor, element);
  ReactEditor.focus(editor);
  Transforms.select(editor, {
    at: {
      anchor: {
        path: path,
        offset: 0,
      },
      focus: {
        path: path,
        offset: 0,
      },
    },
  });
};

export default selectNode;
