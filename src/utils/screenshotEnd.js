const screenshotEnd = (chrome, shared) => {
  chrome.runtime.sendMessage({ action: "screenshotEnd", shared: shared });
};

export default screenshotEnd;
