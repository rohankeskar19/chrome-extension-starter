import { ReactEditor } from "slate-react";
import isBlockWithinRage from "./isBlockWithinRage";
import isMultipleSelected from "./isMultipleSelected";

const showSelectedHalo = (editor, selected, element) => {
  const path = ReactEditor.findPath(editor, element);

  if (
    isMultipleSelected(editor) &&
    isBlockWithinRage(editor, path) &&
    selected
  ) {
    return true;
  } else {
    return false;
  }
};

export default showSelectedHalo;
