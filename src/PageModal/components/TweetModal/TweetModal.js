import React, { useState, useEffect, useRef } from "react";
import "./tweetmodal.css";
import closeIcon from "../../../icons/x.svg";
import addIcon from "../../../icons/plus-gray.svg";

import blueTwitterIcon from "../../../icons/blue-tweet.svg";
import questionMark from "../../../icons/questionmark.svg";
import { Divider, Select, Checkbox, Tooltip, message, Button } from "antd";
import useOutsideAlerter from "../../../utils/useOutsideAlerter";
import getTweetIdFromUlr from "../../../utils/getTweetIdFromUrl";
import Loader from "react-loader-spinner";
import apiUrl from "../../../utils/getApiUrl";
import axios from "axios";
import Tag from "../../../Models/Tag";
import { Tweet as TweetComponent } from "react-twitter-widgets";
import Tweet from "../../../Models/Tweet";
import tagValuesToIds from "../../../utils/tagValueToIds";
import useIsMountedRef from "../../../utils/useIsMounteRef";

const { Option } = Select;

function TweetModal({ tweet, hideModal, autoSaveTweet }) {
  const isMountedRef = useIsMountedRef();

  const [state, setState] = useState({
    loading: false,
    tweetLoading: true,
    tweet: undefined,
    tweetId: undefined,
    tags: [],
    selectedTags: [],
    autoSaveTweet: autoSaveTweet,
    savingTag: false,
  });

  const modalWrapperRef = useRef(null);

  useEffect(() => {
    if (isMountedRef.current) {
      setState((prevState) => {
        return {
          ...prevState,
          tweet: tweet,
          tweetId: getTweetIdFromUlr(tweet.tweetUrl),
          autoSaveTweet: autoSaveTweet,
        };
      });
    }

    if (!autoSaveTweet) {
      loadTags();
    } else {
      const newTag = new Tag({
        name: tweet.authorUserName,
        color: "#e8e8e8",
      }).getObject();

      const tags = [tweet.authorUserName];

      const tweetPayload = new Tweet({ tweetData: tweet, tags: tags });
      createTagForAutoSaveTweet(newTag);
      saveTweet(tweetPayload);
    }
  }, [tweet, autoSaveTweet]);

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

  const createTagForAutoSaveTweet = async (tag) => {
    try {
      await axios.post(`${apiUrl}/tag/add`, { tag: tag });
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

  const closeModal = () => {
    setState((prevState) => {
      return {
        ...prevState,
        tweet: undefined,
        loading: false,
      };
    });
    hideModal();
    // parent.window.postMessage(
    //   JSON.stringify({
    //     message: "toggleChangeCoverModal",
    //   }),
    //   "*",
    //   []
    // );
  };

  const saveTweetOnClick = () => {
    const tweetPayload = new Tweet({
      tweetData: tweet,
      tags: state.selectedTags,
    });

    saveTweet(tweetPayload);
  };

  const saveTweet = async (tweet) => {
    try {
      if (isMountedRef.current) {
        setState((prevState) => {
          return {
            ...prevState,
            loading: true,
          };
        });
      }

      await axios.post(
        `${apiUrl}/library/tweet/add`,
        { tweet: tweet },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!state.autoSaveTweet) {
        closeModal();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const setTweetLoading = (loading) => {
    setState((prevState) => {
      return {
        ...prevState,
        tweetLoading: loading,
      };
    });
  };

  const getNotFoundContent = (e) => {
    return (
      <div className="tag-not-found-content">
        <p>Type to create new tags</p> <img src={addIcon} />
      </div>
    );
  };

  const setAutoSaveTweetsConfig = (e) => {
    const checked = e.target.checked;

    // parent.window.postMessage(
    //   JSON.stringify({
    //     message: "setAutoSaveTweet",
    //     checked: checked,
    //   }),
    //   "*",
    //   []
    // );
  };

  useOutsideAlerter(modalWrapperRef, closeModal);
  return (
    <div className={"tweet-modal-container"} ref={modalWrapperRef}>
      <div className="tweet-modal-header">
        <div className="save-tweet-modal-header">
          <h2>Save tweet</h2>
          <img src={blueTwitterIcon} />
        </div>
        <div className="circle-btn" onClick={closeModal}>
          <img src={closeIcon} />
        </div>
      </div>

      <Select
        placeholder={"Add tags"}
        mode={"tags"}
        loading={state.savingTag}
        getPopupContainer={(trigger) => trigger}
        onChange={handleTagChange}
        onSelect={handleTagSelect}
        maxTagCount={3}
        notFoundContent={getNotFoundContent()}
        filterOption={(input, option) =>
          option.children
            ? option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {state.tags.map((tag) => (
          <Option key={tag.name}>{tag.name}</Option>
        ))}
      </Select>
      <Divider />
      <div className="tweet-modal-content-container">
        {state.tweetLoading && (
          <div className="tweet-loading-container">
            <Loader type="ThreeDots" width="30" height="30" color={"#000"} />
          </div>
        )}
        {state.tweet && (
          <TweetComponent
            tweetId={state.tweetId}
            onLoad={() => setTweetLoading(false)}
          />
        )}
      </div>
      <Divider />
      <div className="tweet-modal-footer">
        {/* <Checkbox onChange={setAutoSaveTweetsConfig}>
          Don’t show this again
          <Tooltip
            title="Notealy will automatically add the username as tag"
            getPopupContainer={(trigger) => trigger.parentElement}
            placement="top"
          >
            <span style={{ marginLeft: "5px" }}>
              <img src={questionMark} />
            </span>
          </Tooltip>
        </Checkbox> */}
        <Button
          className="tweet-modal-footer-button"
          onClick={saveTweetOnClick}
          loading={state.loading}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export default TweetModal;
