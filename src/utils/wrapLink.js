import { Range, Transforms } from "slate";
import isLinkActive from "./isLinkActive";
import unwrapLink from "./unwrapLink";

const wrapLink = (editor, url) => {
  if (isLinkActive(editor)) {
    console.log("Link is active unwrapping mate");
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: "link",
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    console.log("Wrapping nodes :)");
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};

export default wrapLink;
