import React, { Component } from "react";
import { connect } from "react-redux";

import "./sidebar.css";

import addIcon from "../icons/plus.svg";

import sidebarToggle from "../icons/sidebar/sidebar-toggle.svg";

import articleIcon from "../icons/read-article-white.svg";
import snapIcon from "../icons/sidebar/camera.svg";
import highlightIcon from "../icons/sidebar/highlight.svg";
import videosIcon from "../icons/sidebar/videos.svg";
import favouritesIcon from "../icons/sidebar/favourites.svg";
import trashIcon from "../icons/sidebar/delete.svg";
import tweetIcon from "../icons/sidebar/tweet-icon.svg";

import FolderItem from "../components/FolderItem/FolderItem";
import Sidebar from "react-sidebar";
import WindowSingleton from "../utils/getWindow";

class SidebarContent extends Component {
  state = {
    folders: [],
    ownUpdate: false,
    user: this.props.userData,
    folders: this.props.folders,
    sidebarOpen: true,
    sidebarDocked: false,
  };

  constructor(props) {
    super(props);
  }

  static getDerivedStateFromProps(props, state) {
    if (state.ownUpdate) {
      return {
        ...state,
        ownUpdate: false,
      };
    } else {
      if (props.folders != state.folders) {
        return {
          folders: props.folders,
        };
      }
      if (props.userData != state.user) {
        return {
          user: props.userData,
        };
      }
    }

    return null;
  }

  addFolder = () => {
    const newNote = {
      name: "Untitled",
    };
    this.props.createFolder(newNote);
  };

  componentDidMount() {
    const self = this;
    setTimeout(() => {
      const window = WindowSingleton.getWindow();
      window.addEventListener("resize", function (e) {
        const width = window.innerWidth;

        if (width <= 1050) {
          if (!self.state.sidebarDocked) {
            self.setState({
              sidebarDocked: false,
              sidebarOpen: false,
            });
          }
        } else {
          if (self.state.sidebarDocked) {
            self.setState({
              sidebarDocked: true,
            });
          }
        }
      });
    }, 500);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", window);
  }

  addSubNote = (note, path) => {
    this.props.addSubNote(note, path);
  };

  toggleSidebar = (e) => {
    const { sidebarDocked, sidebarOpen } = this.state;
    if (sidebarDocked) {
      if (sidebarOpen) {
        this.setState(
          {
            sidebarDocked: false,
            sidebarOpen: false,
          },
          () => {
            this.props.toggleSidebar(this.state.sidebarOpen);
          }
        );
      } else {
        this.setState(
          {
            sidebarDocked: true,
            sidebarOpen: true,
          },
          () => {
            this.props.toggleSidebar(this.state.sidebarOpen);
          }
        );
      }
    } else {
      this.setState(
        {
          sidebarOpen: !this.state.sidebarOpen,
        },
        () => {
          this.props.toggleSidebar(this.state.sidebarOpen);
        }
      );
    }
  };

  getClassNameForSidebar = () => {
    const { sidebarOpen, sidebarDocked } = this.state;

    if (!sidebarDocked) {
      if (sidebarOpen) {
        return "sidebar-toggle";
      } else {
        return "sidebar-toggle sidebar-toggle-close";
      }
    } else {
      return "sidebar-toggle";
    }
  };

  setSidebarOpen = (bool) => {
    this.setState(
      {
        sidebarOpen: bool,
      },
      () => {
        this.props.toggleSidebar(bool);
      }
    );
  };

  setCurrentPage = (page) => {
    this.props.setTab(page);
  };

  render() {
    const { folders, user, sidebarOpen, sidebarDocked } = this.state;
    return (
      <Sidebar
        open={sidebarOpen}
        docked={sidebarDocked}
        onSetOpen={this.setSidebarOpen}
        styles={{
          sidebar: {
            overflow: "initial",
            backgroundColor: "#2e3235",
            transition: "all 0.2s",
            zIndex: 15,
          },
          overlay: {
            display: "none",
          },
        }}
        sidebar={
          <div className="sidebar-container">
            <div className="header-container">
              <img src={user.profileUrl} />
              <p>{user && user.name && user.name.split(" ")[0]}'s Workspace</p>
            </div>

            <div className="sidebar-content-container">
              <div className="quick-links-container">
                <p>Filters</p>
                <ul>
                  <li onClick={() => this.setCurrentPage(2)}>
                    <img src={articleIcon} />
                    <span>Bookmarks</span>
                  </li>
                  <li onClick={() => this.setCurrentPage(3)}>
                    <img src={snapIcon} />
                    <span>Images</span>
                  </li>
                  {/* <li onClick={() => this.setCurrentPage(4)}>
                    <img src={tweetIcon} />
                    <span>Tweets</span>
                  </li> */}
                  <li onClick={() => this.setCurrentPage(5)}>
                    <img src={highlightIcon} />
                    <span>Highlights</span>
                  </li>
                  {/* <li>
                    <img src={favouritesIcon} />
                    <span>Favourites</span>
                  </li> */}
                  {/* <li>
                    <img src={trashIcon} style={{ width: "16px" }} />
                    <span>Archived</span>
                  </li> */}
                </ul>
              </div>
              <div className="sidebar-controls-container">
                <h4>Notes</h4>
                <div className="add-icon-button" onClick={this.addFolder}>
                  <img src={addIcon} style={{ padding: "5px" }} />
                </div>
              </div>
              <div
                className="sidebar-page-container"
                style={{ width: "100%", height: "100%" }}
              >
                {folders &&
                  folders.map((folder, index) => (
                    <FolderItem
                      folder={folders[index]}
                      key={folder.id}
                      setActiveNote={this.props.setActiveNote}
                    ></FolderItem>
                  ))}
              </div>
            </div>
          </div>
        }
      >
        <div
          className={this.getClassNameForSidebar()}
          onClick={this.toggleSidebar}
        >
          <img src={sidebarToggle} />
        </div>
      </Sidebar>
    );
  }
}

export default SidebarContent;
