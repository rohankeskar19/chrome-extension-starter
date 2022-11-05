import React, { useState, useEffect, useRef } from "react";
import "./app.css";

import setAuthToken from "../utils/setAuthToken";
import apiUrl from "../utils/getApiUrl";
import addTextToNoteIcon from "../icons/extension/add-text-to-note.svg";
import $ from "jquery";
import store from "./utils/store";
import highlight from "./utils/highlight";
import api from "./utils/api";
import localDb from "./utils/localDb";
import loadAll from "./utils/loadAll";

export const App = ({ chrome, iframeDocument, iframeWindow }) => {
  const [state, setState] = useState({
    colors: ["#FFEF9B", "#FF9090", "#FFA98D", "#B1E8FF", "#CCA5FF", "#B9FF98"],
    highlights: [],
  });

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (request.message == "startApp") {
        const refreshToken = request.refreshToken;
        const authToken = request.authToken;
        setAuthToken(chrome, authToken, refreshToken, true);
        api
          .getHighlights()
          .then((res) => {
            const currentHighlights = res.data;
            loadAll(currentHighlights);
            setState((prevState) => {
              return {
                ...prevState,
                highlights: currentHighlights,
              };
            });
            localDb.setLocalHighlights(
              chrome,
              currentHighlights,
              window.location.href
            );
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (request.message == "updateTokens") {
        const authToken = request.authToken;
        const refreshToken = request.refreshToken;

        setAuthToken(chrome, authToken, refreshToken, true);
      }
    });

    localDb.getLocalHighlights(chrome, window.location.href, (highlights) => {
      if (highlights) {
        setState((prevState) => {
          return {
            ...prevState,
            highlights: highlights,
          };
        });
        loadAll(highlights);
      }
    });
  }, []);

  const addTextToNote = (e) => {
    e.preventDefault();
    const appIframe = $("#notealy-extension-root > iframe")[0];

    const selection = window.getSelection();
    const highlightText = selection.toString();

    appIframe.contentWindow.postMessage(
      JSON.stringify({
        message: "addTextToNote",
        text: highlightText,
      }),
      "*",
      []
    );
  };

  const highlightText = (e, color) => {
    e.preventDefault();

    $("#notealy-highlight-tool-iframe-container").css("display", " none");
    const selection = window.getSelection();
    const selectionString = selection.toString();

    if (selectionString) {
      // If there is text selected
      let container = selection.getRangeAt(0).commonAncestorContainer;

      // Sometimes the element will only be text. Get the parent in that case
      // TODO: Is this really necessary?
      while (!container.innerHTML) {
        container = container.parentNode;
      }

      store(
        chrome,
        selection,
        container,
        window.location.href,
        color,
        (highlightIndex) => {
          highlight(
            selectionString,
            container,
            selection,
            color,
            highlightIndex
          );
        }
      );
    }
  };

  return (
    <div className="highlight-tool-container">
      {state.colors.map((color) => (
        <span
          style={{ backgroundColor: color }}
          className="highlight-tool-color-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => highlightText(e, color)}
        ></span>
      ))}
      <img
        src={addTextToNoteIcon}
        onMouseDown={(e) => e.preventDefault()}
        onClick={addTextToNote}
      />
    </div>
  );
};
