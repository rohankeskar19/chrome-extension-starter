import Block from "../Models/Block";

const ELEMENT_TAGS = {
  BLOCKQUOTE: () => new Block({ type: "block-quote" }).getObject(),
  H1: () => new Block({ type: "heading-one" }).getObject(),
  H2: () => new Block({ type: "heading-two" }).getObject(),
  H3: () => new Block({ type: "heading-three" }).getObject(),
  H4: () => new Block({ type: "heading-three" }).getObject(),
  H5: () => new Block({ type: "heading-three" }).getObject(),
  H6: () => new Block({ type: "heading-three" }).getObject(),
  IMG: (el) => [
    new Block({
      type: "image",
      fileUrl: el.getAttribute("src"),
    }).getObject(),
    new Block({ type: "paragraph" }).getObject(),
  ],
  LI: (el) =>
    el.parentNode.nodeName == "OL"
      ? new Block({ type: "ordered-list-item" }).getObject()
      : new Block({ type: "unordered-list-item" }).getObject(),

  P: () => new Block({ type: "paragraph" }).getObject(),
  HR: () => new Block({ type: "divider" }).getObject(),
  A: (el) => ({
    type: "link",
    url: el.getAttribute("href"),
    children: [
      {
        text: el.innertText,
      },
    ],
  }),
};

export default ELEMENT_TAGS;
