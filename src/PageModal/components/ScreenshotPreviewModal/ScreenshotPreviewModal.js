import React, { useRef, useState, useEffect } from "react";
import "./screenshotpreviewmodal.css";
import { Button, message, Tooltip, Select } from "antd";
import closeIcon from "../../../icons/x.svg";
import addIcon from "../../../icons/plus-gray.svg";

import useOutsideAlerter from "../../../utils/useOutsideAlerter";
import getCroppedImage from "../../../utils/getCroppedImage";
import copyIcon from "../../../icons/folder-contextmenu/copy.svg";
import axios from "axios";
import apiUrl from "../../../utils/getApiUrl";
import Tag from "../../../Models/Tag";
import tagValuesToIds from "../../../utils/tagValueToIds";
import useIsMountedRef from "../../../utils/useIsMounteRef";
import $ from "jquery";
import useOutsideAlerterPageModal from "../../../utils/useOutsideAlerterPageModal";

const { Option } = Select;

function ScreenshotPreviewModal({
  image,
  coords,
  blockId,
  hideModal,
  token,
  crop,
  document,
}) {
  const modalRef = useRef(null);
  const imageRef = useRef(null);
  const isMountedRef = useIsMountedRef();

  const [state, setState] = useState({
    image: image,
    coords: coords,
    blockId: blockId,
    imageCropped: false,
    token: token,
    tags: [],
    selectedTags: [],
    type: "snap-visible",
    savingTag: false,
    crop: crop,
    uploadingSnap: false,
  });

  useEffect(() => {
    if (isMountedRef.current) {
      setState((prevState) => {
        return {
          ...prevState,
          coords: coords,
          blockId: blockId,
          image: image,
          token: token,
          crop: crop,
        };
      });
    }

    if (!blockId) {
      loadTags();
    }
  }, [image, coords, blockId, crop]);

  const loadTags = async () => {
    if (isMountedRef.current) {
      setState((prevState) => {
        return {
          ...prevState,
          savingTag: true,
        };
      });
    }
    const response = await axios.get(`${apiUrl}/tag`);

    const tags = response.data;

    if (isMountedRef.current) {
      setState((prevState) => {
        return {
          ...prevState,
          tags: tags,
          savingTag: false,
        };
      });
    }
  };

  const closeModal = () => {
    if (state.blockId) {
      $("#notealy-modal-iframe-container").css("display", "none");
      $("#notealy-extension-root").css("display", "block");
    }

    $("#notealy-modal-iframe-container").css("display", "none");

    setState((prevState) => {
      return {
        ...prevState,
        image: undefined,
        coords: undefined,
        blockId: "",
      };
    });
    hideModal();
  };

  useOutsideAlerterPageModal(document, modalRef, closeModal);

  const drawCroppedImageOnCanvas = () => {
    if (state.imageCropped || !state.coords) {
      return;
    }
    getCroppedImage(
      state.image,
      parseInt(state.coords.x),
      parseInt(state.coords.y),
      parseInt(state.coords.width),
      parseInt(state.coords.height),
      (newImage) => {
        setState((prevState) => {
          return {
            ...prevState,
            image: newImage,
            imageCropped: true,
          };
        });
      }
    );
  };

  const copyImage = async () => {
    try {
      const base64Response = await fetch(state.image);

      const blob = await base64Response.blob();

      // navigator.clipboard.write([
      //   new ClipboardItem({
      //     "image/png": blob,
      //   }),
      // ]);
      message.success("Image copied!");
    } catch (err) {
      console.log(err);
    }
  };

  const retakeScreenshot = () => {
    // parent.window.postMessage(
    //   JSON.stringify({
    //     message: "retakeScreenshotModalForNote",
    //     blockId: state.blockId,
    //   }),
    //   "*",
    //   []
    // );
  };

  const setScreenshotForNoteImage = () => {
    const image = state.image;
    const appIframeContainer = $("#notealy-extension-root > iframe")[0];

    appIframeContainer.contentWindow.postMessage(
      JSON.stringify({
        message: "setImageForBlock",
        image: image,
        blockId: state.blockId,
      }),
      "*",
      []
    );
    closeModal();

    setState((prevState) => {
      return {
        ...prevState,
        blockId: undefined,
        image: undefined,
      };
    });
  };

  const saveImageWithLibrary = () => {
    uploadImageToLibrary();
  };

  const handleTagChange = async (value) => {
    const { tags } = state;

    var tagExists = false;
    tags.forEach((tag) => {
      value.forEach((tagName) => {
        if (tagName == tag.name) {
          tagExists = true;
        } else {
          tagExists = false;
        }
      });
    });

    if (tagExists) {
      setState((prevState) => {
        return {
          ...prevState,
          selectedTags: tagValuesToIds(value, state.tags),
        };
      });
    }
  };

  const handleTagSelect = async (value) => {
    const tagIdOrValue = value;
    var tagId = undefined;
    var tagExists = false;

    state.tags.forEach((tag) => {
      if (tag.id == tagIdOrValue || tag.name == tagIdOrValue) {
        tagExists = true;
        tagId = tag.id;
      }
    });

    if (!tagExists) {
      createTag(value);
    } else {
      setState((prevState) => {
        return {
          ...prevState,
          selectedTags: [...state.selectedTags, tagId],
        };
      });
    }
  };

  const createTag = async (value) => {
    try {
      const newTag = new Tag({
        name: value,
        color: "#e8e8e8",
      }).getObject();

      setState((prevState) => {
        return {
          ...prevState,
          savingTag: false,
          selectedTags: [...state.selectedTags, newTag.id],
        };
      });

      await axios.post(`${apiUrl}/tag/add`, { tag: newTag });
    } catch (err) {
      console.log(err);
      setState((prevState) => {
        return {
          ...prevState,
          savingTag: false,
        };
      });
      message.error("Oops! Something went wrong");
    }
  };

  const uploadImageToLibrary = async () => {
    try {
      const payload = {
        tags: state.selectedTags,
        image: state.image,
        type: state.type,
      };

      setState((prevState) => {
        return {
          ...prevState,
          uploadingSnap: true,
        };
      });

      await axios.post(
        `${apiUrl}/library/snap/add`,
        { snap: payload },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setState((prevState) => {
        return {
          ...prevState,
          uploadingSnap: false,
        };
      });

      message.success("Snap saved to library");
      closeModal();
    } catch (err) {
      console.log(err);
    }
  };

  const getPreviewContentForNote = () => {
    return (
      <div>
        <div className="screenshot-preview-modal-header-container">
          <div className="screenshot-preview-modal-header">
            <h2>Preview</h2>
          </div>
          <div className="circle-btn" onClick={closeModal}>
            <img src={closeIcon} />
          </div>
        </div>

        <div className="screenshot-modal-content-container">
          <img
            src={state.image}
            onLoad={drawCroppedImageOnCanvas}
            ref={imageRef}
          />
        </div>
        <div className="screenshot-modal-footer-container">
          <Tooltip
            overlay={"Copy image"}
            placement="top"
            getPopupContainer={(trigger) => trigger.parentElement}
          >
            <Button
              icon={<img src={copyIcon} style={{ width: "15px" }} />}
              type="primary"
              style={{
                backgroundColor: "#383838",
                borderRadius: "7px",
              }}
              onClick={copyImage}
            ></Button>
          </Tooltip>
          <Button
            type="primary"
            style={{
              backgroundColor: "#383838",
              borderRadius: "7px",
              marginLeft: "auto",
            }}
            onClick={setScreenshotForNoteImage}
          >
            Done
          </Button>
        </div>
      </div>
    );
  };

  const getNotFoundContent = (e) => {
    return (
      <div className="tag-not-found-content">
        <p>Type to create new tags</p> <img src={addIcon} />
      </div>
    );
  };

  const getPreviewContentForLibrary = () => {
    return (
      <div>
        <div
          className="screenshot-preview-modal-header-container"
          style={{ paddingBottom: "10px", paddingTop: "15px" }}
        >
          <div className="screenshot-preview-modal-header">
            <h2>Preview</h2>
          </div>
          <div className="circle-btn" onClick={closeModal}>
            <img src={closeIcon} />
          </div>
        </div>
        <div className="screenshot-preview-modal-tags-input-container">
          <Select
            placeholder={"Add tags"}
            mode={"tags"}
            className={"tag-select-input"}
            loading={state.savingTag}
            getPopupContainer={(trigger) => trigger}
            onChange={handleTagChange}
            onSelect={handleTagSelect}
            maxTagCount={3}
            notFoundContent={getNotFoundContent()}
            filterOption={(input, option) =>
              option.children
                ? option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                : option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {state.tags.map((tag) => (
              <Option key={tag.name}>{tag.name}</Option>
            ))}
          </Select>

          <Button
            type="primary"
            style={{
              backgroundColor: "#383838",
              borderRadius: "100px",
              marginLeft: "10px",
            }}
            onClick={saveImageWithLibrary}
            loading={state.uploadingSnap}
          >
            Done
          </Button>
        </div>

        <div
          className="screenshot-modal-content-container"
          style={{ marginBottom: "0" }}
        >
          <img
            src={state.image}
            onLoad={drawCroppedImageOnCanvas}
            ref={imageRef}
          />
        </div>
        <div
          className="screenshot-modal-footer-container"
          style={{ marginTop: "17px" }}
        >
          <Tooltip
            overlay={"Copy image"}
            placement="top"
            getPopupContainer={(trigger) => trigger.parentElement}
          >
            <Button
              icon={<img src={copyIcon} style={{ width: "15px" }} />}
              type="primary"
              style={{
                backgroundColor: "#383838",
                borderRadius: "7px",
              }}
              onClick={copyImage}
            ></Button>
          </Tooltip>
        </div>
      </div>
    );
  };

  const getPreviewContent = () =>
    state.blockId ? getPreviewContentForNote() : getPreviewContentForLibrary();

  return (
    <div
      className={"screenshot-modal-container"}
      id="screenshot-modal"
      ref={modalRef}
      onClick={(e) => e.stopPropagation()}
    >
      {getPreviewContent()}
    </div>
  );
}

export default ScreenshotPreviewModal;
