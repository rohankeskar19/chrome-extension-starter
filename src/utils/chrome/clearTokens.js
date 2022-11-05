const clearTokens = (chrome) => {
  chrome.runtime.sendMessage({
    message: "clearTokens",
  });
};

export default clearTokens;
