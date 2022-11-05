import dataToBlobURL from "./dataToBlobURL";
import normalizeFileName from "./normalizeFileName";

const screenshotReturn = (shared) => {
  function pad2(str) {
    if ((str + "").length == 1) return "0" + str;
    return "" + str;
  }

  var d = new Date();
  var timestamp =
    "" +
    d.getFullYear() +
    "-" +
    pad2(d.getMonth() + 1) +
    "-" +
    pad2(d.getDate()) +
    "-" +
    pad2(d.getHours()) +
    "" +
    pad2(d.getMinutes()) +
    "'" +
    pad2(d.getSeconds()) +
    "";
  var filename =
    "pageshot of '" + normalizeFileName(shared.tab.title) + "' @ " + timestamp;
  var blobURL = dataToBlobURL(shared.imageDataURL);

  if (!blobURL) {
    // ****** No content! Maybe page too long?
    alert(
      "\n\n\nI'm sorry.\n\nThere was some trouble in generating the screenshot.\n\nIt might be due to Chrome canvas size limitations.\nTry on a shorter page?\n\n\n"
    );
  }
};

export default screenshotReturn;
