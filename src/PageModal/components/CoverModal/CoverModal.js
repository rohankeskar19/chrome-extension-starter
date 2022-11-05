import React, { useState, useEffect, useRef } from "react";
import "./covermodal.css";
import closeIcon from "../../../icons/x.svg";
import { Tabs, Input, Button, Upload, message } from "antd";
import unsplashLogo from "../../../icons/unsplash.svg";
import pickImageIcon from "../../../icons/pick-image.svg";
import addLinkIcon from "../../../icons/add-link.svg";
import searchIcon from "../../../icons/search-icon.svg";
import dropImageIcon from "../../../icons/upload-image-link.svg";

import UnsplashItem from "../UnsplashItem/UnsplashItem";
import Masonry from "react-masonry-css";
import { useDebouncedCallback } from "use-debounce";
import keycode from "keycode";
import axios from "axios";
import unsplashProxyUrl from "../../../utils/unsplashProxyUrl";
import useOutsideAlerter from "../../../utils/useOutsideAlerter";
import useIsMountedRef from "../../../utils/useIsMounteRef";
import $ from "jquery";
import useOutsideAlerterPageModal from "../../../utils/useOutsideAlerterPageModal";

const { TabPane } = Tabs;

const breakpointColumnsObj = {
  default: 3,
  1100: 3,
  700: 2,
  500: 1,
};

const key = "fileProcessing";

function CoverModal({ hideModal, document }) {
  const isMountedRef = useIsMountedRef();

  const [state, setState] = useState({
    loading: true,
    unsplashPhotos: [],
    searchTerm: "",
    isSearched: false,
    url: "",
  });

  const imageContainer = useRef(null);
  const modalWrapperRef = useRef(null);

  useEffect(() => {
    getPhotos();
  }, []);

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

  const selectImage = (url, downloadLocation) => {
    const appIframe = $("#notealy-extension-root > iframe")[0];
    appIframe.contentWindow.postMessage(
      JSON.stringify({
        message: "changeCover",
        type: "unsplash_pick",
        url: url,
        downloadLocation: downloadLocation,
      }),
      "*",
      []
    );
    $("#notealy-modal-iframe-container").css("display", "none");
    $("#notealy-extension-root").css("display", "block");
  };

  const beforeUpload = (file, fileList) => {
    const appIframe = $("#notealy-extension-root > iframe")[0];

    const isFileAccepted =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/gif";
    if (!isFileAccepted) {
      message.error({
        content: "Only JPG/PNG/GIF formats are allowed.",
      });
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M && isFileAccepted) {
      message.error("Image must smaller than 10MB!");
    }
    if (isFileAccepted && isLt10M) {
      const file = fileList[0];

      const url = URL.createObjectURL(file);

      const reader = new FileReader();

      reader.addEventListener(
        "load",
        function () {
          // convert image file to base64 string
          message.success({
            content: "Done",
            key: key,
          });

          appIframe.contentWindow.postMessage(
            JSON.stringify({
              message: "changeCover",
              type: "image_pick",
              file: reader.result,
            }),
            "*",
            []
          );
          $("#notealy-modal-iframe-container").css("display", "none");
          $("#notealy-extension-root").css("display", "block");
        },
        false
      );

      if (file) {
        message.loading({
          content: "Processing file",
          key: key,
        });
        reader.readAsDataURL(file);
      }
    }

    return false;
  };

  const getTab2Content = () => {
    return (
      <div className="upload-image-container">
        <Upload
          beforeUpload={beforeUpload}
          // onChange={handleChange}
          maxCount={1}
          multiple={false}
          className={"cover-image-upload"}
        >
          <img src={dropImageIcon} />
        </Upload>
      </div>
    );
  };

  const handleUrlChange = (e) => {
    const value = e.target.value;

    setState((prevState) => {
      return {
        ...prevState,
        url: value,
      };
    });
  };

  const handleUrlClick = () => {
    const { url } = state;

    const urlRegex =
      /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

    if (urlRegex.test(url)) {
      const appIframe = $("#notealy-extension-root > iframe")[0];
      appIframe.contentWindow.postMessage(
        JSON.stringify({
          message: "changeCover",
          type: "url_paste",
          url: url,
        }),
        "*",
        []
      );
      $("#notealy-modal-iframe-container").css("display", "none");
      $("#notealy-extension-root").css("display", "block");
      setState((prevState) => {
        return {
          ...prevState,
          url: "",
        };
      });
    } else {
      message.error("Invalid url (Make sure the url you entered is correct)");
    }
  };

  const handleUrlKeyDown = (e) => {
    const keyCode = e.keyCode;

    if (keyCode == keycode("enter")) {
      handleUrlClick();
    }
  };

  const getTab3Content = () => {
    return (
      <div className="paste-link-container">
        <Input
          type="url"
          placeholder="Paste image link"
          className="paste-link-input"
          onChange={handleUrlChange}
          onKeyDown={handleUrlKeyDown}
          value={state.url}
        />
        <Button
          type="primary"
          className="paste-link-button"
          onClick={handleUrlClick}
        >
          Save
        </Button>
      </div>
    );
  };

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

  const getTab1Content = () => {
    const { unsplashPhotos, searchTerm } = state;
    return (
      <div className="unsplash-container">
        <div className="search-bar">
          <input
            placeholder="Type to search"
            className="search-input"
            autoFocus={true}
            onChange={handleSearchTermChange}
            value={searchTerm}
          />
          <img src={searchIcon} />
        </div>
        <div className="unsplash-images-container" ref={imageContainer}>
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
                />
              </div>
            ))}
          </Masonry>
        </div>
      </div>
    );
  };

  const handleTabChange = async (key) => {
    try {
      if (key == "1") {
      }
    } catch (err) {
      console.log(err);
    }
  };

  const closeModal = () => {
    $("#notealy-modal-iframe-container").css("display", "none");
    $("#notealy-extension-root").css("display", "block");

    setState((prevState) => {
      return {
        ...prevState,
        searchTerm: "",
      };
    });
    hideModal();
  };

  useOutsideAlerterPageModal(document, modalWrapperRef, closeModal);

  return (
    <div className={"cover-modal-container"} ref={modalWrapperRef}>
      <div className="cover-modal-header">
        <h2>Change cover</h2>
        <div className="circle-btn" onClick={closeModal}>
          <img src={closeIcon} />
        </div>
      </div>
      <div className="cover-modal-content-container">
        <Tabs defaultActiveKey="1" onChange={handleTabChange}>
          <TabPane
            tab={
              <span>
                <img
                  src={unsplashLogo}
                  style={{ width: "25px", marginTop: "10px" }}
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
              <span>
                <img src={pickImageIcon} style={{ marginRight: "8px" }} />
                Upload an image
              </span>
            }
            key="2"
          >
            {getTab2Content()}
          </TabPane>
          <TabPane
            tab={
              <span>
                <img src={addLinkIcon} style={{ marginRight: "8px" }} />
                Link
              </span>
            }
            key="3"
          >
            {getTab3Content()}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default CoverModal;
