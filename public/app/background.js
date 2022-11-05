var userLoggedIn = undefined;
var refreshToken = undefined;
var sideToggleTop = undefined;
var autoSaveTweet = undefined;
var appWidths = undefined;
const openTabs = [];
const apiUrl =
  "https://us-central1-notealy-e047c.cloudfunctions.net/notealyApi";
// const apiUrl = "http://localhost:5001/notealy-e047c/us-central1/notealyApi";
const twitterRegex = /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/;

var popupOpen = false;
var currentWindow = undefined;
var shared = {};
var requestOnGoing = false;

chrome.webNavigation.onCompleted.addListener(function ({
  tabId,
  frameId,
  url,
}) {
  // On each page load check if user is logged in, If so then inject the content script
  if (frameId == 0) {
    chrome.storage.local.get("token", function (result) {
      chrome.storage.local.get(
        "autoSaveTweet",
        function (autoSaveTweetResults) {
          chrome.storage.local.get(
            "sideToggleTop",
            function (sideToggleResult) {
              chrome.storage.local.get("appWidths", function (appWidthsResult) {
                if (result.token) {
                  userLoggedIn = result.token.authToken;
                  refreshToken = result.token.refreshToken;
                  sideToggleTop = sideToggleResult.sideToggleTop;
                  autoSaveTweet = autoSaveTweetResults.autoSaveTweet;
                  appWidths = appWidthsResult.appWidths;

                  if (userLoggedIn) {
                    // User is logged in inject all the frontend code
                    // injectCode(tabId, twitterRegex.test(url));

                    injectCode(tabId, false);

                    const userData = parseJwt(userLoggedIn);

                    var newUrl = new URL(url);

                    newUrl = newUrl.hostname;

                    setTimeout(() => {
                      chrome.tabs.sendMessage(
                        tabId,
                        {
                          message: "startApp",
                          user: userData,
                          authToken: userLoggedIn,
                          refreshToken: refreshToken,
                          sideToggleTop: sideToggleTop,
                          autoSaveTweet: autoSaveTweet,
                          appWidth: appWidths ? appWidths[newUrl] : undefined,
                        },
                        {
                          frameId: 0,
                        }
                      );
                    }, 200);
                  }
                }
              });
            }
          );
        }
      );
    });
  }
  return true;
});

chrome.windows.onRemoved.addListener(function (id) {
  console.log("Window closed ", currentWindow.id, id);
  if (currentWindow.id == id) {
    currentWindow = undefined;
  }
});

chrome.storage.local.get("token", function (result) {
  if (result.token) {
    userLoggedIn = result.token.authToken;
    refreshToken = result.token.refreshToken;
  }

  chrome.storage.local.get("sideToggleTop", function (sideToggleResult) {
    sideToggleTop = sideToggleResult.sideToggleTop;

    chrome.action.onClicked.addListener(function (tab) {
      const width = 500;
      const height = 900;

      const left = 200;
      const top = 200;
      if (!userLoggedIn) {
        if (currentWindow == undefined) {
          chrome.windows.create(
            {
              url: "/html/auth.html",
              width: width,
              height: height,
              left: left,
              top: top,
              focused: true,
            },
            (window) => {
              currentWindow = window;
            }
          );
        }
      } else {
        chrome.windows.getCurrent((w) => {
          chrome.tabs.query(
            {
              active: true,
              currentWindow: true,
            },
            function (tabs) {
              const userData = parseJwt(userLoggedIn);
              if (tabs[0]) {
                chrome.tabs.sendMessage(
                  tabs[0].id,
                  {
                    message: "togglePopup",
                    user: userData,
                    authToken: userLoggedIn,
                    refreshToken: refreshToken,
                    sideToggleTop: sideToggleTop,
                  },
                  {
                    frameId: 0,
                  }
                );
              }
            }
          );
        });
      }
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("Message", request.message);
      if (request.message === "login") {
        loginUser(request.payload)
          .then(function (res) {
            if (res.ok) {
              return res.json();
            } else {
              sendResponse({
                message: "error",
              });
            }
          })
          .then(function (data) {
            chrome.storage.local.set({
              sideToggleTop: 182,
            });
            chrome.storage.local.set(
              {
                token: {
                  authToken: data.authToken,
                  refreshToken: data.refreshToken,
                },
              },
              function (result) {
                chrome.windows.remove(currentWindow.id);
                const userData = parseJwt(data.authToken);
                const refreshToken = data.refreshToken;
                userLoggedIn = data.authToken;
                chrome.tabs.query(
                  {
                    active: true,
                    currentWindow: true,
                  },
                  function (tabs) {
                    // if (tabs[0]) {
                    // injectCode(tabs[0].id, twitterRegex.test(tabs[0].url));
                    // setTimeout(() => {
                    //   chrome.tabs.sendMessage(
                    //     tabs[0].id,
                    //     {
                    //       message: "startApp",
                    //       user: userData,
                    //       authToken: userLoggedIn,
                    //       refreshToken: refreshToken,
                    //       sideToggleTop: sideToggleTop,
                    //     },
                    //     {
                    //       frameId: 0,
                    //     }
                    //   );
                    // }, 200);
                    // setTimeout(() => {
                    //   chrome.tabs.sendMessage(
                    //     tabs[0].id,
                    //     {
                    //       message: "togglePopup",
                    //     },
                    //     {
                    //       frameId: 0,
                    //     }
                    //   );
                    // }, 300);
                    // }
                  }
                );
                sendResponse({ message: "success" });
              }
            );
          })
          .catch(function (err) {
            console.log(err);
            sendResponse({ message: "error occurred" });
          });
        return true;
      } else if (request.message === "logout") {
        sendResponse({ message: "success" });
      } else if (request.message === "userStatus") {
        sendResponse({ message: "success" });
      } else if (request.message === "closePopup") {
        const index = getIndexOfTab(sender.tab.id, openTabs);
        openTabs[index].popupOpen = false;
        sendResponse({ message: "success" });
      } else if (request.message === "snapVisible") {
        chrome.tabs.captureVisibleTab(
          null,
          { format: "png" },
          function (dataUrl) {
            sendResponse({ message: "success", payload: { dataUrl: dataUrl } });
          }
        );
        return true;
      } else if (request.message === "snapPage") {
        sendResponse({ message: "success" });
      } else if (request.message === "updateTokens") {
        console.log("Upading tokens ", request.payload);
        chrome.storage.local.set({
          token: {
            ...request.payload,
          },
        });
        const userData = parseJwt(userLoggedIn);

        chrome.tabs.query(
          {
            currentWindow: true,
          },
          function (tabs) {
            tabs.forEach((tab) => {
              chrome.tabs.sendMessage(tab.id, {
                message: "updateTokens",
                refreshToken: request.payload.refreshToken,
                authToken: request.payload.authToken,
                user: userData,
              });
            });
          }
        );

        sendResponse({ message: "success" });
      } else if (request.message == "setAutoSaveTweet") {
        chrome.storage.local.set({
          autoSaveTweet: request.checked,
        });

        sendResponse({ message: "success" });
      } else if (request.message === "clearTokens") {
        const width = 500;
        const height = 900;
        const left = 200;
        const top = 200;
        userLoggedIn = undefined;

        chrome.storage.local.get("token", function (result) {
          if (result.token != undefined) {
            const decodedToken = parseJwt(result.token.refreshToken);

            chrome.storage.local.remove("highlights");
            chrome.storage.local.remove("token");
            chrome.windows.create(
              {
                url: "/html/auth.html",
                width: width,
                height: height,
                left: left,
                top: top,
                focused: true,
              },
              (window) => {
                currentWindow = window;
                chrome.windows.onRemoved.addListener(function (id) {
                  if (currentWindow?.id == id) {
                    currentWindow = undefined;
                  }
                });
              }
            );
          }
        });
      } else if (request.message == "renewToken") {
        const { authToken, refreshToken } = request.payload;

        if (requestOnGoing) {
          return false;
        }

        chrome.storage.local.get("token", function (result) {
          if (result.token) {
            const decodedToken = parseJwt(result.token.refreshToken);

            if (Date.now() >= decodedToken.exp * 1000) {
              console.log(
                "Token expired, renewToken",
                result.token.refreshToken == refreshToken &&
                  result.token.authToken == authToken
              );
              if (
                result.token.refreshToken == refreshToken &&
                result.token.authToken == authToken
              ) {
                requestOnGoing = true;
                userLoggedIn = undefined;
                renewToken(refreshToken, authToken)
                  .then((res) => {
                    if (res.ok) {
                      return res.json();
                    } else {
                      return res.text().then((text) => {
                        throw new Error(text);
                      });
                    }
                  })
                  .then((data) => {
                    requestOnGoing = false;

                    sendResponse({
                      authToken: data.authToken,
                      refreshToken: data.refreshToken,
                    });
                    chrome.storage.local.set(
                      {
                        token: {
                          authToken: data.authToken,
                          refreshToken: data.refreshToken,
                        },
                      },
                      function (result) {
                        chrome.tabs.query(
                          {
                            currentWindow: true,
                          },
                          function (tabs) {
                            const userData = parseJwt(data.refreshToken);

                            tabs.forEach((tab) => {
                              chrome.tabs.sendMessage(tab.id, {
                                message: "updateTokens",
                                refreshToken: data.refreshToken,
                                authToken: data.authToken,
                                user: userData,
                              });
                            });
                          }
                        );
                      }
                    );
                  })
                  .catch((err) => {
                    requestOnGoing = false;

                    const error = JSON.parse(err.message);

                    if (error.error == "Invalid request") {
                      const width = 500;
                      const height = 900;
                      const left = 200;
                      const top = 200;
                      chrome.storage.local.remove("highlights");
                      chrome.storage.local.remove("token");
                      chrome.windows.create(
                        {
                          url: "/html/auth.html",
                          width: width,
                          height: height,
                          left: left,
                          top: top,
                          focused: true,
                        },
                        (window) => {
                          currentWindow = window;
                        }
                      );
                    }
                  });
                return true;
              }
            }
          }
        });
      } else if (request.message == "updateSideToggleTop") {
        chrome.storage.local.set({
          sideToggleTop: request.payload,
        });
      } else if (request.message == "updateAppWidth") {
        chrome.storage.local.get("appWidths", function (result) {
          const appWidths = result.appWidths;
          const url = request.payload.url;

          chrome.storage.local.set({
            appWidths: {
              ...appWidths,
              [url]: request.payload.width,
            },
          });
        });
      }
      sendResponse({});
    });
  });
});

function loginUser(userInfo) {
  return fetch(`${apiUrl}/auth/login`, {
    body: JSON.stringify(userInfo),
    headers: {
      "Content-Type": "application/json",
    },
    method: "post",
  });
}

function registerUser(userInfo) {
  return fetch(`${apiUrl}/auth/register`, {
    body: JSON.stringify(userInfo),
    headers: {
      "Content-Type": "application/json",
    },
    method: "post",
  });
}

function renewToken(refreshToken, authToken) {
  return fetch(`${apiUrl}/auth/renewToken`, {
    body: JSON.stringify({ refreshToken, authToken }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "post",
  });
}

function parseJwt(authToken) {
  var base64Url = authToken.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

function getTabFromOpenTabs(id, tabs) {
  var tabToReturn = undefined;
  tabs.forEach((tab) => {
    if (id == tab.id) {
      tabToReturn = tab;
    }
  });
  return tabToReturn;
}

function getIndexOfTab(id, tabs) {
  var index = 0;
  tabs.forEach((tab) => {
    if (id == tab.id) {
      index = tabs.indexOf(tab);
    }
  });
  return index;
}

var Screenshotter = {
  imageDataURL: [],
  imageDataURLPartial: [],
  shared: {
    imageDirtyCutAt: 0,
    imageDataURL: 0,

    originalScrollTop: 0,

    tab: {
      id: 0,
      url: "",
      title: "",
      hasVscrollbar: false,
    },
  },

  // ****************************************************************************************** SCREENSHOT SEQUENCE START

  // 0
  grab: function (e) {
    /****************************************************************************************************
     * It's a chaos: the ball must bounce between background and script content since the first
     * can grab and the second can access the DOM (scroll)
     *
     * So the call stack is:
     *    grab (bg)
     *      screenshotBegin (script)
     *      loop {
     *        screenshotVisibleArea (bg)
     *        screenshotScroll (script)
     *      }
     *      screenshotEnd (bg)
     *      screenshotReturn (script)
     */

    var self = this;
    // ****** Reset screenshot container

    this.imageDataURLPartial = [];

    // ****** Get tab data

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      function (tabs) {
        var tab = tabs[0];
        self.shared.tab = tab;
        // ****** Begin!
        chrome.tabs.sendMessage(self.shared.tab.id, {
          action: "blanketStyleSet",
          property: "position",
          from: "fixed",
          to: "absolute",
        });
        self.screenshotBegin(self.shared);
      }
    );
    // chrome.windows.getCurrent(function (win) {
    //   chrome.tabs.query({ active: true, windowId: win.id }, function (tabs) {
    //     var tab = tabs[0];
    //     self.shared.tab = tab;

    //     // ****** Begin!
    //     chrome.tabs.sendMessage(self.shared.tab.id, {
    //       action: "blanketStyleSet",
    //       property: "position",
    //       from: "fixed",
    //       to: "absolute",
    //     });
    //     self.screenshotBegin(self.shared);
    //   });
    // });
  },

  // 1
  screenshotBegin: function (shared) {
    chrome.tabs.sendMessage(this.shared.tab.id, {
      action: "screenshotBegin",
      shared: shared,
    });
  },

  // 2
  screenshotVisibleArea: function (shared) {
    var self = this;
    chrome.tabs.captureVisibleTab(
      null,
      { format: "png", quality: 80 },
      function (dataUrl) {
        if (dataUrl) {
          // Grab successful
          self.imageDataURLPartial.push(dataUrl);
          self.screenshotScroll(shared);
        } else {
          // Use this if you want to show error if the code failes to grab screenshot
          return false;
        }
      }
    );
  },

  // 3
  screenshotScroll: function (shared) {
    chrome.tabs.sendMessage(this.shared.tab.id, {
      action: "screenshotScroll",
      shared: shared,
    });
  },

  // 4
  screenshotEnd: function (shared) {
    var self = this;

    this.recursiveImageMerge(
      this.imageDataURLPartial,
      shared.imageDirtyCutAt,
      shared.tab.hasVscrollbar,
      function (image) {
        shared.imageDataURL = image;
        self.screenshotReturn(shared);
      }
    );
  },

  // 5
  screenshotReturn: function (shared) {
    chrome.tabs.sendMessage(this.shared.tab.id, {
      action: "blanketStyleRestore",
      property: "position",
    });
    chrome.tabs.sendMessage(this.shared.tab.id, {
      message: "screenshotReturn",
      shared: shared,
    });
  },

  // ****************************************************************************************** EVENT MANAGER / HALF
  eventManagerInit: function () {
    /****************************************************************************************************
     * This function prepares the internal plugin callbacks to bounce between the plugin and DOM side.
     * It's initialized at the end of this file.
     */
    var self = this;
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      switch (request.action) {
        case "grab":
          self.grab();
          break;
        case "screenshotVisibleArea":
          self.screenshotVisibleArea(request.shared);
          break;
        case "screenshotEnd":
          self.screenshotEnd(request.shared);
          break;
      }
      return true;
    });
  },

  // ****************************************************************************************** SUPPORT
  recursiveImageMerge: function (
    imageDataURLs,
    imageDirtyCutAt,
    hasVscrollbar,
    callback,
    images,
    i
  ) {
    /****************************************************************************************************
     * This function merges together all the pieces gathered during the scroll, recursively.
     * Returns a single data:// URL object from canvas.toDataURL("image/png") to the callback.
     */
    var fx = arguments.callee;
    i = i || 0;
    images = images || [];

    if (i < imageDataURLs.length) {
      images[i] = new Image();
      images[i].onload = function () {
        imageDataURLs[i] = null; // clear for optimize memory consumption (not sure)
        if (i == imageDataURLs.length - 1) {
          // ****** We're at the end of the chain, let's have fun with canvas.
          var canvas = OffscreenCanvas(100, 1);

          // NOTE: Resizing a canvas is destructive, we can do it just now before stictching
          canvas.width = images[0].width - (hasVscrollbar ? 15 : 0); // <-- manage V scrollbar

          if (images.length > 1)
            canvas.height =
              (imageDataURLs.length - 1) * images[0].height + imageDirtyCutAt;
          else canvas.height = images[0].height;

          // Ouch: Skia / Chromium limitation
          // https://bugs.chromium.org/p/chromium/issues/detail?id=339725
          // https://bugs.chromium.org/p/skia/issues/detail?id=2122
          if (canvas.height > 32766) canvas.height = 32766;

          // ****** Stitch
          for (var j = 0; j < images.length; j++) {
            var cut = 0;
            if (images.length > 1 && j == images.length - 1)
              cut = images[j].height - imageDirtyCutAt;

            var height = images[j].height - cut;
            var width = images[j].width;

            canvas
              .getContext("2d")
              .drawImage(
                images[j],
                0,
                cut,
                width,
                height,
                0,
                j * images[0].height,
                width,
                height
              );
          }

          callback(canvas.toDataURL("image/png")); // --> CALLBACK (note that the file type is used also in the drag function)
        } else {
          // ****** Down!
          fx(
            imageDataURLs,
            imageDirtyCutAt,
            hasVscrollbar,
            callback,
            images,
            ++i
          );
        }
      };
      images[i].src = imageDataURLs[i]; // Load!
    }
  },
};

/* \/ Initialize callback listeners */
Screenshotter.eventManagerInit();

function injectCode(tabId, injectTwitter) {
  // "js": ["/static/js/content.js"]

  chrome.scripting.executeScript({
    target: {
      tabId,
    },
    files: ["/static/js/content.js"],
    // allFrames: false,
    // runAt: "document_start",
    // frameId: 0,
  });
}
