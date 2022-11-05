import { v4 as uuidv4 } from "uuid";

class Block {
  id = "";
  type = "paragraph";
  children = [{ text: "" }];
  isChecked = false;
  blockBackground = "";
  fileUrl = "";
  orderedItemNumber = 1;
  blockWidth = 100;
  metadata = {};
  equationHtml = "";
  equationText = "";
  language = "javascript";
  showLink = false;
  createdOn = "";

  constructor(block) {
    this.id = block.id != undefined ? block.id : `${uuidv4()}_${Date.now()}`;
    this.type = block.type != undefined ? block.type : this.type;
    this.equationHtml =
      block.equationHtml != undefined ? block.equationHtml : this.equationHtml;
    this.children =
      block.children != undefined ? block.children : this.children;
    this.blockBackground =
      block.blockBackground != undefined
        ? block.blockBackground
        : this.blockBackground;
    this.isChecked =
      block.isChecked != undefined ? block.isChecked : this.isChecked;
    this.orderedItemNumber =
      block.orderedItemNumber != undefined
        ? block.orderedItemNumber
        : this.orderedItemNumber;
    this.metadata =
      block.metadata != undefined ? block.metadata : this.metadata;
    this.fileUrl = block.fileUrl != undefined ? block.fileUrl : this.fileUrl;
    this.language =
      block.language != undefined ? block.language : this.language;
    this.equationText =
      block.equationText != undefined ? block.equationText : this.equationText;
    this.blockWidth =
      block.blockWidth != undefined ? block.blockWidth : this.blockWidth;
    this.showLink =
      block.showLink != undefined ? block.showLink : this.showLink;
    this.createdOn =
      block.createdOn != undefined ? block.createdOn : Date.now();
  }

  setId(id) {
    this.id = id;
  }

  setText(text) {
    this.children = [
      {
        ...this.children[0],
        text: text,
      },
    ];
  }

  getText() {
    if (this.type == "bookmark") {
      var currentUrl = this.children[0].text;
      var prefix1 = "http://";
      var prefix2 = "https://";
      if (
        currentUrl.substr(0, prefix1.length) !== prefix1 &&
        currentUrl.substr(0, prefix2.length) !== prefix2
      ) {
        currentUrl = prefix2 + currentUrl;
      }

      return currentUrl;
    } else {
      var string = "";
      this.children.forEach((child) => {
        string += child.text ? child.text : "";
      });

      return string;
    }
  }

  setMetadata(metadata) {
    this.metadata = metadata;
  }

  getMetadata() {
    return this.metadata;
  }

  setShowLink(showLink) {
    this.showLink = showLink;
  }

  getShowLink() {
    return this.showLink;
  }

  setContent(content) {
    this.content = content;
  }

  setType(type) {
    this.type = type;
  }

  setIsChecked(isChecked) {
    this.isChecked = isChecked;
  }

  setOrderedItemNumber(orderedItemNumber) {
    this.orderedItemNumber = orderedItemNumber;
  }

  setLanguage(language) {
    this.language = language;
  }

  getObject() {
    return {
      id: this.id,
      type: this.type,
      equationHtml: this.equationHtml,
      equationText: this.equationText,
      children: this.children,
      isChecked: this.isChecked,
      fileUrl: this.fileUrl,
      blockBackground: this.blockBackground,
      orderedItemNumber: this.orderedItemNumber,
      metadata: this.metadata,
      language: this.language,
      blockWidth: this.blockWidth,
      showLink: this.showLink,
      createdOn: this.createdOn,
    };
  }
}

export default Block;
