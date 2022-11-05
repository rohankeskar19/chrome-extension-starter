const renewToken = (chrome, authToken, refreshToken, cb) => {
  chrome.runtime.sendMessage(
    {
      message: "renewToken",
      payload: { refreshToken, authToken },
    },
    function (response) {
      cb(response);
    }
  );
};

export default renewToken;
