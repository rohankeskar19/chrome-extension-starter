import escapeCSSString from "./escapeCSSString";
import $ from "jquery";

const getQuery = (element) => {
  if (element.id) return `#${escapeCSSString(element.id)}`;
  if (element.localName === "html") return "html";

  const parent = element.parentNode;

  let index = null;
  const parentSelector = getQuery(parent);
  // The element is a text node
  if (!element.localName) {
    // Find the index of the text node:
    index = Array.prototype.indexOf.call(parent.childNodes, element);

    return `${parentSelector}>textNode:nth-of-type(${index})`;
  } else {
    const jEl = $(element);
    index = jEl.parent().find(`>${element.localName}`).index(jEl) + 1;
    return `${parentSelector}>${element.localName}:nth-of-type(${index})`;
  }
};

export default getQuery;
