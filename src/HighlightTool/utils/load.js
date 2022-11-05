import elementFromQuery from "./elementFromQuery";
import highlight from "./highlight";

const load = (highlightVal, noErrorTracking) => {
  /* eslint-disable-line no-redeclare */
  const selection = {
    anchorNode: elementFromQuery(highlightVal.anchorNode),
    anchorOffset: highlightVal.anchorOffset,
    focusNode: elementFromQuery(highlightVal.focusNode),
    focusOffset: highlightVal.focusOffset,
  };

  // Starting with version 3.1.0, a new highlighting system was used which modifies the DOM in place

  const selectionString = highlightVal.string;
  const container = elementFromQuery(highlightVal.container);

  const color = highlightVal.color;

  let success = false;

  success = highlight(
    selectionString,
    container,
    selection,
    color,
    highlightVal.id
  );

  //   if (!noErrorTracking && !success) {
  //     addHighlightError(highlightVal, highlightVal.id);
  //   }
  return success;
};

export default load;
