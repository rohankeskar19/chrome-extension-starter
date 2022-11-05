import TEXT_TAGS from "./leafConverters";
import ELEMENT_TAGS from "./blockConverters";
import { jsx } from "slate-hyperscript";
import { Element, Node, Text } from "slate";

const deserialize = (el) => {
  if (el.nodeType === 3) {
    if (el.textContent == "\n") {
      return "";
    } else {
      return el.textContent;
    }
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return "";
  }

  const { nodeName } = el;
  let parent = el;

  var children = Array.from(parent.childNodes).map(deserialize).flat();
  if (el.nodeName === "BODY") {
    return jsx("fragment", {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx("element", attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map((child) => {
      if (Element.isElement(child)) {
        return jsx("element", child);
      } else {
        return jsx("text", attrs, child);
      }
    });
  }

  return children;
};

export default deserialize;
