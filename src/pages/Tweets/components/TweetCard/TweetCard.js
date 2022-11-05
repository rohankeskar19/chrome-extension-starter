import { Popover, Select } from "antd";
import moment from "moment";
import React, { useState, useEffect, useRef } from "react";

import ellipsisIcon from "../../../../icons/ellipsis-black.svg";
import openLinkIcon from "../../../../icons/open-link.svg";
import readArticleIcon from "../../../../icons/read-article.svg";
import addToFavouriteIcon from "../../../../icons/noteeditor/editor/favourites.svg";
import favouritedIcon from "../../../../icons/noteeditor/editor/favourites-filled.svg";
import addTagIcon from "../../../../icons/add-tag.svg";

import trashIcon from "../../../../icons/trash.svg";
import firebase from "../../../../utils/firebase";
import { Tweet } from "react-twitter-widgets";

import useOutsideAlerter from "../../../../utils/useOutsideAlerter";

import "./tweetcard.css";
import getTweetIdFromUlr from "../../../../utils/getTweetIdFromUrl";

const { Option } = Select;

function TweetCard({ tweet, tags }) {
  const menuRef = useRef(null);
  const tagInputRef = useRef(null);

  const [state, setState] = useState({
    tweet: tweet,
    tags: tags,
    cardMenuVisible: false,
    tagInputVisible: false,
  });

  useEffect(() => {
    setState((prevState) => {
      return {
        ...prevState,
        tweet: tweet,
        tags: tags,
      };
    });
  }, [tweet, tags]);

  const hideTagInput = () => {
    setState((prevState) => {
      return {
        ...prevState,
        tagInputVisible: false,
      };
    });
  };

  const toggleTagInput = () => {
    setState((prevState) => {
      return {
        ...prevState,
        tagInputVisible: !state.tagInputVisible,
      };
    });
  };

  const openTweetLink = () => {
    const newWindow = window.open(
      tweet.tweetData.tweetUrl,
      "_blank",
      "noopener,noreferrer"
    );
    if (newWindow) newWindow.opener = null;
    setState((prevState) => {
      return {
        ...prevState,
        cardMenuVisible: false,
      };
    });
  };

  const deleteTweet = async () => {
    try {
      await firebase.firestore().collection("tweets").doc(tweet.id).delete();
    } catch (err) {
      console.log(err);
    }
  };

  const toggleFavourite = async () => {
    try {
      await firebase.firestore().collection("tweets").doc(tweet.id).update({
        favourited: !state.tweet.favourited,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const hideMenu = () => {
    setState((prevState) => {
      return {
        ...prevState,
        cardMenuVisible: false,
      };
    });
  };

  const getMenuForHighlightCard = () => {
    return (
      <div className="tweet-card-menu" ref={menuRef}>
        <div onClick={openTweetLink}>
          <img src={openLinkIcon} style={{ width: "15px" }} />
          <p>Show original tweet</p>
        </div>
        <div onClick={toggleFavourite}>
          <img
            src={state.tweet.favourited ? favouritedIcon : addToFavouriteIcon}
            style={{ width: "17px" }}
          />
          <p>
            {state.tweet.favourited
              ? "Remove from favourites"
              : "Add to favourites"}
          </p>
        </div>
        <div onClick={deleteTweet}>
          <img src={trashIcon} style={{ width: "17px" }} />
          <p>Delete</p>
        </div>
      </div>
    );
  };

  useOutsideAlerter(tagInputRef, hideTagInput);

  useOutsideAlerter(menuRef, hideMenu);

  const toggleCardMenu = () => {
    setState((prevState) => {
      return {
        ...prevState,
        cardMenuVisible: !state.cardMenuVisible,
      };
    });
  };

  return (
    <div className="tweet-card">
      <Tweet tweetId={getTweetIdFromUlr(tweet.tweetData.tweetUrl)} />

      <div className="tweet-card-banner-options">
        {state.tagInputVisible ? (
          <div
            className="tag-input-container"
            ref={tagInputRef}
            style={{ width: "225px" }}
          >
            <Select
              placeholder="Enter tags"
              mode="tags"
              autoFocus={true}
              open={true}
              maxTagCount={3}
            >
              {state.tags.map((tag) => (
                <Option key={tag.name}>{tag.name}</Option>
              ))}
            </Select>
          </div>
        ) : (
          <img
            src={addTagIcon}
            style={{ width: "14px", marginRight: "auto", cursor: "pointer" }}
            onClick={toggleTagInput}
          />
        )}

        <Popover
          placement="rightTop"
          content={getMenuForHighlightCard()}
          trigger={"click"}
          overlayClassName={"no-arrow"}
          visible={state.cardMenuVisible}
          destroyTooltipOnHide={true}
          getPopupContainer={(trigger) => trigger.parentElement}
        >
          <div
            style={{
              marginLeft: "auto",
              width: "10px",
              height: "25px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={toggleCardMenu}
          >
            <img src={ellipsisIcon} className="highlight-card-ellipsis" />
          </div>
        </Popover>
      </div>
    </div>
  );
}

export default TweetCard;
