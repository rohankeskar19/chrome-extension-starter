import React, { useState, useEffect, useRef, useCallback } from "react";
import "./screenshotmodal.css";
import { Rnd } from "react-rnd";
import DragResizeContainer from "react-drag-resize";

import closeIcon from "../../../icons/x.svg";
import getOffset from "../../../utils/getOffset";
import useIsMountedRef from "../../../utils/useIsMounteRef";
import $ from "jquery";

function ScreenshotModal({ chrome, blockId, hideModal }) {
  const [state, setState] = useState({
    x: 0,
    y: 0,
    width: 320,
    height: 400,
    blockId: blockId,
    resizing: false,
    layout: [{ key: "test", x: 0, y: 0, width: 200, height: 100, zIndex: 1 }],
  });

  const doneButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const screenshotToolRef = useRef(null);
  const isMountedRef = useIsMountedRef();

  useEffect(() => {
    if (isMountedRef.current) {
      setState((prevState) => {
        return {
          ...prevState,
          blockId: blockId,
        };
      });
    }
  }, [blockId]);

  const canResizable = (isResize) => {
    return {
      top: isResize,
      right: isResize,
      bottom: isResize,
      left: isResize,
      topRight: isResize,
      bottomRight: isResize,
      bottomLeft: isResize,
      topLeft: isResize,
    };
  };

  const getScreenshotForCoords = () => {
    $("#notealy-modal-iframe-container").css("display", "none");
    $("#notealy-extension-root").css("display", "none");
    $("#notealy-side-toggle-iframe-container").css("display", "none");
    const modalIframe = $("#notealy-modal-iframe-container > iframe")[0];

    setTimeout(() => {
      chrome.runtime.sendMessage(
        {
          message: "snapVisible",
        },
        function (response) {
          if (response.message === "success") {
            const dataUrl = response.payload.dataUrl;

            modalIframe.contentWindow.postMessage(
              JSON.stringify({
                message: "openScreenshotPreview",
                coords: {
                  x: state.x,
                  y: state.y,
                  width: state.width,
                  height: state.height,
                },
                blockId: state.blockId,
                image: dataUrl,
              }),
              "*",
              []
            );
            $("#notealy-modal-iframe-container").css("display", "block");
            $("#notealy-side-toggle-iframe-container").css("display", "block");
          }
        }
      );
    }, 100);
  };

  const closeModal = () => {
    $("#notealy-modal-iframe-container").css("display", "none");
    $("#notealy-side-toggle-iframe-container").css("display", "block");

    if (state.blockId) {
      $("#notealy-extension-root").css("display", "block");
    }

    setState((prevState) => {
      return {
        ...prevState,
        blockId: undefined,
      };
    });
    hideModal();
  };

  const setResizeCoords = (ref, position, resizing) => {
    setState((prevState) => {
      return {
        ...prevState,
        width: ref.style.width.replace("px", ""),
        height: ref.style.height.replace("px", ""),
        resizing: resizing,
        ...position,
      };
    });
  };

  const setButtonLocations = () => {};

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Rnd
        default={{
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          width: state.width,
          height: state.height,
        }}
        size={{ width: state.width, height: state.height }}
        position={{ x: state.x, y: state.y }}
        // minWidth={50}
        // minHeight={50}
        style={{
          border: "4px solid #fff",
          backgroundColor: "transparent",
          position: "fixed",
        }}
        bounds="window"
        lockAspectRatio={false}
        className={"screenshot-resizable"}
        onDragStop={(e, d) => {
          setButtonLocations();
          setState((prevState) => {
            return {
              ...prevState,
              x: d.lastX,
              y: d.lastY,
            };
          });
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          setResizeCoords(ref, position, false);
        }}
        onResize={(e, direction, ref, delta, position) => {
          setResizeCoords(ref, position, true);
          setButtonLocations();
        }}
        onResizeStart={(e, direction, ref, delta, position) => {
          setState((prevState) => {
            return { ...prevState, resizing: true };
          });
        }}
      >
        <div className={"rounded-edgemark edgemark-n"}></div>
        <div className={"rounded-edgemark edgemark-ne"}></div>
        <div className={"rounded-edgemark edgemark-e"}></div>
        <div className={"rounded-edgemark edgemark-se"}></div>
        <div className={"rounded-edgemark edgemark-s"}></div>
        <div className={"rounded-edgemark edgemark-sw"}></div>
        <div className={"rounded-edgemark edgemark-w"}></div>
        <div className={"rounded-edgemark edgemark-nw"}></div>

        <div
          className={"done-button"}
          ref={doneButtonRef}
          onClick={getScreenshotForCoords}
        >
          <p>Done</p>
        </div>
        <div
          className={"close-button"}
          ref={closeButtonRef}
          onClick={closeModal}
        >
          <img src={closeIcon} />
        </div>
      </Rnd>
    </div>
  );
}

export default ScreenshotModal;
