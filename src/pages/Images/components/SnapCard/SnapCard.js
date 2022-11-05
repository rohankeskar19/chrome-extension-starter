import { message, Popover, Select, Tag } from "antd";
import React, { useState, useEffect, useRef } from "react";

import ellipsisIcon from "../../../../icons/ellipsis-white.svg";

import fullScreenIcon from "../../../../icons/full-screen-icon.svg";
import trashIcon from "../../../../icons/trash.svg";
import addToFavouriteIcon from "../../../../icons/noteeditor/editor/favourites.svg";
import favouritedIcon from "../../../../icons/noteeditor/editor/favourites-filled.svg";
import addTagIcon from "../../../../icons/white-add-tag-icon.svg";

import useOutsideAlerter from "../../../../utils/useOutsideAlerter";
import firebase from "../../../../utils/firebase";

import "./snapcard.css";
import TagItem from "../../../../components/TagItem/TagItem";
import TagModel from "../../../../Models/Tag";
import $ from "jquery";

const { Option } = Select;

function SnapCard({ snap, tags, refetchSnaps }) {
  const menuRef = useRef(null);
  const imageRef = useRef(null);
  const tagInputRef = useRef(null);

  const [state, setState] = useState({
    snap: snap,
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
        snap: snap,
        tags: tags,
      };
    });
    if (snap != undefined) {
      if (snap.tags.length) {
        getFullTags();
      }
    }
  }, [snap, tags]);

  const hideTagInput = () => {
    setState((prevState) => {
      return {
        ...prevState,
        tagInputVisible: false,
      };
    });
  };

  const toggleTagInput = (e) => {
    e.stopPropagation();
    setState((prevState) => {
      return {
        ...prevState,
        tagInputVisible: !state.tagInputVisible,
      };
    });
  };

  const deleteSnap = async (e) => {
    e.stopPropagation();
    try {
      await firebase
        .firestore()
        .collection("snaps")
        .doc(state.snap.id)
        .delete();
      refetchSnaps();
    } catch (err) {
      console.log(err);
    }
  };

  const openViewImageModal = (e) => {
    e.stopPropagation();
    const imageUrl = state.snap.image;
    $("#notealy-extension-root").css("display", "none");
    $("#notealy-modal-iframe-container").css("display", "block");

    const iframeWindow = $("#notealy-modal-iframe-container > iframe")[0];
    iframeWindow.contentWindow.postMessage(
      JSON.stringify({
        message: "toggleViewImageModal",
        imageUrl: imageUrl,
      }),
      "*",
      []
    );

    setState((prevState) => {
      return {
        ...prevState,
        cardMenuVisible: false,
      };
    });
  };

  const toggleFavourite = async (e) => {
    e.stopPropagation();
    try {
      await firebase.firestore().collection("snaps").doc(snap.id).update({
        favourited: !state.snap.favourited,
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

  const getFullTags = () => {
    const tagIds = snap.tags;

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

  const getMenuForSnapCardCard = () => {
    return (
      <div
        className="snap-card-menu"
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div onClick={openViewImageModal}>
          <img src={fullScreenIcon} style={{ width: "17px" }} />
          <p>View in full screen</p>
        </div>
        {/* <div onClick={toggleFavourite}>
          <img
            src={state.snap.favourited ? favouritedIcon : addToFavouriteIcon}
            style={{ width: "17px" }}
          />
          <p>
            {state.snap.favourited
              ? "Remove from favourites"
              : "Add to favourites"}
          </p>
        </div> */}
        <div onClick={deleteSnap}>
          <img src={trashIcon} style={{ width: "17px" }} />
          <p>Delete</p>
        </div>
      </div>
    );
  };

  useOutsideAlerter(tagInputRef, hideTagInput);

  useOutsideAlerter(menuRef, hideMenu);

  const toggleCardMenu = (e) => {
    e.stopPropagation();
    setState((prevState) => {
      return {
        ...prevState,
        cardMenuVisible: !state.cardMenuVisible,
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

      await firebase.firestore().collection("snaps").doc(snap.id).update({
        tags: newSelectedTagIds,
      });
      refetchSnaps();
    } catch (err) {
      console.log(err);
    }
  };

  const handleTagSelect = async (value) => {
    try {
      const { tags, selectedTags, selectedTagNames, snap } = state;

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

      snap.tags.push(newTag.id);

      await firebase.firestore().collection("snaps").doc(snap.id).update({
        tags: snap.tags,
      });
      setState((prevState) => {
        return {
          ...prevState,
          selectedTags: selectedTags,
          selectedTagNames: selectedTagNames,
          snap: snap,
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

  return (
    <div className="snap-card">
      <div className="snap-card-image-container" onClick={openViewImageModal}>
        <img
          src={state.snap.image}
          className="snap-card-image"
          ref={imageRef}
        />
      </div>
      <div
        className="snap-card-controls-container"
        style={{ opacity: state.tagInputVisible ? "1" : "" }}
      >
        {state.tagInputVisible ? (
          <div
            className="tag-input-container-highlight-card"
            ref={tagInputRef}
            style={{ width: "225px" }}
            onClick={(e) => e.stopPropagation()}
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
                  ? "input-visible" + state.snap.id
                  : "input-hidden" + state.snap.id
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
            style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
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
        <Popover
          placement="rightTop"
          content={getMenuForSnapCardCard()}
          trigger={"click"}
          overlayClassName={"no-arrow"}
          visible={state.cardMenuVisible}
          destroyTooltipOnHide={true}
        >
          <div className="snap-card-menu-toggle" onClick={toggleCardMenu}>
            <img src={ellipsisIcon} />
          </div>
        </Popover>
      </div>
    </div>
  );
}

export default SnapCard;
