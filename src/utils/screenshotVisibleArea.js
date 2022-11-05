const screenshotVisibleArea = (chrome, shared) => {
  chrome.runtime.sendMessage({
    action: "screenshotVisibleArea",
    shared: shared,
  });
};

export default screenshotVisibleArea;
