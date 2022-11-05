import React, { useState, useEffect, useRef } from "react";
import grabIcon from "../../icons/noteeditor/grab-icon.svg";
import { Button, message, Popover, Tabs } from "antd";
import { ReactEditor, useSelected, useSlateStatic } from "slate-react";
import showSelectedHalo from "../../utils/showSelectedHalo";
import pickImageIcon from "../../icons/image-gray.svg";
import unsplashLogo from "../../icons/unsplash.svg";
import uploadImageIcon from "../../icons/pick-image.svg";
import clipperToolIcon from "../../icons/clipper-tool.svg";

import selectedAreaIcon from "../../icons/selected-area.svg";
import fullPageIcon from "../../icons/full-page.svg";
import elementIcon from "../../icons/element.svg";
import addLinkIcon from "../../icons/add-link.svg";
import firebase from "../../utils/firebase";
import { Transforms } from "slate";
import { Resizable } from "react-resizable";
import isBase64 from "../../utils/isBase64";
import isValidUrl from "../../utils/isValidUrl";
import keycode from "keycode";
import unsplashProxyUrl from "../../utils/unsplashProxyUrl";
import Masonry from "react-masonry-css";
import UnsplashItem from "../../PageModal/components/UnsplashItem/UnsplashItem";
import { useDebouncedCallback } from "use-debounce";
import axios from "axios";
import useIsMountedRef from "../../utils/useIsMounteRef";
import getFileBlob from "../../utils/getFileBlob";
import Singleton from "../../utils/getDocument";
import $ from "jquery";

const { TabPane } = Tabs;

var uploadTask = undefined;

const breakpointColumnsObj = {
  default: 3,
  520: 3,
};

var blockPath = undefined;

const ImageBlock = (props) => {
  const editor = useSlateStatic();
  const selected = useSelected();
  const isMountedRef = useIsMountedRef();
  const imagePlaceholderRef = useRef(null);
  const imageOptionsRef = useRef(null);
  const imageFilePicker = useRef(null);
  const imageDisplayContainerRef = useRef(null);
  const imageParentRef = useRef(null);
  const imageContainerRef = useRef(null);

  const [state, setState] = useState({
    imagePickerPopupVisible: false,
    fileInvalidError: false,
    uploadProgress: 0,
    uploading: false,
    imageUrl: "",
    url: "",
    loading: true,
    unsplashPhotos: [],
    searchTerm: "",
  });

  var showSelected = showSelectedHalo(editor, selected, props.element);

  blockPath = ReactEditor.findPath(editor, props.element);

  const searchImages = useDebouncedCallback(
    async (searchTerm) => {
      try {
        setState((prevState) => {
          return {
            ...prevState,
            searchTerm: searchTerm,
            loading: true,
            isSearched: true,
          };
        });
        const res = await axios.post(
          `${unsplashProxyUrl}/search?searchTerm=${searchTerm}&count=52`
        );

        const photos = res.data;

        setState((prevState) => {
          return {
            ...prevState,
            loading: false,
            unsplashPhotos: photos,
          };
        });
      } catch (err) {
        console.log(err);
      }
    },
    1000,
    { maxWait: 2000 }
  );

  const handleSearchTermChange = (e) => {
    const value = e.target.value;
    setState((prevState) => {
      return {
        ...prevState,
        searchTerm: value,
      };
    });
    searchImages(value);
  };

  useEffect(() => {
    if (!props.element.fileUrl) {
      getPhotos();
    }
  }, []);

  useEffect(() => {
    const element = props.element;
    if (element.fileUrl != "" && element.blockWidth == 100) {
      const path = ReactEditor.findPath(editor, element);

      Transforms.setNodes(
        editor,
        {
          blockWidth: imagePlaceholderRef.current?.offsetWidth,
        },
        {
          at: path,
        }
      );
    }
  }, [props.element]);

  useEffect(() => {
    const document = Singleton.getDocument();

    document.addEventListener("mousedown", (e) => {
      if (imageOptionsRef) {
        if (imageOptionsRef.current) {
          if (
            !imageOptionsRef.current.contains(e.target) &&
            !imagePlaceholderRef.current.contains(e.target)
          ) {
            setState((prevState) => {
              return {
                ...prevState,
                imagePickerPopupVisible: false,
              };
            });
          }
        }
      }
    });
  }, []);

  const handleImageFileChange = async (e) => {
    try {
      const file = e.target.files ? e.target.files[0] : undefined;
      e.target.value = null;
      if (uploadTask) {
        uploadTask.cancel();
      }
      if (file) {
        const fileIsValid = validateFile(file);
        if (fileIsValid) {
          setState((prevState) => {
            return {
              ...prevState,
              uploadProgress: 0,
              uploading: true,
              imageUrl: URL.createObjectURL(file),
              imagePickerPopupVisible: false,
            };
          });

          const uid = firebase.auth().currentUser.uid;

          const storageRef = firebase.storage().ref();

          const fileName = `${Date.now()}_${file.name}`;

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
            .child("note-images")
            .child(fileName)
            .put(blob, "", {
              contentType: file.type ? file.type : "image/jpeg",
            });

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              var progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log("progress", progress);
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
                      imagePickerPopupVisible: false,
                    };
                  });
                  break;
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                  setState((prevState) => {
                    return {
                      ...prevState,
                      uploading: false,
                      imagePickerPopupVisible: false,
                    };
                  });
                  break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                  setState((prevState) => {
                    return {
                      ...prevState,
                      uploading: true,
                      imagePickerPopupVisible: false,
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

                console.log(downloadURL);

                Transforms.setNodes(editor, newElement, {
                  at: blockPath,
                });

                setState((prevState) => {
                  return {
                    ...prevState,
                    uploading: false,
                    uploadProgress: 0,
                    imageUrl: "",
                    fileInvalidError: false,
                    imagePickerPopupVisible: false,
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
              imagePickerPopupVisible: false,
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
          imagePickerPopupVisible: false,
        };
      });
    }
  };

  const getPhotos = async () => {
    try {
      if (isMountedRef.current) {
        setState((prevState) => {
          return {
            ...prevState,
            loading: true,
            searchTerm: "",
            isSearched: false,
          };
        });
      }

      const res = await axios.get(`${unsplashProxyUrl}/get-random?count=52`);

      const photos = res.data;

      if (isMountedRef.current) {
        setState((prevState) => {
          return {
            ...prevState,
            loading: false,
            unsplashPhotos: photos,
          };
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const validateFile = (file) => {
    const isFileAccepted = file.type.split("/")[0] === "image";

    const isLt5M = file.size / 1024 / 1024 < 5;
    return isFileAccepted && isLt5M;
  };

  const openFilePicker = () => {
    imageFilePicker.current.click();
  };

  const selectImage = (url) => {
    const path = ReactEditor.findPath(editor, props.element);

    Transforms.setNodes(
      editor,
      {
        fileUrl: url,
        blockWidth: imagePlaceholderRef.current?.offsetWidth,
      },
      {
        at: path,
      }
    );

    setState((prevState) => {
      return {
        ...prevState,
        imagePickerPopupVisible: false,
        imageUrl: "",
      };
    });
  };

  const getTab1Content = () => {
    const { unsplashPhotos } = state;
    return (
      <div className="unsplash-image-container">
        <input placeholder="Search images" onChange={handleSearchTermChange} />
        <div className="unsplash-images-container" ref={imageContainerRef}>
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {unsplashPhotos.map((unsplashPhoto) => (
              <div key={unsplashPhoto.id} style={{ maxWidth: "100%" }}>
                <UnsplashItem
                  photo={unsplashPhoto}
                  onImageSelected={selectImage}
                  forImageBlock={true}
                />
              </div>
            ))}
          </Masonry>
        </div>
      </div>
    );
  };

  const getTab2Content = () => {
    return (
      <div className="upload-image-container-popup">
        <input
          type="file"
          className="image-file-picker"
          ref={imageFilePicker}
          accept="image/*"
          onChange={handleImageFileChange}
        />
        <button onClick={openFilePicker}>Select Image</button>
        <p>Please keep file size below 5 mb</p>
      </div>
    );
  };

  const openScreenshotModal = () => {
    $("#notealy-extension-root").css("display", "none");
    $("#notealy-modal-iframe-container").css("display", "block");
    $("#notealy-side-toggle-iframe-container").css("display", "none");

    const modalIframeContainer = $(
      "#notealy-modal-iframe-container > iframe"
    )[0];
    modalIframeContainer.contentWindow.postMessage(
      JSON.stringify({
        message: "openScreenshotModalForNote",
        blockId: props.element.id,
      }),
      "*",
      []
    );
  };

  const snapPage = () => {
    window.postMessage(
      JSON.stringify({
        message: "snapPage",
        blockId: props.element.id,
      }),
      "*",
      []
    );
  };

  const snapVisible = () => {
    window.postMessage(
      JSON.stringify({
        message: "snapVisible",
        blockId: props.element.id,
      }),
      "*",
      []
    );
  };

  const getTab3Content = () => {
    return (
      <div className="paste-url-image-tool-container">
        <input
          type="text"
          placeholder="Paste your link here"
          onChange={handlePasteUrlChange}
          autoFocus={true}
          onKeyDown={handleImageLinkKeyDown}
        />
        <button onClick={handlePasteUrl}>Done</button>
      </div>
    );
  };

  const getTab4Content = () => {
    return (
      <div className="clipper-tool-container">
        <button style={{ width: "135px" }} onClick={openScreenshotModal}>
          <img src={selectedAreaIcon} />
          <span>Selected Area</span>
        </button>
        {/* <button style={{ width: "110px" }} onClick={snapPage}>
          <img src={fullPageIcon} />
          <span>Full Page</span>
        </button> */}
        <button style={{ width: "135px" }} onClick={snapVisible}>
          <img src={elementIcon} />
          <span>Visible Area</span>
        </button>
      </div>
    );
  };

  const getPopoverContent = () => {
    return (
      <div
        className="image-picker-tabs-container"
        ref={imageOptionsRef}
        contentEditable={false}
      >
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span style={{ fontSize: "13px" }}>
                <img
                  src={unsplashLogo}
                  style={{ width: "22px", marginTop: "10px" }}
                />
                Unsplash
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
                  src={uploadImageIcon}
                  style={{ width: "13px", marginRight: "8px" }}
                />
                Upload an image
              </span>
            }
            key="2"
          >
            {getTab2Content()}
          </TabPane>
          <TabPane
            tab={
              <span style={{ fontSize: "13px" }}>
                <img
                  src={addLinkIcon}
                  style={{ width: "18px", marginRight: "7px" }}
                />
                Paste url
              </span>
            }
            key="3"
          >
            {getTab3Content()}
          </TabPane>
          <TabPane
            tab={
              <span style={{ fontSize: "13px" }}>
                <img
                  src={clipperToolIcon}
                  style={{ marginRight: "8px", width: "14px" }}
                />
                Clipper Tool
              </span>
            }
            key="4"
          >
            {getTab4Content()}
          </TabPane>
        </Tabs>
      </div>
    );
  };

  const toggleImagePopup = (e) => {
    setState((prevState) => {
      return {
        ...prevState,
        imagePickerPopupVisible: !state.imagePickerPopupVisible,
      };
    });
  };

  const handleImageLinkKeyDown = (e) => {
    const keyCode = e.keyCode;

    if (keyCode == keycode("enter")) {
      handlePasteUrl();
    }
  };

  const handlePasteUrlChange = (e) => {
    const url = e.target.value;
    setState((prevState) => {
      return {
        ...prevState,
        url: url.trim(),
      };
    });
  };

  const handlePasteUrl = () => {
    const { url } = state;
    if (isValidUrl(url)) {
      const newProps = {
        fileUrl: url,
        blockWidth: imagePlaceholderRef.current?.offsetWidth,
      };

      const path = ReactEditor.findPath(editor, props.element);

      Transforms.setNodes(editor, newProps, {
        at: path,
      });

      setState((prevState) => {
        return {
          ...prevState,
          imagePickerPopupVisible: false,
          url: "",
        };
      });
    }
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

  const setWidth = (e) => {
    const width = e.target.offsetWidth;
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

  const openViewImageModal = () => {
    const imageUrl = props.element.fileUrl;
    // parent.window.postMessage(
    //   JSON.stringify({
    //     message: "toggleViewImageModal",
    //     imageUrl: imageUrl,
    //   }),
    //   "*",
    //   []
    // );
  };

  const uploadIfBlob = () => {
    const fileUrl = props.element.fileUrl;
    if (fileUrl.startsWith("blob:")) {
      try {
        const file = fileUrl;
        if (uploadTask) {
          uploadTask.cancel();
        }
        if (file) {
          setState((prevState) => {
            return {
              ...prevState,
              uploadProgress: 0,
              uploading: true,
              imageUrl: fileUrl,
              imagePickerPopupVisible: false,
            };
          });

          const uid = firebase.auth().currentUser.uid;

          const storageRef = firebase.storage().ref();

          const fileName = `${Date.now()}_${file.name}`;

          var imageFile = new File([fileUrl], fileName, {
            type: "image/png",
          });

          if (!validateFile(imageFile)) {
            Transforms.setNodes(editor, {
              fileUrl: "",
            });
            message.warning("Please keep file size below 5 mb");
            return;
          }

          getFileBlob(fileUrl, (blob) => {
            uploadTask = storageRef
              .child(uid)
              .child("uploads")
              .child("note-images")
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
                        imagePickerPopupVisible: false,
                      };
                    });
                    break;
                  case firebase.storage.TaskState.PAUSED: // or 'paused'
                    setState((prevState) => {
                      return {
                        ...prevState,
                        uploading: false,
                        imagePickerPopupVisible: false,
                      };
                    });
                    break;
                  case firebase.storage.TaskState.RUNNING: // or 'running'
                    setState((prevState) => {
                      return {
                        ...prevState,
                        uploading: true,
                        imagePickerPopupVisible: false,
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
                  const path = ReactEditor.findPath(editor, props.element);
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
                      imageUrl: "",
                      fileInvalidError: false,
                      imagePickerPopupVisible: false,
                    };
                  });
                });
              }
            );
          });
        }
      } catch (err) {
        console.log(err);
        setState((prevState) => {
          return {
            ...prevState,
            uploadProgress: 0,
            uploading: false,
            fileInvalidError: true,
            imagePickerPopupVisible: false,
          };
        });
      }
    }
  };

  const uploadIfBase64 = () => {
    const fileUrl = props.element.fileUrl;
    if (isBase64(fileUrl)) {
      try {
        const file = fileUrl;
        if (uploadTask) {
          uploadTask.cancel();
        }
        if (file) {
          setState((prevState) => {
            return {
              ...prevState,
              uploadProgress: 0,
              uploading: true,
              imageUrl: fileUrl,
              imagePickerPopupVisible: false,
            };
          });

          const uid = firebase.auth().currentUser.uid;

          const storageRef = firebase.storage().ref();

          const fileName = `${Date.now()}_${file.name}`;

          uploadTask = storageRef
            .child(uid)
            .child("uploads")
            .child("note-images")
            .child(fileName)
            .putString(fileUrl, "data_url", { contentType: "image/jpg" });

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
                      imagePickerPopupVisible: false,
                    };
                  });
                  break;
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                  setState((prevState) => {
                    return {
                      ...prevState,
                      uploading: false,
                      imagePickerPopupVisible: false,
                    };
                  });
                  break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                  setState((prevState) => {
                    return {
                      ...prevState,
                      uploading: true,
                      imagePickerPopupVisible: false,
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
                const path = ReactEditor.findPath(editor, props.element);
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
                    imageUrl: "",
                    fileInvalidError: false,
                    imagePickerPopupVisible: false,
                  };
                });
              });
            }
          );
        }
      } catch (err) {
        console.log(err);
        setState((prevState) => {
          return {
            ...prevState,
            uploadProgress: 0,
            uploading: false,
            fileInvalidError: true,
            imagePickerPopupVisible: false,
          };
        });
      }
    }
  };

  const handleImageUpload = () => {
    const fileUrl = props.element.fileUrl;

    if (isBase64(fileUrl)) {
      uploadIfBase64();
    } else if (fileUrl.startsWith("blob:")) {
      uploadIfBlob();
    }
  };

  const getCurrentContent = (e) => {
    const element = props.element;
    if (element.fileUrl != "" && !state.uploading) {
      return (
        <div
          className="image-block-holder-container"
          ref={imageDisplayContainerRef}
          contentEditable={false}
        >
          <Resizable
            width={props.element.blockWidth}
            height={
              imageDisplayContainerRef.current
                ? imageDisplayContainerRef.current.offsetWidth
                : 0
            }
            axis={"x"}
            resizeHandles={["e", "w"]}
            maxConstraints={[
              imageDisplayContainerRef.current
                ? imageDisplayContainerRef.current.offsetWidth
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
              ref={imageParentRef}
              style={{ width: props.element.blockWidth, height: "auto" }}
              contentEditable={false}
            >
              <img
                src={element.fileUrl}
                className="image-block-image"
                ref={imagePlaceholderRef}
                style={{ width: "100%", height: "auto" }}
                onLoad={handleImageUpload}
                onDoubleClick={openViewImageModal}
              />
            </div>
          </Resizable>
        </div>
      );
    } else {
      if (state.uploading) {
        return (
          <div className="image-uploading-progress-container">
            <div className="image-uploading-progress-overlay">
              <div
                className="uploading-pulse"
                style={{ width: `${100 - state.uploadProgress}%` }}
              ></div>
              <div
                className="uploading-progress"
                style={{ width: `${state.uploadProgress}%`, height: "100%" }}
              ></div>
            </div>
            <img
              src={state.imageUrl}
              className="image-block-image"
              onLoad={setWidth}
              style={{ margin: "0 auto" }}
            />
          </div>
        );
      } else {
        return (
          <div
            className="image-placeholder"
            onClick={toggleImagePopup}
            ref={imagePlaceholderRef}
            contentEditable={false}
          >
            <img src={pickImageIcon} contentEditable={false} />
            <p contentEditable={false}>Insert an image</p>
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
        visible={state.imagePickerPopupVisible && !state.uploading}
        destroyTooltipOnHide={true}
        getPopupContainer={(trigger) => trigger.parentElement}
      >
        {getCurrentContent()}
      </Popover>
      <div style={{ display: "none" }} contentEditable={false}>
        {props.children}
      </div>
    </div>
  );
};

export default ImageBlock;
