import deserialize from "./deserialize";
import { Editor, Transforms } from "slate";
import calculateNumbersForListItem from "./calculateNumbersForListItem";
import Block from "../Models/Block";

const withHtml = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const html = data.getData("text/html");
    const file = data.files[0];

    if (html && !data.types.includes("application/x-slate-fragment")) {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const fragments = deserialize(parsed.body);

      Editor.normalize(editor);
      Transforms.insertFragment(editor, fragments);
      calculateNumbersForListItem(editor);

      return;
    }

    if (file) {
      const url = URL.createObjectURL(file);

      const imageBlock = new Block({ type: "image", fileUrl: url }).getObject();

      Transforms.insertNodes(editor, imageBlock);
    }

    Editor.normalize(editor);
    insertData(data);
  };

  return editor;
};

export default withHtml;
