import React, { useState, useEffect } from "react";
import SnapCard from "./components/SnapCard/SnapCard";
import searchIcon from "../../icons/search-icon.svg";
import ellipsisIcon from "../../icons/ellipsis.svg";
import firebase from "../../utils/firebase";
import Masonry from "react-masonry-css";

import "./images.css";
import useIsMountedRef from "../../utils/useIsMounteRef";
import { Select } from "antd";

const { Option } = Select;

const breakpointColumnsObj = {
  default: 2,
  1100: 2,
  700: 1,
  500: 1,
};

function Images({ sidebarOpen }) {
  const isMountedRef = useIsMountedRef();

  const [state, setState] = useState({
    sidebarOpen: sidebarOpen,
    snaps: [],
    tags: [],
    searchActive: true,
    tagIdsArr: [],
  });

  useEffect(() => {
    setState((prevState) => {
      return {
        ...prevState,
        sidebarOpen: sidebarOpen,
      };
    });
  }, [sidebarOpen]);

  useEffect(() => {
    fetchSnaps();
    fetchTags();
  }, []);

  useEffect(() => {
    if (!state.searchActive) {
      fetchSnaps();
      fetchTags();
    }
  }, [state.searchActive]);

  const fetchTags = async () => {
    try {
      const uid = firebase.auth().currentUser.uid;
      await firebase
        .firestore()
        .collection("tags")
        .where("uid", "==", uid)
        .orderBy("createdOn", "desc")
        .onSnapshot((snap) => {
          const tags = [];
          const tagDocs = snap.docs;

          tagDocs.forEach((doc) => {
            tags.push(doc.data());
          });

          if (isMountedRef.current) {
            setState((prevState) => {
              return {
                ...prevState,
                tags: tags,
              };
            });
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSnaps = async () => {
    try {
      const uid = firebase.auth().currentUser.uid;
      await firebase
        .firestore()
        .collection("snaps")
        .where("uid", "==", uid)
        .orderBy("createdOn", "desc")
        .onSnapshot((snap) => {
          const snaps = [];
          const snapDocs = snap.docs;

          snapDocs.forEach((doc) => {
            snaps.push(doc.data());
          });

          if (isMountedRef.current) {
            setState((prevState) => {
              return {
                ...prevState,
                snaps: snaps,
              };
            });
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  const handleTagChange = async (value) => {
    try {
      const tagNamesArr = value;
      const tagIdsArr = [];

      tagNamesArr.forEach((tagName) => {
        state.tags.forEach((tag) => {
          if (tag.name == tagName) {
            tagIdsArr.push(tag.id);
          }
        });
      });

      if (tagIdsArr.length > 0) {
        setState((prevState) => {
          return {
            ...prevState,
            searchActive: true,
            tagIdsArr: tagIdsArr,
          };
        });
        fetchSnapsFromTagIds(tagIdsArr);
      } else {
        setState((prevState) => {
          return {
            ...prevState,
            searchActive: false,
            tagIdsArr: [],
          };
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const refetchSnaps = () => {
    return;
    if (state.searchActive) {
      fetchSnapsFromTagIds(state.tagIdsArr);
    }
  };

  const fetchSnapsFromTagIds = async (tagIdsArr) => {
    try {
      await firebase
        .firestore()
        .collection("snaps")
        .where("tags", "array-contains-any", tagIdsArr)
        .orderBy("createdOn", "desc")
        .onSnapshot((snap) => {
          const images = snap.docs;

          const imagesData = [];

          images.forEach((snapDoc) => {
            imagesData.push(snapDoc.data());
          });

          setState((prevState) => {
            return {
              ...prevState,
              snaps: imagesData,
            };
          });
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="snaps-container">
      <div
        className={
          state.sidebarOpen
            ? "snaps-header snaps-header-sidebar-open"
            : "snaps-header snaps-header-sidebar-closed"
        }
      >
        <Select
          mode="tags"
          placeholder={
            <React.Fragment>
              <img src={searchIcon} />
              &nbsp; Search
            </React.Fragment>
          }
          showSearch={true}
          allowClear={true}
          onChange={handleTagChange}
          className={"images-search-input"}
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
      </div>
      <div className="snaps-content-container">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {state.snaps.map((snap) => (
            <div key={snap.id}>
              <SnapCard
                snap={snap}
                tags={state.tags}
                refetchSnaps={refetchSnaps}
              />
            </div>
          ))}
        </Masonry>
      </div>
    </div>
  );
}

export default Images;
