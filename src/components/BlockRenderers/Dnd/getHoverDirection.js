export const getHoverDirection = (dragItem, monitor, ref, hoverId) => {
  if (!ref.current) return;

  const dragId = dragItem.id;

  // Don't replace items with themselves
  if (dragId === hoverId) return;

  // Determine rectangle on screen
  const hoverBoundingRect = ref.current?.getBoundingClientRect();

  // Get vertical middle
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

  // Determine mouse position
  const clientOffset = monitor.getClientOffset();
  if (!clientOffset) return;

  // Get pixels to the top
  const hoverClientY = clientOffset.y - hoverBoundingRect.top;

  // Only perform the move when the mouse has crossed half of the items height
  // When dragging downwards, only move when the cursor is below 50%
  // When dragging upwards, only move when the cursor is above 50%

  // Dragging downwards
  // if (dragId < hoverId && hoverClientY < hoverMiddleY) {
  if (hoverClientY < hoverMiddleY) {
    return "top";
  }

  // Dragging upwards
  // if (dragId > hoverId && hoverClientY > hoverMiddleY) {
  if (hoverClientY >= hoverMiddleY) {
    return "bottom";
  }
};
