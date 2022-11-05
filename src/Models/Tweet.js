import { v4 as uuidv4 } from "uuid";

class Tweet {
  id = "";
  tweetData = {};
  uid = "";
  tags = [];
  type = "tweet";
  createdOn = "";

  constructor(tweet) {
    this.id = tweet.id != undefined ? tweet.id : `${uuidv4()}_${Date.now()}`;
    this.tweetData =
      tweet.tweetData != undefined ? tweet.tweetData : this.tweetData;
    this.uid = tweet.uid != undefined ? tweet.uid : this.uid;
    this.tags = tweet.tags != undefined ? tweet.tags : this.tags;
    this.type = tweet.type != undefined ? tweet.type : this.type;
    this.createdOn =
      tweet.createdOn != undefined ? tweet.createdOn : Date.now();
  }

  getObject() {
    return {
      id: this.id,
      tweetData: this.tweetData,
      uid: this.uid,
      tags: this.tags,
      type: this.type,
      createdOn: this.createdOn,
    };
  }
}

export default Tweet;
