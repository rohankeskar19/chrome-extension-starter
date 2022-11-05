import { Editor, Element } from "slate";

const getLinkValue = (editor) => {
  var selection = editor.selection;
  var currentBlock = {
    children: [],
    url: "",
  };
  if (selection) {
    const actualPathArr = Editor.node(editor, selection)[1];
    actualPathArr.pop();
    var block = undefined;
    block = editor.children[actualPathArr[0]];
    actualPathArr.shift();
    while (actualPathArr.length > 0) {
      block = block.children[actualPathArr[0]];
      actualPathArr.shift();
    }

    currentBlock = block;
  } else {
    currentBlock = undefined;
  }
  return currentBlock;
};

export default getLinkValue;
