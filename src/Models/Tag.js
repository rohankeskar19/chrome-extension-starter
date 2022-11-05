import { v4 as uuidv4 } from "uuid";

class Tag {
  id = "";
  name = "";
  color = "#e8e8e8";
  uid = "";
  createdOn = "";

  constructor(tag) {
    this.id = tag.id != undefined ? tag.id : `${uuidv4()}_${Date.now()}`;
    this.name = tag.name != undefined ? tag.name : this.name;
    this.color = tag.color != undefined ? tag.color : this.color;
    this.uid = tag.uid != undefined ? tag.uid : this.uid;
    this.createdOn = tag.createdOn != undefined ? tag.createdOn : Date.now();
  }

  getObject() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      uid: this.uid,
      createdOn: this.createdOn,
    };
  }
}

export default Tag;
