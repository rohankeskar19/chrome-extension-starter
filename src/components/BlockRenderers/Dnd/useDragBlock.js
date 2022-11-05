import { useDrag } from "react-dnd";

export const useDragBlock = (editor, id) => {
  return useDrag(
    () => ({
      type: "block",
      item() {
        editor.isDragging = true;
        document.body.classList.add("dragging");
        return { id };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        editor.isDragging = false;
        document.body.classList.remove("dragging");
      },
    }),
    []
  );
};
