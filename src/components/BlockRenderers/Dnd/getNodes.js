import { Editor } from "slate";

import { unhangRange } from "./unhangRange";

import { getQueryOptions } from "./getQueryOptions";

export const getNodes = (editor, options = {}) => {
  unhangRange(editor, options);

  return Editor.nodes(editor, getQueryOptions(editor, options));
};
