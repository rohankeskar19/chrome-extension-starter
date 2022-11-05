import React, { useEffect, useState } from "react";
import "./articles.css";
import searchIcon from "../../icons/search-icon.svg";
import ellipsisIcon from "../../icons/ellipsis.svg";
import firebase from "../../utils/firebase";
import Masonry from "react-masonry-css";
import ArticleCard from "./components/ArticleCard/ArticleCard";
import useIsMountedRef from "../../utils/useIsMounteRef";
import { Select } from "antd";

const { Option } = Select;

const breakpointColumnsObj = {
  default: 2,
  1100: 2,
  700: 1,
  500: 1,
};

function Articles({ sidebarOpen }) {
  const isMountedRef = useIsMountedRef();

  const [state, setState] = useState({
    sidebarOpen: sidebarOpen,
    articles: [],
    tags: [],
    searchActive: false,
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
    fetchPages();
    fetchTags();
  }, []);

  useEffect(() => {
    if (!state.searchActive) {
      fetchPages();
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

  const fetchPages = async () => {
    try {
      const uid = firebase.auth().currentUser.uid;
      await firebase
        .firestore()
        .collection("pages")
        .where("uid", "==", uid)
        .orderBy("createdOn", "desc")
        .onSnapshot((snap) => {
          const pages = [];
          const pageDocs = snap.docs;

          pageDocs.forEach((doc) => {
            pages.push(doc.data());
          });

          if (isMountedRef.current && !state.searchActive) {
            setState((prevState) => {
              return {
                ...prevState,
                articles: pages,
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
        fetchArticlesFromTagIds(tagIdsArr);
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

  const refetchArticles = () => {
    return;
    if (state.searchActive) {
      fetchArticlesFromTagIds(state.tagIdsArr);
    }
  };

  const fetchArticlesFromTagIds = async (tagIdsArr) => {
    try {
      await firebase
        .firestore()
        .collection("pages")
        .where("tags", "array-contains-any", tagIdsArr)
        .orderBy("createdOn", "desc")
        .onSnapshot((snap) => {
          const articles = snap.docs;

          const articlesData = [];

          articles.forEach((articleDoc) => {
            articlesData.push(articleDoc.data());
          });

          setState((prevState) => {
            return {
              ...prevState,
              articles: articlesData,
            };
          });
        });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="articles-container">
      <div
        className={
          state.sidebarOpen
            ? "articles-header articles-header-sidebar-open"
            : "articles-header articles-header-sidebar-closed"
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
          className={"articles-search-input"}
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
      <div className="articles-content-container">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {state.articles.map((article) => (
            <div key={article.id}>
              <ArticleCard
                article={article}
                tags={state.tags}
                refetchArticles={refetchArticles}
              />
            </div>
          ))}
        </Masonry>
      </div>
    </div>
  );
}

export default Articles;
