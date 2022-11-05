import getQuery from "./getQuery";
import localDb from "./localDb";
import { v4 as uuidv4 } from "uuid";
import api from "./api";

const store = (chrome, selection, container, url, color, callback) => {
  /* eslint-disable-line no-redeclare, no-unused-vars */

  const highlightObject = {
    id: `${uuidv4()}_${Date.now()}`,
    string: selection.toString(),
    container: getQuery(container),
    anchorNode: getQuery(selection.anchorNode),
    anchorOffset: selection.anchorOffset,
    focusNode: getQuery(selection.focusNode),
    focusOffset: selection.focusOffset,
    color: color,
    createdOn: Date.now(),
    url: url,
  };
  // @TODO store highlight in database
  api.saveHighlight(highlightObject);
  localDb.saveHighlight(chrome, highlightObject);

  if (callback) callback(highlightObject.id);
};

export default store;
