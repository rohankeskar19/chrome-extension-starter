import { useState } from "react";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useSlate } from "slate-react";
import { useDragBlock } from "./useDragBlock";
import { useDropBlockOnEditor } from "./useDropBlockOnEditor";

export const useDndBlock = ({ id, blockRef, removePreview }) => {
  const editor = useSlate();

  const [dropLine, setDropLine] = useState("");

  const [{ isDragging }, dragRef, preview] = useDragBlock(editor, id);
  const [{ isOver }, drop] = useDropBlockOnEditor(editor, {
    id,
    blockRef,
    dropLine,
    setDropLine,
  });

  // TODO: previewElement option
  if (removePreview) {
    drop(blockRef);
    preview(getEmptyImage(), { captureDraggingState: true });
  } else {
    preview(drop(blockRef));
  }

  if (!isOver && dropLine) {
    setDropLine("");
  }

  return {
    isDragging,
    dropLine,
    dragRef,
  };
};
