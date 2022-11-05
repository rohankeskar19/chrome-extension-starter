import { Editor } from "slate";
import { castArray } from "lodash";

export const match = (obj, predicate) => {
  if (!predicate) return true;

  if (typeof predicate === "object") {
    return Object.entries(predicate).every(([key, value]) => {
      const values = castArray(value);

      return values.includes(obj[key]);
    });
  }

  return predicate(obj);
};

export const getQueryOptions = (editor, options) => {
  return {
    ...options,
    match: (n) =>
      match(n, options.match) && (!options?.block || Editor.isBlock(editor, n)),
  };
};
