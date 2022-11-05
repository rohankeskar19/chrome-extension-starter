import React, { useEffect, useState } from "react";
import "./tweets.css";
import searchIcon from "../../icons/search-icon.svg";
import ellipsisIcon from "../../icons/ellipsis.svg";
import firebase from "../../utils/firebase";
import Masonry from "react-masonry-css";
import TweetCard from "./components/TweetCard/TweetCard";
import useIsMountedRef from "../../utils/useIsMounteRef";

const breakpointColumnsObj = {
  default: 2,
  1100: 2,
  700: 1,
  500: 1,
};

function Tweets({ sidebarOpen }) {
  const isMountedRef = useIsMountedRef();

  const [state, setState] = useState({
    sidebarOpen: sidebarOpen,
    tweets: [],
    tags: [],
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
    fetchTweets();
    fetchTags();
  }, []);

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

  const fetchTweets = async () => {
    try {
      const uid = firebase.auth().currentUser.uid;
      await firebase
        .firestore()
        .collection("tweets")
        .where("uid", "==", uid)
        .orderBy("createdOn", "desc")
        .onSnapshot((snap) => {
          const tweets = [];
          const tweetDocs = snap.docs;

          tweetDocs.forEach((doc) => {
            tweets.push(doc.data());
          });

          if (isMountedRef.current) {
            setState((prevState) => {
              return {
                ...prevState,
                tweets: tweets,
              };
            });
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="tweets-container">
      <div
        className={
          state.sidebarOpen
            ? "tweets-header tweets-header-sidebar-open"
            : "tweets-header tweets-header-sidebar-closed"
        }
      >
        <img src={searchIcon} className="tweets-search-icon" />
        {/* <div className="tweets-menu-toggle">
          <img src={ellipsisIcon} />
        </div> */}
      </div>
      <div className="tweets-content-container">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {state.tweets.map((tweet) => (
            <div key={tweet.id}>
              <TweetCard tweet={tweet} tags={state.tags} />
            </div>
          ))}
        </Masonry>
      </div>
    </div>
  );
}

export default Tweets;
