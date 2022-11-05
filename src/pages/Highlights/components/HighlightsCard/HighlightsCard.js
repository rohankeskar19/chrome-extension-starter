import { Popover, Select } from "antd";
import moment from "moment";
import React, { useState, useEffect, useRef } from "react";

import ellipsisIcon from "../../../../icons/ellipsis-white.svg";
import copyIcon from "../../../../icons/copy.svg";
import openLinkIcon from "../../../../icons/open-link.svg";
import addToFavouriteIcon from "../../../../icons/noteeditor/editor/favourites.svg";
import favouritedIcon from "../../../../icons/noteeditor/editor/favourites-filled.svg";

import useOutsideAlerter from "../../../../utils/useOutsideAlerter";
import firebase from "../../../../utils/firebase";
import addTagIcon from "../../../../icons/white-add-tag-icon.svg";

import "./highlightscard.css";
import TagItem from "../../../../components/TagItem/TagItem";
import TagModel from "../../../../Models/Tag";

const { Option } = Select;

function HighlightsCard({ highlight, tags, refetchHighlights }) {
  const menuRef = useRef(null);
  const tagInputRef = useRef(null);

  const [state, setState] = useState({
    highlight: highlight,
    tags: tags,
    selectedTags: [],
    selectedTagNames: [],
    cardMenuVisible: false,
    tagInputVisible: false,
  });

  useEffect(() => {
    setState((prevState) => {
      return {
        ...prevState,
        highlight: highlight,
        tags: tags,
      };
    });
    if (highlight != undefined) {
      if (highlight.tags.length) {
        getFullTags();
      }
    }
  }, [highlight, tags]);

  const getFullTags = () => {
    const tagIds = highlight.tags;

    const fullTags = [];
    const promises = [];

    tagIds.forEach((tagId) => {
      const promise = firebase.firestore().collection("tags").doc(tagId).get();

      promises.push(promise);
    });

    Promise.all(promises).then((results) => {
      results.forEach((result) => {
        const tag = result.data();
        fullTags.push(tag);
      });

      const selectedTagNames = fullTags.map((selectedTag) => selectedTag.name);

      setState((prevState) => {
        return {
          ...prevState,
          selectedTags: fullTags,
          selectedTagNames: selectedTagNames,
        };
      });
    });
  };

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

  const copyHighlightText = () => {
    navigator.clipboard.writeText(highlight.string);
    setState((prevState) => {
      return {
        ...prevState,
        cardMenuVisible: false,
      };
    });
  };

  const openHighlightLink = () => {
    const newWindow = window.open(
      highlight.url,
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

  const toggleFavourite = async () => {
    try {
      await firebase
        .firestore()
        .collection("highlights")
        .doc(highlight.id)
        .update({
          favourited: !state.highlight.favourited,
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

  const removeTag = async (tag) => {
    try {
      const selectedTags = state.selectedTags;

      const newSelectedTags = selectedTags.filter(
        (selectedTag) => selectedTag.id != tag.id
      );

      setState((prevState) => {
        return {
          ...prevState,
          selectedTags: newSelectedTags,
        };
      });

      const newSelectedTagIds = newSelectedTags.map(
        (selectedTag) => selectedTag.id
      );

      const newSelectedTagNames = newSelectedTags.map(
        (selectedTag) => selectedTag.name
      );

      setState((prevState) => {
        return {
          ...prevState,
          selectedTagNames: newSelectedTagNames,
        };
      });

      await firebase
        .firestore()
        .collection("highlights")
        .doc(highlight.id)
        .update({
          tags: newSelectedTagIds,
        });

      refetchHighlights();
    } catch (err) {
      console.log(err);
    }
  };

  const handleTagSelect = async (value) => {
    try {
      const { tags, selectedTags, selectedTagNames, highlight } = state;

      var tagExists = false;
      var tagAlreadyAdded = false;
      var newTag = undefined;

      tags.forEach((tag) => {
        if (tag.name == value) {
          tagExists = true;
          newTag = tag;
        }
      });

      selectedTags.forEach((tag) => {
        if (tag.name == value) {
          tagAlreadyAdded = true;
        }
      });

      if (tagAlreadyAdded) return;

      if (!tagExists) {
        const uid = await firebase.auth().currentUser.uid;
        newTag = new TagModel({ name: value, uid: uid }).getObject();

        await firebase
          .firestore()
          .collection("tags")
          .doc(newTag.id)
          .set(newTag);

        tags.push(newTag);
      }
      selectedTags.push(newTag);
      selectedTagNames.push(newTag.name);

      highlight.tags.push(newTag.id);

      await firebase
        .firestore()
        .collection("highlights")
        .doc(highlight.id)
        .update({
          tags: highlight.tags,
        });
      setState((prevState) => {
        return {
          ...prevState,
          selectedTags: selectedTags,
          selectedTagNames: selectedTagNames,
          highlight: highlight,
        };
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleTagDeselect = async (value) => {
    try {
      var { tags } = state;

      var tagExists = false;
      var newTag = undefined;

      tags.forEach((tag) => {
        if (tag.name == value) {
          tagExists = true;
          newTag = tag;
        }
      });
      if (tagExists) {
        removeTag(newTag);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getMenuForHighlightCard = () => {
    return (
      <div className="highlight-card-menu" ref={menuRef}>
        <div onClick={copyHighlightText}>
          <img src={copyIcon} style={{ width: "15px" }} /> <p>Copy Text</p>
        </div>
        {/* <div onClick={toggleFavourite}>
          <img
            src={
              state.highlight.favourited ? favouritedIcon : addToFavouriteIcon
            }
            style={{ width: "17px" }}
          />
          <p>
            {state.highlight.favourited
              ? "Remove from favourites"
              : "Add to favourites"}
          </p>
        </div> */}
        <div onClick={openHighlightLink}>
          <img src={openLinkIcon} style={{ width: "15px" }} />
          <p>Show original highlight</p>
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
    <div className="highlight-card">
      <div
        className="highlight-card-header"
        style={{
          background: highlight.metadata.image
            ? `url(${highlight.metadata.image})`
            : highlight.bannerColor,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="highlight-card-dark-overlay">
          <div className="highlight-card-header-options">
            <Popover
              placement="rightTop"
              content={getMenuForHighlightCard()}
              trigger={"click"}
              overlayClassName={"no-arrow"}
              visible={state.cardMenuVisible}
              destroyTooltipOnHide={true}
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
          <div className="highlight-card-header-info">
            <div
              style={{
                backgroundColor: highlight.color,
                width: "15px",
                height: "15px",
                borderRadius: "100px",
                marginRight: "5px",
              }}
            ></div>
            <h3 className="highlight-card-website">
              {highlight.metadata.title
                ? highlight.metadata.title
                : highlight.url}
            </h3>
            <p className="highlight-card-createdon">
              {moment(highlight.createdOn).format("DD MMM YYYY")}
            </p>
          </div>
        </div>
      </div>
      <div className="highlight-card-content">
        {state.tagInputVisible ? (
          <div
            className="tag-input-container-highlight-card"
            ref={tagInputRef}
            style={{ width: "225px" }}
          >
            <Select
              placeholder="Enter tags"
              mode="tags"
              autoFocus={true}
              open={true}
              maxTagCount={3}
              defaultValue={state.selectedTagNames}
              onSelect={handleTagSelect}
              onDeselect={handleTagDeselect}
              key={
                state.tagInputVisible
                  ? "input-visible" + state.highlight.id
                  : "input-hidden" + state.highlight.id
              }
              getPopupContainer={(trigger) => trigger.parentElement}
            >
              {state.tags.map((tag) => (
                <Option key={tag.name}>{tag.name}</Option>
              ))}
            </Select>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {Array.from(state.selectedTags)
              .splice(0, 3)
              .map((tag) => (
                <TagItem
                  tag={tag}
                  removeTag={removeTag}
                  key={Date.now() + Math.random()}
                />
              ))}
            {state.selectedTags.length > 3 && (
              <p className="excess-tag-count">
                +{state.selectedTags.length - 3}...
              </p>
            )}

            <img
              src={addTagIcon}
              style={{
                width: "25px",
                marginRight: "auto",
                cursor: "pointer",
              }}
              onClick={toggleTagInput}
            />
          </div>
        )}
        <p>{highlight.string}</p>
      </div>
    </div>
  );
}

export default HighlightsCard;
