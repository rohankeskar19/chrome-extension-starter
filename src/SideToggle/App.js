import React, { useState, useEffect, useRef } from "react";
import "./app.css";
import notealyLogo from "../icons/notealy-logo.svg";
import appToggleIcon from "../icons/extension/side-toggle-app-toggle-icon.svg";
import screenshotToolLogo from "../icons/extension/side-toggle-screenshot-tool.svg";
import savePageLogo from "../icons/extension/article_logo.svg";
import $, { css } from "jquery";
import { Popover, Spin } from "antd";
import { CheckOutlined, LoadingOutlined } from "@ant-design/icons";

import { Tooltip } from "antd";
import setAuthToken from "../utils/setAuthToken";
import axios from "axios";
import apiUrl from "../utils/getApiUrl";
import api from "../HighlightTool/utils/api";

export const App = ({
  chrome,
  iframeDocument,
  iframeWindow,
  collapseSideToggleContainer,
  showSaveButtons,
  hideSaveButtons,
}) => {
  const [state, setState] = useState({
    controlsVisible: false,
    savingPage: false,
    pageSaved: false,
    captureMenuVisible: false,
    sideToggleExpanded: false,
    previousUrl: window.location.href,
  });

  const antIcon = <LoadingOutlined style={{ fontSize: 20 }} spin />;
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

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

        api
          .checkPageExists(window.location.href)
          .then((res) => {
            handlePageSaved(res);
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (request.message == "screenshotReturn") {
        const originalScrollTop = request.shared.originalScrollTop;
        var scrollNode = document.scrollingElement || document.documentElement;
        scrollNode.scrollTop = originalScrollTop;

        $("#notealy-side-toggle-iframe-container").css("display", "block");
        $("#notealy-modal-iframe-container").css("display", "block");

        const modalIframeContainer = $(
          "#notealy-modal-iframe-container > iframe"
        )[0];

        modalIframeContainer.contentWindow.postMessage(
          JSON.stringify({
            shared: request.shared,
            blockId: request.blockId,
            message: "snapPage",
          }),
          "*",
          []
        );

        sendResponse({ message: "success" });
      } else if (request.message == "updateTokens") {
        const authToken = request.authToken;
        const refreshToken = request.refreshToken;
        const uid = request.user.uid;

        setAuthToken(chrome, authToken, refreshToken, false);
      }
    });

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutationRecord) {
        const sideToggleContainer = document.getElementById(
          "notealy-side-toggle-iframe-container"
        );

        if (sideToggleContainer.style.width == "300px") {
          setState((prevState) => {
            return {
              ...prevState,
              sideToggleExpanded: true,
            };
          });
        } else {
          setState((prevState) => {
            return {
              ...prevState,
              sideToggleExpanded: false,
            };
          });
        }
      });
    });

    var target = document.getElementById(
      "notealy-side-toggle-iframe-container"
    );
    observer.observe(target, { attributes: true, attributeFilter: ["style"] });

    var pageObserver = new MutationObserver(function (mutations) {
      if (window.location.href !== state.previousUrl) {
        setState((prevState) => {
          return {
            ...prevState,
            previousUrl: window.location.href,
          };
        });

        api
          .checkPageExists(window.location.href)
          .then((res) => {
            handlePageSaved(res);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });

    pageObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    iframeDocument.addEventListener("keydown", (e) => {
      const key = e.key;
      if ((key == "x" || key == "≈") && e.altKey) {
        if ($("#notealy-extension-root").css("display") == "none") {
          $("#notealy-extension-root").css("display", "block");
        } else {
          $("#notealy-extension-root").css("display", "none");
        }
      }
    });
  }, []);

  const handlePageSaved = (res) => {
    const pageSaved = Object.keys(res.data).length > 0;

    setState((prevState) => {
      return {
        ...prevState,
        pageSaved: pageSaved,
      };
    });
  };

  const enableControls = () => {
    setState((prevState) => {
      return {
        ...prevState,
        controlsVisible: true,
        captureMenuVisible: false,
      };
    });
  };

  const disableControls = () => {
    collapseSideToggleContainer();
    setState((prevState) => {
      return {
        ...prevState,
        controlsVisible: false,
      };
    });
  };

  const toggleApp = () => {
    const appContainer = $("#notealy-extension-root")[0];
    if (appContainer.style.display == "none") {
      $("#notealy-extension-root").css("display", "block");
    } else {
      $("#notealy-extension-root").css("display", "none");
    }
  };

  const savePage = async () => {
    try {
      if (state.savingPage) return;
      setState((prevState) => {
        return {
          ...prevState,
          savingPage: true,
        };
      });

      const url = window.location.href;
      await axios.post(`${apiUrl}/page/add`, {
        page: {
          url: url,
          metadata: {},
          favourited: false,
        },
      });

      setState((prevState) => {
        return {
          ...prevState,
          pageSaved: true,
          savingPage: false,
        };
      });
    } catch (err) {
      console.log(err);
      setState((prevState) => {
        return {
          ...prevState,
          pageSaved: false,
          savingPage: false,
        };
      });
    }
  };

  const captureVisible = () => {
    $("#notealy-side-toggle-iframe-container").css("display", "none");
    $("#notealy-modal-iframe-container").css("display", "none");
    $("#notealy-extension-root").css("display", "none");
    console.log(hideSaveButtons);
    hideSaveButtons();

    setTimeout(() => {
      chrome.runtime.sendMessage(
        {
          message: "snapVisible",
        },
        function (response) {
          showSaveButtons();
          if (response.message === "success") {
            const dataUrl = response.payload.dataUrl;
            $("#notealy-side-toggle-iframe-container").css("display", "block");
            $("#notealy-modal-iframe-container").css("display", "block");

            const modalIframeContainer = $(
              "#notealy-modal-iframe-container > iframe"
            )[0];

            modalIframeContainer.contentWindow.postMessage(
              JSON.stringify({
                image: dataUrl,
                message: "snapVisibleLibraryModal",
              }),
              "*",
              []
            );
          }
        }
      );
    }, 100);
  };

  const capturePage = () => {
    $("#notealy-side-toggle-iframe-container").css("display", "none");
    $("#notealy-modal-iframe-container").css("display", "none");
    $("#notealy-extension-root").css("display", "none");
    hideSaveButtons();

    setTimeout(function () {
      chrome.runtime.sendMessage({
        action: "grab",
      });
    }, 100);
  };

  const captureSelectedArea = () => {
    $("#notealy-side-toggle-iframe-container").css("display", "none");
    $("#notealy-extension-root").css("display", "none");

    const modalIframeContainer = $(
      "#notealy-modal-iframe-container > iframe"
    )[0];

    modalIframeContainer.contentWindow.postMessage(
      JSON.stringify({
        message: "openScreenshotModalForLibrary",
      }),
      "*",
      []
    );
    $("#notealy-modal-iframe-container").css("display", "block");
  };

  return (
    <div
      className="side-toggle-container"
      onMouseEnter={enableControls}
      onMouseLeave={disableControls}
      style={{
        marginLeft: state.sideToggleExpanded ? "auto" : "0px",
      }}
    >
      <div className="side-toggle-app-container">
        <div className="notely-side-toggle-logo">
          <img src={notealyLogo} />
        </div>
        {state.controlsVisible && (
          <div className="notealy-side-toggle-controls">
            <Popover
              placement="left"
              content={
                <div className="notealy-side-toggle-tooltip">
                  <p>Open app</p>
                  <span
                    className="notealy-keyboard-shortcut"
                    style={{ marginLeft: "auto" }}
                  >
                    {isMac ? "Opt" : "Alt"}
                  </span>
                  <span className="notealy-keyboard-shortcut">x</span>
                </div>
              }
              overlayClassName="no-arrow"
              destroyTooltipOnHide={true}
            >
              <div className="notealy-side-toggle-open-app" onClick={toggleApp}>
                <img src={appToggleIcon} />
              </div>
            </Popover>
            <Popover
              content={
                <div className="notealy-capture-tool-menu">
                  <div onClick={captureVisible}>
                    <p>Capture visible</p>
                  </div>
                  {/* <div onClick={capturePage}>
                    <p>Capture page</p>
                  </div> */}
                  <div onClick={captureSelectedArea}>
                    <p>Selected area</p>
                  </div>
                </div>
              }
              className="no-animation"
              overlayClassName="no-arrow no-animation"
              placement="leftTop"
              destroyTooltipOnHide={true}
            >
              <div className="notealy-side-toggle-capture-tool">
                <img src={screenshotToolLogo} />
              </div>
            </Popover>
            <Popover
              placement="left"
              content={
                <div className="notealy-side-toggle-tooltip">
                  {state.pageSaved ? <p>Saved</p> : <p>Bookmark page</p>}
                </div>
              }
              overlayClassName="no-arrow"
              destroyTooltipOnHide={true}
            >
              <div
                className="notealy-side-toggle-save-page-btn"
                onClick={!state.pageSaved ? savePage : undefined}
              >
                {state.savingPage ? (
                  <Spin indicator={antIcon} />
                ) : state.pageSaved ? (
                  <CheckOutlined color={"#14ff6e"} />
                ) : (
                  <img src={savePageLogo} />
                )}
              </div>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
};
