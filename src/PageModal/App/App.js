import React, { useEffect, useState } from "react";

import ScreenshotPreviewModal from "../components/ScreenshotPreviewModal/ScreenshotPreviewModal";
import CoverModal from "../components/CoverModal/CoverModal";
import ImageModal from "../components/ImageModal/ImageModal";
import TweetModal from "../components/TweetModal/TweetModal";
import ScreenshotModal from "../components/ScreenshotModal/ScreenshotModal";

import isJson from "../../utils/isJson";
import "../index.css";
import "./app.css";
import setAuthToken from "../../utils/setAuthToken";

export const App = ({ chrome, document, window }) => {
  const [state, setState] = useState({
    currentModal: 1,
    imageUrl: "",
    autoSaveTweet: false,
    tweet: undefined,
    blockId: undefined,
    coords: undefined,
    image: undefined,
    token: undefined,
    crop: false,
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

        setState((prevState) => {
          return {
            ...prevState,
            token: refreshToken,
          };
        });
      } else if (request.message == "updateTokens") {
        const authToken = request.authToken;
        const refreshToken = request.refreshToken;

        setAuthToken(chrome, authToken, refreshToken, false);

        setState((prevState) => {
          return {
            ...prevState,
            token: refreshToken,
          };
        });
      }
    });

    window.addEventListener("message", function (e) {
      const dataIsJson = isJson(e.data);
      if (!dataIsJson) return;
      const data = JSON.parse(e.data);
      const message = data.message;
      if (message == "snapPage") {
        const imageData = data.shared.imageDataURL;
        setState((prevState) => {
          return {
            ...prevState,
            currentModal: 1,
            image: imageData,
            blockId: data.blockId,
          };
        });
      } else if (message == "toggleChangeCoverModal") {
        setState((prevState) => {
          return {
            ...prevState,
            currentModal: 2,
          };
        });
      } else if (message == "toggleViewImageModal") {
        setState((prevState) => {
          return {
            ...prevState,
            currentModal: 3,
            imageUrl: data.imageUrl,
          };
        });
      } else if (message == "saveTweet") {
        setState((prevState) => {
          return {
            ...prevState,
            currentModal: 4,
            tweet: data.tweet,
          };
        });
      } else if (message == "openScreenshotModalForNote") {
        setState((prevState) => {
          return {
            ...prevState,
            currentModal: 5,
            blockId: data.blockId,
          };
        });
      } else if (message == "openScreenshotModalForLibrary") {
        setState((prevState) => {
          return {
            ...prevState,
            currentModal: 5,
            crop: true,
            blockId: undefined,
          };
        });
      } else if (message == "openScreenshotPreview") {
        setState((prevState) => {
          return {
            ...prevState,
            currentModal: 1,
            blockId: data.blockId,
            coords: data.coords,
            image: data.image,
          };
        });
      } else if (message == "snapVisibleLibraryModal") {
        setState((prevState) => {
          return {
            ...prevState,
            currentModal: 1,
            image: data.image,
            blockId: undefined,
          };
        });
      } else if (message == "setTokenForPageModal") {
        const token = data.token;

        setState((prevState) => {
          return {
            ...prevState,
            token: token,
          };
        });
      } else if (message == "setAutoSaveTweetForPageModal") {
        const autoSaveTweet = data.autoSaveTweet;
        setState((prevState) => {
          return {
            ...prevState,
            autoSaveTweet: autoSaveTweet,
          };
        });
      } else if (message == "closeModals") {
        setState((prevState) => {
          return { ...prevState, currentModal: 100 };
        });
      }
    });
  }, []);

  const hideModal = () => {
    setState((prevState) => {
      return {
        ...prevState,
        currentModal: 1000,
        coords: undefined,
      };
    });
  };

  const getCurrentModal = () => {
    const { currentModal } = state;

    switch (currentModal) {
      case 1:
        return (
          <ScreenshotPreviewModal
            image={state.image}
            coords={state.coords}
            blockId={state.blockId}
            hideModal={hideModal}
            token={state.token}
            crop={state.crop}
            document={document}
          />
        );
      case 2:
        return <CoverModal hideModal={hideModal} document={document} />;
      case 3:
        return (
          <ImageModal
            imageUrl={state.imageUrl}
            hideModal={hideModal}
            document={document}
          />
        );
      case 4:
        return (
          <TweetModal
            tweet={state.tweet}
            hideModal={hideModal}
            autoSaveTweet={state.autoSaveTweet}
            document={document}
          />
        );
      case 5:
        return (
          <ScreenshotModal
            blockId={state.blockId}
            hideModal={hideModal}
            document={document}
            chrome={chrome}
          />
        );
      default:
        return;
    }
  };
  return <div className="app-container">{getCurrentModal()}</div>;
};
