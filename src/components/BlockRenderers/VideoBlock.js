import React, { useState, useEffect, useRef } from "react";
import { Popover, Tabs } from "antd";
import grabIcon from "../../icons/noteeditor/grab-icon.svg";
import { ReactEditor, useSelected, useSlateStatic } from "slate-react";
import showSelectedHalo from "../../utils/showSelectedHalo";
import pickVideoIcon from "../../icons/video-gray.svg";
import pasteVideoLinkIcon from "../../icons/paste-video-link.svg";
import uploadVideo from "../../icons/pick-video.svg";

import firebase from "../../utils/firebase";
import { Transforms } from "slate";
import { Resizable } from "react-resizable";
import videoType from "../../utils/videoType";
import keycode from "keycode";
import clamp from "../../utils/clamp";
import Singleton from "../../utils/getDocument";

const { TabPane } = Tabs;

var uploadTask = undefined;

const VideoBlock = (props) => {
  const editor = useSlateStatic();
  const selected = useSelected();

  const videoPlaceholderRef = useRef(null);
  const videoOptionsRef = useRef(null);
  const videoFilePicker = useRef(null);
  const videoDisplayContainerRef = useRef(null);
  const videoParentRef = useRef(null);
  const videoRef = useRef(null);

  const [state, setState] = useState({
    videoPickerPopupVisible: false,
    fileInvalidError: false,
    uploadProgress: 0,
    uploading: false,
    videoUrl: "",
    url: "",
    videoFileName: "",
  });

  var showSelected = showSelectedHalo(editor, selected, props.element);

  useEffect(() => {
    const document = Singleton.getDocument();

    document.addEventListener("mousedown", (e) => {
      if (videoOptionsRef) {
        if (videoOptionsRef.current) {
          if (
            !videoOptionsRef.current.contains(e.target) &&
            !videoPlaceholderRef.current.contains(e.target)
          ) {
            setState((prevState) => {
              return {
                ...prevState,
                videoPickerPopupVisible: false,
              };
            });
          }
        }
      }
    });
  }, []);

  const handleVideoFileChange = async (e) => {
    try {
      const file = e.target.files ? e.target.files[0] : undefined;
      e.target.value = null;
      if (uploadTask) {
        uploadTask.cancel();
      }
      if (file) {
        const fileIsValid = validateFile(file);
        const path = ReactEditor.findPath(editor, props.element);

        if (fileIsValid) {
          setState((prevState) => {
            return {
              ...prevState,
              uploadProgress: 0,
              uploading: true,
              videoUrl: URL.createObjectURL(file),
              videoPickerPopupVisible: false,
            };
          });

          const uid = firebase.auth().currentUser.uid;

          const storageRef = firebase.storage().ref();

          const fileName = `${Date.now()}_${file.name}`;

          setState((prevState) => {
            return {
              ...prevState,
              videoFileName: fileName,
            };
          });

          const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
              resolve(xhr.response);
            };
            xhr.onerror = function (e) {
              console.log(e);
              reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", URL.createObjectURL(file), true);
            xhr.send(null);
          });

          uploadTask = storageRef
            .child(uid)
            .child("uploads")
            .child("note-videos")
            .child(fileName)
            .put(blob);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              var progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

              progress =
                parseInt(progress) == 100
                  ? "100"
                  : parseInt(progress).toPrecision(2).toString();

              switch (snapshot.state) {
                case firebase.storage.TaskState.CANCELED: // or 'canceled'
                  setState((prevState) => {
                    return {
                      ...prevState,
                      uploading: false,
                      uploadProgress: 0,
                      videoPickerPopupVisible: false,
                    };
                  });
                  break;
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                  setState((prevState) => {
                    return {
                      ...prevState,
                      uploading: false,
                      videoPickerPopupVisible: false,
                    };
                  });
                  break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                  setState((prevState) => {
                    return {
                      ...prevState,
                      uploading: true,
                      videoPickerPopupVisible: false,
                    };
                  });
                  break;
              }

              setState((prevState) => {
                return {
                  ...prevState,
                  uploadProgress: progress,
                };
              });
            },
            (error) => {},
            () => {
              uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                const newElement = {
                  fileUrl: downloadURL,
                };

                Transforms.setNodes(editor, newElement, {
                  at: path,
                });

                setState((prevState) => {
                  return {
                    ...prevState,
                    uploading: false,
                    uploadProgress: 0,
                    videoUrl: "",
                    videoFileName: "",
                    fileInvalidError: false,
                    videoPickerPopupVisible: false,
                  };
                });
              });
            }
          );
        } else {
          setState((prevState) => {
            return {
              ...prevState,
              fileInvalidError: true,
              videoPickerPopupVisible: false,
            };
          });
        }
      }
    } catch (err) {
      console.log(err);
      setState((prevState) => {
        return {
          ...prevState,
          uploadProgress: 0,
          uploading: false,
          fileInvalidError: true,
          videoPickerPopupVisible: false,
        };
      });
    }
  };

  const setVideoLink = () => {
    const { url } = state;
    const path = ReactEditor.findPath(editor, props.element);

    const newElement = {
      fileUrl: url,
      blockWidth: videoDisplayContainerRef.current
        ? videoDisplayContainerRef.current.offsetWidth
        : 100,
    };

    Transforms.setNodes(editor, newElement, {
      at: path,
    });

    setState((prevState) => {
      return {
        ...prevState,
        uploadProgress: 0,
        uploading: false,
        videoUrl: url,
        videoPickerPopupVisible: false,
      };
    });

    setTimeout(() => {
      const newElement = {
        blockWidth: videoDisplayContainerRef.current
          ? videoDisplayContainerRef.current.offsetWidth
          : 100,
      };

      Transforms.setNodes(editor, newElement, {
        at: path,
      });
    }, 100);
  };

  const handleLinkChange = (e) => {
    const value = e.target.value;
    setState((prevState) => {
      return {
        ...prevState,
        url: value.trim(),
      };
    });
  };

  const handleVideoLinkKeyDown = (e) => {
    const keyCode = e.keyCode;

    if (keyCode == keycode("enter")) {
      setVideoLink();
    }
  };

  const validateFile = (file) => {
    const isFileAccepted = file.type.split("/")[0] === "video";

    const isLt20M = file.size / 1024 / 1024 < 20;
    return isFileAccepted && isLt20M;
  };

  const openFilePicker = () => {
    videoFilePicker.current.click();
  };

  const getTab1Content = () => {
    return (
      <div className="paste-video-link-container">
        <input
          placeholder="Paste your link here"
          onChange={handleLinkChange}
          autoFocus={true}
          onKeyDown={handleVideoLinkKeyDown}
        />
        <button onClick={setVideoLink}>Done</button>
      </div>
    );
  };

  const getTab2Content = () => {
    return (
      <div className="upload-image-container-popup">
        <input
          type="file"
          className="image-file-picker"
          ref={videoFilePicker}
          accept="video/mp4, video/x-m4, video/*"
          onChange={handleVideoFileChange}
        />
        <button onClick={openFilePicker}>Select Video</button>
        <p>Please keep file size below 20 mb</p>
      </div>
    );
  };

  const getPopoverContent = () => {
    return (
      <div className="image-picker-tabs-container" ref={videoOptionsRef}>
        <Tabs defaultActiveKey="1" destroyInactiveTabPane={true}>
          <TabPane
            tab={
              <span style={{ fontSize: "13px" }}>
                <img
                  src={pasteVideoLinkIcon}
                  style={{ width: "16px", marginRight: "8px" }}
                />
                Add Link
              </span>
            }
            key="1"
          >
            {getTab1Content()}
          </TabPane>
          <TabPane
            tab={
              <span style={{ fontSize: "13px" }}>
                <img
                  src={uploadVideo}
                  style={{ width: "13px", marginRight: "8px" }}
                />
                Upload video
              </span>
            }
            key="2"
          >
            {getTab2Content()}
          </TabPane>
        </Tabs>
      </div>
    );
  };

  const toggleVideoPopup = (e) => {
    setState((prevState) => {
      return {
        ...prevState,
        videoPickerPopupVisible: !state.videoPickerPopupVisible,
      };
    });
  };

  const handleResize = (event, { element, size, handle }) => {
    const width = size.width;
    const slateElement = props.element;

    const path = ReactEditor.findPath(editor, slateElement);

    Transforms.setNodes(
      editor,
      {
        blockWidth: width,
      },
      {
        at: path,
      }
    );
  };

  const togglePlayVideo = () => {
    const type = videoType(props.element.fileUrl);

    if (type == "regular") {
      if (state.playing) {
        videoRef.current.pause();
        setVideoState(false);
      } else {
        videoRef.current.play();
        setVideoState(true);
      }
    }
  };
  const setVideoState = (state) => {
    const type = videoType(props.element.fileUrl);
    if (type == "regular") {
      setState((prevState) => {
        return {
          ...prevState,
          playing: state,
        };
      });
    }
  };
  const setWidth = (e) => {
    const width = clamp(
      e.target.videoWidth,
      100,
      videoDisplayContainerRef.current
        ? videoDisplayContainerRef.current.offsetWidth
        : 300
    );
    const element = props.element;

    const path = ReactEditor.findPath(editor, element);

    Transforms.setNodes(
      editor,
      {
        blockWidth: width,
      },
      {
        at: path,
      }
    );
  };

  const convertToBookmark = () => {
    const newProps = {
      type: "bookmark",
      showLink: true,
    };

    const path = ReactEditor.findPath(editor, props.element);

    Transforms.setNodes(editor, newProps, {
      at: path,
    });
    Transforms.insertText(editor, props.element.fileUrl, {
      at: {
        anchor: {
          path: [path[0], 0],
          offset: 0,
        },
        focus: {
          path: [path[0], 0],
          offset: 0,
        },
      },
      voids: true,
    });
  };

  const getVideoPlayer = (fileUrl) => {
    const type = videoType(fileUrl);
    switch (type) {
      case "youtube":
        return (
          <iframe
            className="image-block-image"
            style={{ width: "100%", minHeight: "400px", maxHeight: "auto" }}
            src={fileUrl.replace("/watch?v=", "/embed/")}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            ref={videoPlaceholderRef}
          />
        );
      case "vimeo":
        return (
          <iframe
            className="image-block-image"
            style={{ width: "100%", minHeight: "400px", maxHeight: "auto" }}
            src={fileUrl.replace("vimeo.com", "player.vimeo.com/video")}
            title="Vimeo video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            ref={videoPlaceholderRef}
          />
        );
      case "regular":
        return (
          <video
            className="image-block-image"
            contentEditable={false}
            ref={videoPlaceholderRef}
            style={{ width: "100%", height: "auto" }}
            controls={true}
            ref={videoRef}
            onPlay={() => setVideoState(true)}
            onPause={() => setVideoState(false)}
            onError={convertToBookmark}
          >
            <source src={fileUrl} />
          </video>
        );
      default:
        return (
          <video
            className="image-block-image"
            contentEditable={false}
            ref={videoPlaceholderRef}
            style={{ width: "100%", height: "auto" }}
            controls={true}
            ref={videoRef}
            onPlay={() => setVideoState(true)}
            onPause={() => setVideoState(false)}
            onError={convertToBookmark}
          >
            <source src={fileUrl} />
          </video>
        );
    }
  };

  const getCurrentContent = (e) => {
    const element = props.element;
    if (element.fileUrl != "" && !state.uploading) {
      return (
        <div
          className="image-block-holder-container"
          ref={videoDisplayContainerRef}
          contentEditable={false}
          onClick={togglePlayVideo}
        >
          <Resizable
            width={props.element.blockWidth}
            height={
              videoDisplayContainerRef.current
                ? videoDisplayContainerRef.current.offsetWidth
                : 0
            }
            axis={"x"}
            resizeHandles={["e", "w"]}
            maxConstraints={[
              videoDisplayContainerRef.current
                ? videoDisplayContainerRef.current.offsetWidth
                : 1000,
            ]}
            minConstraints={[50, 50]}
            handle={(handleAxis, ref) => (
              <div
                contentEditable={false}
                style={{ userSelect: "none" }}
                className={`resize-handle-${handleAxis}`}
                ref={ref}
                onClick={(e) => e.stopPropagation()}
              >
                <div></div>
              </div>
            )}
            className="image-resize-container"
            onResize={handleResize}
          >
            <div
              className="image-block-image-parent"
              ref={videoParentRef}
              style={{ width: props.element.blockWidth, height: "auto" }}
              contentEditable={false}
            >
              {getVideoPlayer(element.fileUrl)}
            </div>
          </Resizable>
        </div>
      );
    } else {
      if (state.uploading) {
        return (
          <div
            className="video-uploading-progress-container"
            contentEditable={false}
            ref={videoDisplayContainerRef}
          >
            <div
              className="video-uploading-progress-overlay"
              contentEditable={false}
              style={{ width: `${state.uploadProgress}%`, height: "100%" }}
            ></div>
            <div
              className="video-uploading-info-container"
              contentEditable={false}
            >
              <div
                className="video-uploading-info-container-header"
                contentEditable={false}
              >
                <p>Uploading</p>
                <p>{state.uploadProgress}%</p>
              </div>
              <div
                className="video-uploading-info-container-footer"
                contentEditable={false}
              >
                <p>{state.videoFileName}</p>
                <div className="video-uploading-progressbar">
                  <div
                    className="video-uploading-progressbar-progress"
                    style={{
                      width: `${state.uploadProgress}%`,
                      height: "100%",
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <video
              className="image-block-image"
              contentEditable={false}
              style={{ display: "none" }}
              controls={true}
              onLoadedMetadata={setWidth}
            >
              <source src={state.videoUrl} />
            </video>
          </div>
        );
      } else {
        return (
          <div
            className="image-placeholder"
            contentEditable={false}
            onClick={toggleVideoPopup}
            ref={videoPlaceholderRef}
          >
            <img src={pickVideoIcon} />
            <p>Insert an video</p>
          </div>
        );
      }
    }
  };

  return (
    <div
      {...props.attributes}
      className="image-block block"
      data-block-id={props.element.id}
    >
      <div
        className={
          showSelected
            ? "block-selected-halo block-selected"
            : "block-selected-halo"
        }
        contentEditable={false}
      ></div>
      <div className="grab-icon-container" contentEditable={false}>
        <img src={grabIcon} className="grab-icon" />
      </div>
      <Popover
        placement="top"
        overlayClassName="no-arrow"
        content={getPopoverContent()}
        visible={state.videoPickerPopupVisible && !state.uploading}
        destroyTooltipOnHide={true}
      >
        {getCurrentContent()}
      </Popover>
      <div style={{ display: "none" }}>{props.children}</div>
    </div>
  );
};

export default VideoBlock;
