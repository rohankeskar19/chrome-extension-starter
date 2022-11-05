import React, { useEffect, useState } from "react";
import "./highlights.css";
import searchIcon from "../../icons/search-icon.svg";
import ellipsisIcon from "../../icons/ellipsis.svg";
import HighlightsCard from "./components/HighlightsCard/HighlightsCard";
import firebase from "../../utils/firebase";
import Masonry from "react-masonry-css";
import useIsMountedRef from "../../utils/useIsMounteRef";
import { Input, Select } from "antd";

const { Option } = Select;
const breakpointColumnsObj = {
  default: 2,
  1100: 2,
  700: 1,
  500: 1,
};

function Highlights({ sidebarOpen }) {
  const isMountedRef = useIsMountedRef();

  const [state, setState] = useState({
    sidebarOpen: sidebarOpen,
    searchActive: false,
    highlights: [],
    tags: [],
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
    fetchHighlights();
    fetchTags();
  }, []);

  useEffect(() => {
    if (!state.searchActive) {
      fetchHighlights();
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

  const fetchHighlights = async () => {
    try {
      const uid = firebase.auth().currentUser.uid;

      await firebase
        .firestore()
        .collection("highlights")
        .where("uid", "==", uid)
        .orderBy("createdOn", "desc")
        .onSnapshot((snap) => {
          const highlights = [];
          const highlightDocs = snap.docs;

          highlightDocs.forEach((doc) => {
            highlights.push(doc.data());
          });

          if (isMountedRef.current) {
            setState((prevState) => {
              return {
                ...prevState,
                highlights: highlights,
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

        fetchHighlightsFromTagIds(tagIdsArr);
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

  const refetchHighlights = () => {
    return;
    if (state.searchActive) {
      fetchHighlightsFromTagIds(state.tagIdsArr);
    }
  };

  const fetchHighlightsFromTagIds = async (tagIdsArr) => {
    try {
      await firebase
        .firestore()
        .collection("highlights")
        .where("tags", "array-contains-any", tagIdsArr)
        .orderBy("createdOn", "desc")
        .onSnapshot((snap) => {
          const highlights = snap.docs;

          const highlightsData = [];

          highlights.forEach((highlihgtDoc) => {
            highlightsData.push(highlihgtDoc.data());
          });

          setState((prevState) => {
            return {
              ...prevState,
              highlights: highlightsData,
            };
          });
        });
    } catch (err) {}
  };

  return (
    <div className="highlights-container">
      <div
        className={
          state.sidebarOpen
            ? "highlights-header highlights-header-sidebar-open"
            : "highlights-header highlights-header-sidebar-closed"
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
          onChange={handleTagChange}
          showSearch={true}
          allowClear={true}
          className={"highlights-search-input"}
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
      <div className="highlights-content-container">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {state.highlights.map((highlight) => (
            <div key={highlight.id}>
              <HighlightsCard
                highlight={highlight}
                tags={state.tags}
                refetchHighlights={refetchHighlights}
              />
            </div>
          ))}
        </Masonry>
      </div>
    </div>
  );
}

export default Highlights;
