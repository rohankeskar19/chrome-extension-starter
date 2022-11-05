var localDb = {
  saveHighlight: function (chrome, highlight) {
    chrome.storage.local.get({ highlights: {} }, (result) => {
      const highlights = result.highlights;

      if (!highlights[highlight.url]) highlights[highlight.url] = [];

      highlights[highlight.url].push(highlight);
      chrome.storage.local.set({ highlights });
    });
  },
  updateHighlight: function (chrome, highlight) {
    chrome.storage.local.get({ highlights: {} }, (result) => {
      const highlights = result.highlights;

      let urlToUse = highlight.url;

      const highlightsInKey = highlights[urlToUse];
      if (highlightsInKey) {
        highlightsInKey.forEach((localHighlight) => {
          if (localHighlight.id == highlight.id) {
            localHighlight.color = highlight.color;
          }
        });

        chrome.storage.local.set({ highlights });
      }
    });
  },
  deleteHighlight: function (chrome, highlight) {
    chrome.storage.local.get({ highlights: {} }, (result) => {
      const highlights = result.highlights;

      const urlHighlights = highlights[highlight.url];
      for (var i = 0; i < urlHighlights.length; i++) {
        if (urlHighlights[i].id == highlight.id) {
          urlHighlights.splice(i, 1);
        }
      }

      highlights[highlight.url] = urlHighlights;

      chrome.storage.local.set({ highlights });
    });
  },
  removeHighlightsFromPage: function (chrome, url) {
    chrome.storage.local.get({ highlights: {} }, (result) => {
      const highlights = result.highlights;
      delete highlights[url];

      chrome.storage.local.set({ highlights });
    });
  },
  getLocalHighlights: function (chrome, url, cb) {
    chrome.storage.local.get({ highlights: {} }, (result) => {
      const highlights = result.highlights;
      cb(highlights[url]);
    });
  },
  setLocalHighlights: function (chrome, newHighlights, url) {
    chrome.storage.local.get({ highlights: {} }, (result) => {
      const highlights = result.highlights;
      highlights[url] = newHighlights;
      chrome.storage.local.set({ highlights });
    });
  },
};

export default localDb;
