import Block from "./Block";

class FileObject {
  id = "";
  uid = "";
  name = "";
  color = "";
  banner = "";
  showBanner = true;
  smallText = false;
  fullWidth = false;
  textAlignment = 1;
  fontStyle = 1;
  path = "";
  parent = "";
  type = "";
  favourited = false;
  isArchived = false;
  blocks = [];
  createdOn = "";

  constructor(
    uid,
    name,
    blocks,
    color,
    banner,
    showBanner,
    smallText,
    fullWidth,
    textAlignment,
    fontStyle,
    type,
    path,
    parent,
    favourited = false,
    isArchived
  ) {
    this.uid = uid;
    this.name = name;
    if (type == "NOTE") {
      if (!blocks) {
        this.blocks = [new Block({ type: "paragraph" }).getObject()];
      } else {
        this.blocks = blocks;
      }
    }

    this.color = color;
    this.banner = banner;
    this.showBanner = showBanner;
    this.smallText = smallText;
    this.fullWidth = fullWidth;
    this.textAlignment = textAlignment;
    this.fontStyle = fontStyle;
    this.type = type;
    this.path = path;
    this.parent = parent;
    this.favourited = favourited;
    this.isArchived = isArchived;
    this.createdOn = Date.now();
  }

  setId(id) {
    this.id = id;
  }

  getId() {
    return this.id;
  }

  setPath(path) {
    this.path = path;
  }

  getPath() {
    return this.path;
  }

  getObject() {
    return this.type == "NOTE"
      ? {
          id: this.id,
          uid: this.uid,
          name: this.name,
          blocks: this.blocks,
          color: this.color,
          banner: this.banner,
          showBanner: this.showBanner,
          smallText: this.smallText,
          fullWidth: this.fullWidth,
          textAlignment: this.textAlignment,
          fontStyle: this.fontStyle,
          type: this.type,
          path: this.path,
          parent: this.parent,
          favourited: this.favourited,
          isArchived: this.isArchived,
          createdOn: this.createdOn,
        }
      : {
          id: this.id,
          uid: this.uid,
          name: this.name,
          color: this.color,
          type: this.type,
          path: this.path,
          parent: this.parent,
          favourited: this.favourited,
          isArchived: this.isArchived,
          createdOn: this.createdOn,
        };
  }
}

export default FileObject;
