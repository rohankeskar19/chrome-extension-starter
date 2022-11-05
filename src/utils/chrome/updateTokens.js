const updateTokens = (chrome, refreshToken, authToken) => {
  chrome.runtime.sendMessage({
    message: "updateTokens",
    payload: { refreshToken, authToken },
  });
};

export default updateTokens;
