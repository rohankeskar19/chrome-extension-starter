import React, { useState, useEffect, useRef } from "react";
import "./app.css";

import copyIcon from "../icons/extension/add-to-clipboard.svg";
import deleteIcon from "../icons/extension/remove-highlight.svg";
import changeColorIcon from "../icons/extension/change-color.svg";
import addHighlightTextToNoteIcon from "../icons/extension/add-highlight-text-to-note.svg";

import $, { css } from "jquery";
import { Popover, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { Tooltip } from "antd";
import setAuthToken from "../utils/setAuthToken";
import axios from "axios";
import apiUrl from "../utils/getApiUrl";
import isJson from "../utils/isJson";

export const App = ({
  chrome,
  iframeDocument,
  iframeWindow,
  copyHighlightTextProp,
  deleteHighlightProp,
  changeHighlightColorProp,
  addHighlightTextToNoteProp,
}) => {
  const [state, setState] = useState({
    currentHighlight: undefined,
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

        setAuthToken(chrome, authToken, refreshToken, false);
      } else if (request.message == "updateTokens") {
        const authToken = request.authToken;
        const refreshToken = request.refreshToken;
        const uid = request.user.uid;

        setAuthToken(chrome, authToken, refreshToken, false);
      }
    });

    iframeWindow.addEventListener("message", function (e) {
      const dataIsJson = isJson(e.data);
      console.log(e.data);
      if (!dataIsJson) return;
      const data = JSON.parse(e.data);
      const message = data.message;

      console.log(message);

      if (message == "setCurrentHighlight") {
        setState((prevState) => {
          return {
            ...prevState,
            currentHighlight: data.highlightId,
          };
        });
      }
    });
  }, []);

  const copyHighlightText = () => {
    copyHighlightTextProp(state.currentHighlight);
  };

  const deleteHighlight = () => {
    deleteHighlightProp(state.currentHighlight);
  };

  const changeHighlightColor = () => {
    changeHighlightColorProp(state.currentHighlight);
  };

  const addHighlightTextToNote = () => {
    addHighlightTextToNoteProp(state.currentHighlight);
  };

  return (
    <div className="highlight-hover-tool-container">
      <div>
        <img src={copyIcon} onClick={copyHighlightText} />
      </div>
      <div>
        <img src={deleteIcon} onClick={deleteHighlight} />
      </div>
      <div>
        <img src={changeColorIcon} onClick={changeHighlightColor} />
      </div>
      <div>
        <img
          src={addHighlightTextToNoteIcon}
          onClick={addHighlightTextToNote}
        />
      </div>
    </div>
  );
};
