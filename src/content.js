/*global chrome*/
/* src/content.js */

import React from "react";
import ReactDOM from "react-dom";
import Frame, { FrameContextConsumer } from "react-frame-component";
import $ from "jquery";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import "antd/dist/antd.min.css";
import "./index.css";

import App from "./App";
import { App as PageModalApp } from "./PageModal/App/App";
import { App as SideToggle } from "./SideToggle/App";
import { App as HighlightTool } from "./HighlightTool/App";
import { App as HighlightHoverTool } from "./HighlightHoverTool/App";

import interact from "interactjs";
import screenshotBegin from "./utils/screenshotBegin";
import screenshotScroll from "./utils/screenshotScroll";
import screenshotReturn from "./utils/screenshotReturn";
import initializeHighlightTool from "./utils/highlightTool";
import localDb from "./HighlightTool/utils/localDb";
import onHighlightMouseEnterOrClick from "./HighlightTool/utils/onHighlightMouseEnterOrClick";
import api from "./HighlightTool/utils/api";
import rgb2hex from "./HighlightTool/utils/rgb2hex";
import isJson from "./utils/isJson";

require("jquery-ui/ui/widgets/draggable");

var currentImage = undefined;
var previousElement = undefined;
var image1 = undefined;
var image2 = undefined;
var saveButtonsRemoved = false;
var appInitialized = false;
var currentBlockId = undefined;
var saveButtonsRemoved = false;

var saveToLibraryButton = document.createElement("span");
var addToNote = document.createElement("span");

class Main extends React.Component {
  render() {
    return (
      <Frame
        head={[
          <link
            type="text/css"
            rel="stylesheet"
            href={chrome.runtime.getURL("/static/css/content.css")}
          ></link>,
          <link rel="preconnect" href={"https://fonts.googleapis.com"}></link>,
          <link rel="preconnect" href={"https://fonts.gstatic.com"}></link>,
          <link
            rel="stylesheet"
            href={
              "https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter:wght@200;400;600&family=Merriweather:ital,wght@0,400;1,700&family=Roboto+Mono:ital,wght@0,400;1,700&display=swap"
            }
          ></link>,
        ]}
      >
        <FrameContextConsumer>
          {({ document, window }) => {
            return (
              <App
                iframeDocument={document}
                window={window}
                isExt={true}
                chrome={chrome}
                removeApp={removeApp}
              />
            );
          }}
        </FrameContextConsumer>
      </Frame>
    );
  }
}

class ModalContainer extends React.Component {
  render() {
    return (
      <Frame
        head={[
          <link
            type="text/css"
            rel="stylesheet"
            href={chrome.runtime.getURL("/static/css/content.css")}
          ></link>,
          <link rel="preconnect" href={"https://fonts.googleapis.com"}></link>,
          <link rel="preconnect" href={"https://fonts.gstatic.com"}></link>,
          <link
            rel="stylesheet"
            href={
              "https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter:wght@200;400;600&family=Merriweather:ital,wght@0,400;1,700&family=Roboto+Mono:ital,wght@0,400;1,700&display=swap"
            }
          ></link>,
        ]}
      >
        <FrameContextConsumer>
          {({ document, window }) => {
            return (
              <PageModalApp
                document={document}
                window={window}
                isExt={true}
                chrome={chrome}
                removeApp={removeApp}
              />
            );
          }}
        </FrameContextConsumer>
      </Frame>
    );
  }
}

class SideToggleContainer extends React.Component {
  render() {
    return (
      <Frame
        head={[
          <link
            type="text/css"
            rel="stylesheet"
            href={chrome.runtime.getURL("/static/css/content.css")}
          ></link>,
          <link rel="preconnect" href={"https://fonts.googleapis.com"}></link>,
          <link rel="preconnect" href={"https://fonts.gstatic.com"}></link>,
          <link
            rel="stylesheet"
            href={
              "https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter:wght@200;400;600&family=Merriweather:ital,wght@0,400;1,700&family=Roboto+Mono:ital,wght@0,400;1,700&display=swap"
            }
          ></link>,
        ]}
      >
        <FrameContextConsumer>
          {({ document, window }) => {
            return (
              <SideToggle
                chrome={chrome}
                iframeDocument={document}
                iframeWindow={window}
                collapseSideToggleContainer={collapseSideToggleContainer}
                showSaveButtons={addSaveButtons}
                hideSaveButtons={removeSaveButtons}
                isExt={true}
              />
            );
          }}
        </FrameContextConsumer>
      </Frame>
    );
  }
}

class HighlightToolContainer extends React.Component {
  render() {
    return (
      <Frame
        head={[
          <link
            type="text/css"
            rel="stylesheet"
            href={chrome.runtime.getURL("/static/css/content.css")}
          ></link>,
          <link rel="preconnect" href={"https://fonts.googleapis.com"}></link>,
          <link rel="preconnect" href={"https://fonts.gstatic.com"}></link>,
          <link
            rel="stylesheet"
            href={
              "https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter:wght@200;400;600&family=Merriweather:ital,wght@0,400;1,700&family=Roboto+Mono:ital,wght@0,400;1,700&display=swap"
            }
          ></link>,
        ]}
      >
        <FrameContextConsumer>
          {({ document, window }) => {
            return (
              <HighlightTool
                chrome={chrome}
                iframeDocument={document}
                iframeWindow={window}
                isExt={true}
              />
            );
          }}
        </FrameContextConsumer>
      </Frame>
    );
  }
}

class HighlightHoverToolContainer extends React.Component {
  render() {
    return (
      <Frame
        head={[
          <link
            type="text/css"
            rel="stylesheet"
            href={chrome.runtime.getURL("/static/css/content.css")}
          ></link>,
          <link rel="preconnect" href={"https://fonts.googleapis.com"}></link>,
          <link rel="preconnect" href={"https://fonts.gstatic.com"}></link>,
          <link
            rel="stylesheet"
            href={
              "https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter:wght@200;400;600&family=Merriweather:ital,wght@0,400;1,700&family=Roboto+Mono:ital,wght@0,400;1,700&display=swap"
            }
          ></link>,
        ]}
      >
        <FrameContextConsumer>
          {({ document, window }) => {
            return (
              <HighlightHoverTool
                chrome={chrome}
                iframeDocument={document}
                iframeWindow={window}
                isExt={true}
                copyHighlightTextProp={copyHighlightText}
                deleteHighlightProp={deleteHighlight}
                changeHighlightColorProp={changeHighlightColor}
                addHighlightTextToNoteProp={addHighlightTextToNote}
              />
            );
          }}
        </FrameContextConsumer>
      </Frame>
    );
  }
}

const app = document.createElement("div");
app.id = "notealy-extension-root";

const pageModalApp = document.createElement("div");
pageModalApp.id = "notealy-modal-iframe-container";

const sideToggleContainer = document.createElement("div");
sideToggleContainer.id = "notealy-side-toggle-iframe-container";

const highlightToolContainer = document.createElement("div");
highlightToolContainer.id = "notealy-highlight-tool-iframe-container";

const highlightHoverToolContainer = document.createElement("div");
highlightHoverToolContainer.id =
  "notealy-highlight-hover-tool-iframe-container";

const resizeHandle = document.createElement("div");
resizeHandle.id = "resize-handle";
resizeHandle.classList.add("ui-resizable-handle");
resizeHandle.classList.add("ui-resizable-w");

document.body.appendChild(app);
document.body.appendChild(pageModalApp);
document.body.appendChild(sideToggleContainer);
document.body.appendChild(highlightToolContainer);
document.body.appendChild(highlightHoverToolContainer);

app.style.display = "none";
pageModalApp.style.display = "none";

ReactDOM.render(<Main />, app);
ReactDOM.render(<ModalContainer />, pageModalApp);
ReactDOM.render(<SideToggleContainer />, sideToggleContainer);
ReactDOM.render(<HighlightToolContainer />, highlightToolContainer);
ReactDOM.render(<HighlightHoverToolContainer />, highlightHoverToolContainer);

app.appendChild(resizeHandle);

initializeHighlightTool();

sideToggleContainer.addEventListener("mouseenter", function (e) {
  $("#notealy-side-toggle-iframe-container").css("height", "200px");
  $("#notealy-side-toggle-iframe-container").css("width", "300px");
});

sideToggleContainer.addEventListener("mouseleave", function (e) {
  $("#notealy-side-toggle-iframe-container").css("height", "50px");
  $("#notealy-side-toggle-iframe-container").css("width", "45px");
});

$("#notealy-side-toggle-iframe-container").draggable({
  handle: "#notealy-side-toggle-iframe-container",
  axis: "y",
  containment: "window",
  stop: function (event) {
    // if (event.type === "dragstop") {
    //   var topOff = $(this).offset().top - $(window).scrollTop();
    //   $(this).css("top", topOff);
    // }
    // $(this).css("position", "fixed");
    // const top = $(this).offset().top;
    // chrome.runtime.sendMessage({
    //   message: "updateSideToggleTop",
    //   payload: top,
    // });
  },
});

function collapseSideToggleContainer() {
  $("#notealy-side-toggle-iframe-container").css("height", "50px");
  $("#notealy-side-toggle-iframe-container").css("width", "45px");
}

function dragMoveListener(event) {
  var target = event.target;
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
  var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

  // translate the element
  target.style.transform = "translate(" + x + "px, " + y + "px)";

  // update the posiion attributes
  target.setAttribute("data-x", x);
  target.setAttribute("data-y", y);
}

// this function is used later in the resizing and gesture demos

interact("#notealy-extension-root")
  .resizable({
    edges: { left: true, right: false, bottom: false, top: false },
    listeners: {
      move(event) {
        var target = event.target;
        var x = parseFloat(target.getAttribute("data-x")) || 0;
        var y = parseFloat(target.getAttribute("data-y")) || 0;

        // update the element's style
        target.style.width = event.rect.width + "px";
        target.style.height = event.rect.height + "px";
      },

      stop(event) {},
    },
  })
  .on("resizeend", function () {
    var width = $("#notealy-extension-root").css("width");

    const url = window.location.hostname;

    chrome.runtime.sendMessage({
      message: "updateAppWidth",
      payload: {
        url: url,
        width: width,
      },
    });
  });

function toggle() {
  if (app.style.display === "none") {
    app.style.display = "block";
  } else {
    app.style.display = "none";
  }
}

function removeApp() {
  document.body.removeChild(app);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message == "screenshotReturn") {
    const originalScrollTop = request.shared.originalScrollTop;
    var scrollNode = document.scrollingElement || document.documentElement;
    scrollNode.scrollTop = originalScrollTop;
    $("#notealy-modal-iframe-container").css("display", "block");
    const modalIframeContainer = $(
      "#notealy-modal-iframe-container > iframe"
    )[0];
    modalIframeContainer.contentWindow.postMessage(
      JSON.stringify({
        shared: request.shared,
        blockId: currentBlockId,
        message: "snapPage",
      }),
      "*",
      []
    );
    addSaveButtons();
    currentBlockId = undefined;
    $("#notealy-side-toggle-iframe-container").css("display", "block");
    sendResponse({ message: "success" });
  }
});

window.addEventListener("message", (e) => {
  const appIframeContainer = $("#notealy-extension-root > iframe")[0];
  if (appIframeContainer) {
    const dataIsJson = isJson(e.data);
    if (!dataIsJson) return;
    const data = JSON.parse(e.data);
    if (data) {
      const message = data.message;

      if (message == "snapPage") {
        const id = data.blockId;
        currentBlockId = id;
        $("#notealy-side-toggle-iframe-container").css("display", "none");
        $("#notealy-extension-root").css("display", "none");
        $("#notealy-modal-iframe-container").css("display", "none");
        removeSaveButtons();
        setTimeout(function () {
          chrome.runtime.sendMessage({
            action: "grab",
          });
        }, 100);
      } else if (message == "snapVisible") {
        const id = data.blockId;
        $("#notealy-side-toggle-iframe-container").css("display", "none");
        $("#notealy-extension-root").css("display", "none");
        $("#notealy-modal-iframe-container").css("display", "none");
        removeSaveButtons();

        setTimeout(function () {
          chrome.runtime.sendMessage(
            {
              message: "snapVisible",
            },
            function (response) {
              addSaveButtons();
              if (response.message === "success") {
                const dataUrl = response.payload.dataUrl;
                appIframeContainer.contentWindow.postMessage(
                  JSON.stringify({
                    message: "setImageForBlock",
                    image: dataUrl,
                    blockId: id,
                  }),
                  "*",
                  []
                );

                $("#notealy-extension-root").css("display", "block");
                $("#notealy-side-toggle-iframe-container").css(
                  "display",
                  "block"
                );
              }
            }
          );
        }, 100);
      }
    }
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "togglePopup") {
    toggle();
  } else if (request.message == "startApp") {
    const appWidth = request.appWidth;

    if (appWidth) {
      app.style.width = appWidth;
    }
  }
  if (request.action == "screenshotBegin") {
    screenshotBegin(chrome, request.shared);
  } else if (request.action == "screenshotScroll") {
    screenshotScroll(chrome, request.shared);
  } else if (request.action == "screenshotReturn") {
    screenshotReturn(request.shared);
  }
  sendResponse(true);
});

document.addEventListener("click", function (e) {
  const target = e.target;

  if (!target.classList.contains("notealy-highlighter-highlighted")) {
    $("#notealy-highlight-hover-tool-iframe-container").hide();
  }
});

function copyHighlightText(highlightId) {
  const highlights = document.querySelectorAll(
    `.notealy-highlighter-highlighted[data-highlight-id='${highlightId}']`
  );
  $("#notealy-highlight-hover-tool-iframe-container").hide();

  const highlightText = Array.from(highlights)
    .map((el) => el.textContent.replace(/\s+/gmu, " "))
    .join(""); // clean up whitespace
  navigator.clipboard.writeText(highlightText);
}

function deleteHighlight(highlightId) {
  const highlights = $(
    `.notealy-highlighter-highlighted[data-highlight-id='${highlightId}']`
  );
  $("#notealy-highlight-hover-tool-iframe-container").hide();

  highlights.css("backgroundColor", "inherit"); // Change the background color attribute
  // highlights.removeClass(HIGHLIGHT_CLASS).addClass(DELETED_CLASS); // Change the class name to the 'deleted' version

  localDb.deleteHighlight(chrome, {
    id: highlightId,
    url: window.location.href,
  });

  highlights.each((_, el) => {
    // Finally, remove the event listeners that were attached to this highlight element
    el.removeEventListener("click", onHighlightMouseEnterOrClick);

    $(el).contents().unwrap();
  });

  api.deleteHighlight(highlightId);
}

function changeHighlightColor(highlightId) {
  const highlights = $(
    `.notealy-highlighter-highlighted[data-highlight-id='${highlightId}']`
  );
  const colors = [
    "#FFEF9B",
    "#FF9090",
    "#FFA98D",
    "#B1E8FF",
    "#CCA5FF",
    "#B9FF98",
  ];
  const currentColor = rgb2hex(highlights[0].style.backgroundColor);
  const newColor =
    colors[(colors.indexOf(currentColor.toUpperCase()) + 1) % colors.length];
  highlights.css("backgroundColor", newColor); // Change the background color attribute

  localDb.updateHighlight(chrome, {
    id: highlightId,
    color: newColor,
    url: window.location.href,
  }); // update the value in the local storage

  api.updateHighlight({
    id: highlightId,
    color: newColor,
    url: window.location.href,
  });
}

function addHighlightTextToNote(highlightId) {
  const highlights = document.querySelectorAll(
    `.notealy-highlighter-highlighted[data-highlight-id='${highlightId}']`
  );
  const highlightText = Array.from(highlights)
    .map((el) => el.textContent.replace(/\s+/gmu, " "))
    .join(""); // clean up whitespace
  //   @TODO - Write code to add the text to current note
  const appIframe = $("#notealy-extension-root > iframe")[0];

  appIframe.contentWindow.postMessage(
    JSON.stringify({
      message: "addTextToNote",
      text: highlightText,
    }),
    "*",
    []
  );
}

const injectSaveButtons = () => {
  saveToLibraryButton.id = "notealy-save-button";
  addToNote.id = "notealy-addtonote-button";

  addToNote.setAttribute(
    "style",
    "width: 25px !important; height: 25px !important; display: none !important; left: 0 !important; top: 0 !important;"
  );

  saveToLibraryButton.setAttribute(
    "style",
    "width: auto !important; height: 25px !important; display: none !important; left: 0 !important; top: 0 !important;"
  );

  saveToLibraryButton.innerHTML +=
    "<span style='width: 100% !important; padding: 1px !important; font-size: 12px !important;' id='notealy-nested-button'>Save image</span>";

  const interFontLink = document.createElement("link");
  interFontLink.href =
    "https://fonts.googleapis.com/css2?family=Inter&display=swap";

  interFontLink.rel = "stylesheet";
  document.head.appendChild(interFontLink);

  image2 = document.createElement("img");
  image2.src = chrome.runtime.getURL("/plus.svg");

  image2.style.width = "13px";
  image2.setAttribute("style", "width: 13px !important; margin: 0 auto;");
  image2.id = "notealy-image";

  addToNote.append(image2);

  document.body.appendChild(saveToLibraryButton);
  document.body.appendChild(addToNote);
  $(document.body).mouseover(handleMouseHover);

  window.onscroll = function () {
    adjustButtonPosition();
  };

  $("img").mouseenter(handleMouseEnter);

  // $("img").mouseleave(handleMouseLeave);

  saveToLibraryButton.addEventListener("click", function (e) {
    var imageUrlToSend = "";
    if (typeof currentImage.currentSrc === "undefined") {
      imageUrlToSend = currentImage.src
        ? currentImage.src
        : currentImage.srcset;
    } else {
      imageUrlToSend = currentImage.currentSrc;
    }
    saveImageFromUrlToLibrary(imageUrlToSend);
  });

  addToNote.addEventListener("click", function (e) {
    const appIframeContainer = $("#notealy-extension-root > iframe")[0];
    appIframeContainer.contentWindow.postMessage(
      JSON.stringify({
        message: "addImageToNote",
        imageUrl: currentImage.src,
        width: currentImage.width,
        height: currentImage.height,
      }),
      "*",
      []
    );
  });
};

function adjustButtonPosition() {
  if (!saveButtonsRemoved) {
    if (
      previousElement != image2 &&
      $(previousElement).width() > 100 &&
      $(previousElement).height() > 100
    ) {
      showSaveButtons(previousElement);
    }
  }
}

function handleMouseEnter(e) {
  if (!saveButtonsRemoved) {
    if (
      e.target != image2 &&
      $(e.target).width() > 100 &&
      $(e.target).height() > 100
    ) {
      previousElement = e.target;
      showSaveButtons(e.target);
    }
  }
}

function handleMouseLeave(e) {
  if (!saveButtonsRemoved) {
    const target = e.toElement || e.relatedTarget;
    if (isWithinBounds(e)) {
    } else {
      if (target) {
        if (target.id) {
          const saveToLibraryButtonId = saveToLibraryButton
            ? saveToLibraryButton.id
            : undefined;

          const addToNoteId = addToNote ? addToNote.id : undefined;

          const image2Id = image2 ? image2.id : undefined;

          if (
            target.id != saveToLibraryButtonId &&
            target.id != addToNoteId &&
            target.id != image2Id &&
            target.id != "notealy-nested-button"
          ) {
            hideSaveButtons();
          }
        } else {
          hideSaveButtons();
        }
      } else {
        hideSaveButtons();
      }
    }
  }
}

function handleMouseHover(e) {
  if (!saveButtonsRemoved) {
    const target = e.toElement || e.relatedTarget;
    if (target.id) {
      const saveToLibraryButtonId = saveToLibraryButton
        ? saveToLibraryButton.id
        : undefined;

      const addToNoteId = addToNote ? addToNote.id : undefined;

      const image2Id = image2 ? image2.id : undefined;

      if (
        target.id != saveToLibraryButtonId &&
        target.id != addToNoteId &&
        target.id != image2Id &&
        target.id != "notealy-nested-button" &&
        target != currentImage
      ) {
        hideSaveButtons();
      }
    } else {
      if (target.tagName != "IMG") {
        if (target != currentImage && !isWithinBounds(e)) {
          hideSaveButtons();
        }
      }
    }
  }
}

/*-----------------------------------------------------------------------------------------------*/
// Utility functions
function isWithinBounds(e) {
  if (currentImage != undefined) {
    const mouseX = e.pageX;
    const mouseY = e.pageY;
    var B = $(currentImage);
    var O = B.offset();

    var box_area = {
      x1: O.left,
      y1: O.top,
      x2: O.left + B.width(),
      y2: O.top + B.height(),
    };
    var C = [mouseX, mouseY];
    var B = box_area;

    if (C[0] >= B.x1 && C[0] <= B.x2) {
      if (C[1] >= B.y1 && C[1] <= B.y2) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

const hideSaveButtons = () => {
  saveToLibraryButton.style.display = "none";
  addToNote.style.display = "none";
  currentImage = undefined;
};

const showSaveButtons = (element) => {
  if (saveButtonsRemoved) return;

  var rect = element.getBoundingClientRect();
  currentImage = element;

  addToNote.style.left = rect.left + 10 + "px";
  addToNote.style.top = rect.top + 10 + "px";
  addToNote.style.display = "flex";

  saveToLibraryButton.style.left = rect.right - 100 + "px";
  saveToLibraryButton.style.top = rect.top + 10 + "px";
  saveToLibraryButton.style.display = "flex";
};

if (document.readyState == "complete" && !appInitialized) {
  appInitialized = true;
  injectSaveButtons();
}

var targetNode = document.body;
var config = { childList: true, subtree: true };

var callback = function (mutationsList, observer) {
  $(document.body).off("mouseover");
  $(window).off("scroll");

  $("img").off("mouseenter");
  $("img").off("mouseleave");

  $(document.body).mouseover(handleMouseHover);

  $("img").mouseenter(handleMouseEnter);

  $("img").mouseleave(handleMouseLeave);
};
var observer = new MutationObserver(callback);
if (targetNode) observer.observe(targetNode, config);

const saveImageFromUrlToLibrary = (url) => {
  $("#notealy-extension-root").css("display", "none");
  $("#notealy-modal-iframe-container").css("display", "block");

  const modalIframeContainer = $("#notealy-modal-iframe-container > iframe")[0];

  modalIframeContainer.contentWindow.postMessage(
    JSON.stringify({
      image: url,
      message: "snapVisibleLibraryModal",
    }),
    "*",
    []
  );
};

function removeSaveButtons() {
  hideSaveButtons();
  saveButtonsRemoved = true;
}

function addSaveButtons() {
  saveButtonsRemoved = false;
}
