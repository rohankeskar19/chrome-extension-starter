import React, { useState, useEffect, useRef } from "react";
import { Popover } from "antd";
import { Transforms } from "slate";
import { useSlateStatic, ReactEditor, useSelected } from "slate-react";

import grabIcon from "../../icons/noteeditor/grab-icon.svg";

import keycode from "keycode";
import twitterGrayIcon from "../../icons/twitter-gray.svg";
import { Tweet } from "react-twitter-widgets";
import getTweetIdFromUlr from "../../utils/getTweetIdFromUrl";
import Singleton from "../../utils/getDocument";

const TweetBlock = (props) => {
  const editor = useSlateStatic();
  const selected = useSelected();

  const [state, setState] = useState({
    tweetLinkInputPopupVisible: false,
    tweetLink: props.element.fileUrl,
  });

  const tweetContainerRef = useRef(null);
  const tweetLinkInputRef = useRef(null);

  useEffect(() => {
    const document = Singleton.getDocument();

    document.addEventListener("mousedown", (e) => {
      if (tweetLinkInputRef) {
        if (tweetLinkInputRef.current) {
          if (
            !tweetLinkInputRef.current.contains(e.target) &&
            !tweetContainerRef.current.contains(e.target)
          ) {
            setState((prevState) => {
              return {
                ...prevState,
                tweetLinkInputPopupVisible: false,
              };
            });
          }
        }
      }
    });
  }, []);

  const toggleTweetLinkInputPopup = () => {
    setState((prevState) => {
      return {
        ...prevState,
        tweetLinkInputPopupVisible: !state.tweetLinkInputPopupVisible,
      };
    });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setState((prevState) => {
      return {
        ...prevState,
        tweetLink: value,
      };
    });
  };

  const saveTweet = () => {
    const { tweetLink } = state;

    const validTweetLinkReg =
      /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/;

    if (validTweetLinkReg.test(tweetLink)) {
      const path = ReactEditor.findPath(editor, props.element);
      var tweetId = getTweetIdFromUlr(tweetLink);

      const newProperties = {
        fileUrl: tweetLink,
        tweetId: tweetId,
      };

      Transforms.setNodes(editor, newProperties, { at: path });

      setState((prevState) => {
        return {
          ...prevState,
          tweetLinkInputPopupVisible: false,
        };
      });
    }
  };

  const handleKeyDown = (e) => {
    const keyCode = e.keyCode;

    if (keyCode == keycode("enter")) {
      saveTweet();
    }
  };

  const getTweetLinkInputContnt = () => {
    return (
      <div className="tweet-link-input-container" ref={tweetLinkInputRef}>
        <input
          value={state.tweetLink}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus={true}
          onFocus={(e) => e.target.select()}
          placeholder="Enter link to a tweet"
        />
        <button type="primary" onClick={saveTweet}>
          Save
        </button>
      </div>
    );
  };

  const getCurrentContent = () => {
    const { element } = props;
    if (element.tweetId) {
      return (
        <div className="tweet-componenet">
          <Tweet tweetId={props.element.tweetId} />
        </div>
      );
    } else {
      return (
        <Popover
          placement="top"
          content={getTweetLinkInputContnt()}
          overlayClassName="no-arrow"
          visible={state.tweetLinkInputPopupVisible}
          destroyTooltipOnHide={true}
        >
          <div
            className="tweet-container"
            onClick={toggleTweetLinkInputPopup}
            ref={tweetContainerRef}
            contentEditable={false}
          >
            <img src={twitterGrayIcon} />
            <p>Embed a tweet</p>
          </div>
        </Popover>
      );
    }
  };

  return (
    <div
      {...props.attributes}
      className="tweet-block block"
      data-block-id={props.element.id}
    >
      <div
        className={
          selected
            ? "block-selected-halo block-selected"
            : "block-selected-halo"
        }
        contentEditable={false}
      ></div>
      <div className="grab-icon-container" contentEditable={false}>
        <img src={grabIcon} className="grab-icon" />
      </div>

      {getCurrentContent()}

      <div style={{ display: "none" }} contentEditable={false}>
        {props.children}
      </div>
    </div>
  );
};

export default TweetBlock;
