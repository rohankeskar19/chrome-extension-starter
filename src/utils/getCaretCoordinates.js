import Singleton from "./getDocument";

const getCaretCoordinates = () => {
  let x, y;
  const document = Singleton.getDocument();

  const selection = document.getSelection();
  if (selection.rangeCount !== 0) {
    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(false);
    const rect = range.getClientRects()[0];

    if (rect) {
      x = rect.left;
      y = rect.top + 155;
    }
  }

  return { x, y };
};

export default getCaretCoordinates;
