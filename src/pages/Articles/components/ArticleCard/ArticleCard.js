import { message, Popover, Select } from "antd";
import React, { useState, useEffect, useRef } from "react";

import ellipsisIcon from "../../../../icons/ellipsis-white.svg";
import openLinkIcon from "../../../../icons/open-link.svg";
import readArticleIcon from "../../../../icons/read-article.svg";
import addToFavouriteIcon from "../../../../icons/noteeditor/editor/favourites.svg";
import favouritedIcon from "../../../../icons/noteeditor/editor/favourites-filled.svg";
import addTagIcon from "../../../../icons/white-add-tag-icon.svg";

import trashIcon from "../../../../icons/trash.svg";
import firebase from "../../../../utils/firebase";

import useOutsideAlerter from "../../../../utils/useOutsideAlerter";
import TagItem from "../../../../components/TagItem/TagItem";
import TagModel from "../../../../Models/Tag";

import "./articlecard.css";

const { Option } = Select;

function ArticleCard({ article, tags, refetchArticles }) {
  const menuRef = useRef(null);
  const tagInputRef = useRef(null);

  const [state, setState] = useState({
    article: article,
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
        article: article,
        tags: tags,
      };
    });
    if (article != undefined) {
      if (article.tags?.length) {
        getFullTags();
      }
    }
  }, [article, tags]);

  const getFullTags = () => {
    const tagIds = article.tags;

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

  const openArticleLink = () => {
    const newWindow = window.open(article.url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
    setState((prevState) => {
      return {
        ...prevState,
        cardMenuVisible: false,
      };
    });
  };

  const deleteArticle = async () => {
    try {
      await firebase.firestore().collection("pages").doc(article.id).delete();
      refetchArticles();
    } catch (err) {
      console.log(err);
    }
  };

  const toggleFavourite = async () => {
    try {
      await firebase.firestore().collection("pages").doc(article.id).update({
        favourited: !state.article.favourited,
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
      <div className="article-card-menu" ref={menuRef}>
        <div>
          <img src={readArticleIcon} style={{ width: "15px" }} />
          <p>Read article</p>
          <span className="coming-soon-text">Coming soon</span>
        </div>
        <div onClick={openArticleLink}>
          <img src={openLinkIcon} style={{ width: "15px" }} />
          <p>Show original article</p>
        </div>
        {/* <div onClick={toggleFavourite}>
          <img
            src={state.article.favourited ? favouritedIcon : addToFavouriteIcon}
            style={{ width: "17px" }}
          />
          <p>
            {state.article.favourited
              ? "Remove from favourites"
              : "Add to favourites"}
          </p>
        </div> */}
        <div onClick={deleteArticle}>
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

      await firebase.firestore().collection("pages").doc(article.id).update({
        tags: newSelectedTagIds,
      });
      refetchArticles();
    } catch (err) {
      console.log(err);
    }
  };

  const handleTagSelect = async (value) => {
    try {
      const { tags, selectedTags, selectedTagNames, article } = state;

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

      article.tags.push(newTag.id);

      await firebase.firestore().collection("pages").doc(article.id).update({
        tags: article.tags,
      });
      setState((prevState) => {
        return {
          ...prevState,
          selectedTags: selectedTags,
          selectedTagNames: selectedTagNames,
          article: article,
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
    <div className="article-card">
      <div
        className="article-card-banner"
        style={{
          background: article.metadata.image
            ? `url(${article.metadata.image})`
            : article.bannerColor,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="article-card-banner-options">
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
              className="article-card-menu-toggle"
              onClick={toggleCardMenu}
            >
              <img src={ellipsisIcon} className="highlight-card-ellipsis" />
            </div>
          </Popover>
        </div>
        {/* <div className="article-card-dark-overlay"></div> */}
      </div>
      <div className="article-card-info">
        <h3>{article.metadata.title ? article.metadata.title : article.url}</h3>
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
                  ? "input-visible" + state.article.id
                  : "input-hidden" + state.article.id
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
        <p style={{ marginTop: "10px" }}>{article.metadata.provider}</p>
      </div>
    </div>
  );
}

export default ArticleCard;
