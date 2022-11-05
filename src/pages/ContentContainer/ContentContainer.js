import React, { useState, useEffect } from "react";
import NoteEditor from "../NoteEditor/NoteEditor";
import Articles from "../Articles/Articles";
import Images from "../Images/Images";
import Tweets from "../Tweets/Tweets";
import Highlights from "../Highlights/Highlights";

import "./contentcontainer.css";

function ContentContainer({
  currentTab,
  sidebarOpen,
  activeNote,
  setActiveNote,
}) {
  const [state, setState] = useState({
    sidebarOpen: sidebarOpen,
    activeNote: activeNote,
  });

  useEffect(() => {
    setState((prevState) => {
      return {
        ...prevState,
        sidebarOpen: sidebarOpen,
        activeNote: activeNote,
      };
    });
  }, [sidebarOpen, activeNote]);

  switch (currentTab) {
    case 1:
      return (
        <NoteEditor activeNote={activeNote} setActiveNote={setActiveNote} />
      );
    case 2:
      return <Articles sidebarOpen={sidebarOpen} />;
    case 3:
      return <Images sidebarOpen={sidebarOpen} />;
    case 4:
      return <Tweets sidebarOpen={sidebarOpen} />;
    case 5:
      return <Highlights sidebarOpen={sidebarOpen} />;
    // case 6:
    //   return <Favourites sidebarOpen={sidebarOpen} />;
  }
}

export default ContentContainer;
