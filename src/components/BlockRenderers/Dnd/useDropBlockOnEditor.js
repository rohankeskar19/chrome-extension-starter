import { DropTargetMonitor, useDrop } from "react-dnd";
import { Editor, Path, Range, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { getHoverDirection } from "./getHoverDirection";
import { findNode } from "./findNode";
import { isExpanded } from "./isExpanded";

const getNewDirection = (previousDir, dir) => {
  if (!dir && previousDir) {
    return "";
  }

  if (dir === "top" && previousDir !== "top") {
    return "top";
  }

  if (dir === "bottom" && previousDir !== "bottom") {
    return "bottom";
  }
};

export const useDropBlockOnEditor = (
  editor,
  { blockRef, id, dropLine, setDropLine }
) => {
  return useDrop({
    accept: "block",
    drop: (dragItem, monitor) => {
      const direction = getHoverDirection(dragItem, monitor, blockRef, id);
      if (!direction) return;

      const dragEntry = findNode(editor, {
        at: [],
        match: { id: dragItem.id },
      });
      if (!dragEntry) return;
      const [, dragPath] = dragEntry;

      ReactEditor.focus(editor);

      let dropPath;
      if (direction === "bottom") {
        dropPath = findNode(editor, { at: [], match: { id } })?.[1];
        if (!dropPath) return;

        if (Path.equals(dragPath, Path.next(dropPath))) return;
      }

      if (direction === "top") {
        const nodePath = findNode(editor, { at: [], match: { id } })?.[1];

        if (!nodePath) return;
        dropPath = [
          ...nodePath.slice(0, -1),
          nodePath[nodePath.length - 1] - 1,
        ];

        if (Path.equals(dragPath, dropPath)) return;
      }

      if (Path.isDescendant(dropPath, dragPath)) return;

      if (direction) {
        const _dropPath = dropPath;

        const before =
          Path.isBefore(dragPath, _dropPath) &&
          Path.isSibling(dragPath, _dropPath);
        const to = before ? _dropPath : Path.next(_dropPath);

        Transforms.moveNodes(editor, {
          at: dragPath,
          to,
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover(item, monitor) {
      const direction = getHoverDirection(item, monitor, blockRef, id);
      const dropLineDir = getNewDirection(dropLine, direction);
      if (dropLineDir) setDropLine(dropLineDir);

      if (direction && isExpanded(editor.selection)) {
        ReactEditor.focus(editor);
        Transforms.collapse(editor);
      }
    },
  });
};
