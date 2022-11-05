

const getTweetIdFromUlr = (url) => {
    var tweetId = url.split("/");
    tweetId = tweetId[tweetId.length - 1];

    return tweetId
}

export default getTweetIdFromUlr