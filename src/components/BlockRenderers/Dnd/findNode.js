import { getNodes } from "./getNodes";
import { getQueryOptions } from "./getQueryOptions";

/**
 * Find node matching the condition.
 */
export const findNode = (editor, options = {}) => {
  // Slate throws when things aren't found so we wrap in a try catch and return undefined on throw.
  try {
    const nodeEntries = getNodes(editor, {
      at: editor.selection || [],
      ...getQueryOptions(editor, options),
    });

    for (const [node, path] of nodeEntries) {
      return [node, path];
    }
  } catch (error) {
    return undefined;
  }
};
