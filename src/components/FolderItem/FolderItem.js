import React, { Component } from "react";

import "./folderitem.css";
import { MenuItem } from "react-contextmenu";
import { Dropdown, Popover } from "antd";
import Loader from "react-loader-spinner";

import fileIcon from "../../icons/folder-contextmenu/add-file.svg";
import folderIcon from "../../icons/folder-contextmenu/add-folder.svg";
import changeColorIcon from "../../icons/folder-contextmenu/change-color.svg";
import copyToIcon from "../../icons/folder-contextmenu/copy.svg";
import moveToIcon from "../../icons/folder-contextmenu/move-to.svg";
import renameIcon from "../../icons/folder-contextmenu/rename.svg";
import deleteIcon from "../../icons/folder-contextmenu/delete.svg";
import checkmark from "../../icons/folder-contextmenu/checkmark.svg";
import searchIcon from "../../icons/search.svg";

import triangleIcon from "../../icons/folder-contextmenu/triangle.svg";
import colors from "../../constants/defaultcolors.json";

import { enableScroll } from "../../utils/scrollHandler";

import NoteItem from "../NoteItem/NoteItem";
import firebase from "../../utils/firebase";
import constants from "../../utils/constants";
import FileObject from "../../Models/FileObject";
import unsplashProxyUrl from "../../utils/unsplashProxyUrl";
import getFolderColor from "../../utils/getFolderColor";
import keycode from "keycode";
import axios from "axios";
import apiUrl from "../../utils/getApiUrl";
import Singleton from "../../utils/getDocument";

class FolderItem extends Component {
  constructor(props) {
    super(props);
    this.copyFolderModalRef = React.createRef(null);
    this.moveFolderModalRef = React.createRef(null);
    this.renameFolderModalRef = React.createRef(null);
    this.unsubscribe = undefined;
  }

  state = {
    folder: this.props.folder,
    folders: [],
    topLevelFolders: [],
    subFileObjects: [],
    subFileObjectsOpen: false,
    copyFolderModalVisible: false,
    moveFolderModalVisible: false,
    renameFolderModalVisible: false,
    loading: false,
    ownUpdate: false,
  };

  componentDidMount() {
    const document = Singleton.getDocument();
    document.addEventListener("keydown", this.hideModalsKey);
    document.addEventListener("mousedown", this.hideModals);
    document.addEventListener("contextmenu", this.hideModals);
  }

  hideModalsKey = (e) => {
    if (e.keyCode == keycode("escape")) {
      this.setState({
        copyFolderModalVisible: false,
        moveFolderModalVisible: false,
        renameFolderModalVisible: false,
        folder: this.props.folder,
        ownUpdate: true,
      });
    }
  };

  hideModals = (e) => {
    const {
      copyFolderModalVisible,
      moveFolderModalVisible,
      renameFolderModalVisible,
    } = this.state;

    if (this.copyFolderModalRef.current) {
      if (!this.copyFolderModalRef.current.contains(e.target)) {
        if (copyFolderModalVisible) {
          this.setState({
            copyFolderModalVisible: false,
            ownUpdate: true,
          });
        }
      }
    }
    if (this.moveFolderModalRef.current) {
      if (!this.moveFolderModalRef.current.contains(e.target)) {
        if (moveFolderModalVisible) {
          this.setState({
            moveFolderModalVisible: false,
            ownUpdate: true,
          });
        }
      }
    }
    if (this.renameFolderModalRef.current) {
      if (!this.renameFolderModalRef.current.contains(e.target)) {
        if (renameFolderModalVisible) {
          enableScroll();

          this.setState({
            renameFolderModalVisible: false,
            folder: this.props.folder,
            ownUpdate: true,
          });
        }
      }
    }
  };

  static getDerivedStateFromProps(props, state) {
    if (state.ownUpdate) {
      return {
        ...state,
        ownUpdate: false,
      };
    } else {
      if (props.folder != state.folder) {
        return {
          folder: props.folder,
        };
      }
      if (props.folderData != state.folderData) {
        return {
          folderData: props.folderData,
        };
      }
      if (props.activeFolder != state.activeFolder) {
        return {
          activeFolder: props.activeFolder,
        };
      }
    }

    return null;
  }

  changeColor = async (e, color) => {
    try {
      e.stopPropagation();
      const { folder } = this.state;
      folder.color = color;
      this.setLoading(true);
      const user = await firebase.auth().currentUser;

      const dbFolder = await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .where("id", "==", folder.id)
        .where("isArchived", "==", false)
        .where("type", "==", "FOLDER")
        .where("uid", "==", user.uid)
        .get();

      await dbFolder.docs[0].ref.update({
        ...dbFolder.docs[0].data(),
        color: folder.color,
      });
      this.setLoading(false);
    } catch (err) {
      this.setLoading(false);

      this.setState({
        folder: this.props.folder,
        ownUpdate: true,
      });
      console.log(err);
    }
  };

  getChangeColorContent = () => {
    return (
      <div
        className="change-color-container"
        onContextMenu={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        {colors.map((color, index) =>
          color == this.state.folder.color ? (
            <span
              style={{ backgroundColor: color }}
              className="color-picker-color"
              key={index}
            >
              {color == this.state.folder.color && <img src={checkmark} />}
            </span>
          ) : (
            <span
              style={{ backgroundColor: color }}
              className="color-picker-color"
              key={index}
              onClick={(e) => this.changeColor(e, color)}
            ></span>
          )
        )}
        {/* <img src={addColorIcon} className="add-color-button" /> */}
      </div>
    );
  };

  getCopyToContent = () => {
    return (
      <div
        className="copy-folder-to-content"
        onContextMenu={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        ref={this.copyFolderModalRef}
      >
        <div className="copy-folder-searchbar">
          <input type="text" placeholder="Search" autoFocus />
          <img src={searchIcon} />
        </div>
        <div className="folders-list-container">
          {this.state.topLevelFolders.map(
            (folder) =>
              folder.id != this.state.folder.id &&
              !folder.path.split(".").includes(this.state.folder.id) &&
              folder.id != this.state.folder.parent && (
                <div
                  className="folder-item"
                  style={{ borderRadius: "4px" }}
                  onClick={() => this.copyFolder(folder)}
                  key={folder.id}
                >
                  <svg
                    width="17"
                    height="14"
                    viewBox="0 0 17 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.9125 0C0.863812 0 0 0.889218 0 1.96875V12.0312C0 13.1108 0.863812 14 1.9125 14H15.0875C16.1362 14 17 13.1108 17 12.0312V4.15625C17 3.07672 16.1362 2.1875 15.0875 2.1875H8.51826L6.61821 0.557983C6.19822 0.197798 5.66914 0 5.12241 0H1.9125ZM1.9125 1.3125H5.12241C5.37128 1.3125 5.61109 1.40234 5.80225 1.56628L7.29141 2.84375L5.80225 4.12122C5.61109 4.28516 5.37128 4.375 5.12241 4.375H1.275V1.96875C1.275 1.59841 1.55274 1.3125 1.9125 1.3125ZM8.51826 3.5H15.0875C15.4473 3.5 15.725 3.78591 15.725 4.15625V12.0312C15.725 12.4016 15.4473 12.6875 15.0875 12.6875H1.9125C1.55274 12.6875 1.275 12.4016 1.275 12.0312V5.6875H5.12241C5.66914 5.6875 6.19822 5.4897 6.61821 5.12952L8.51826 3.5Z"
                      fill={folder.color}
                    />
                  </svg>

                  <span>{folder.name}</span>
                </div>
              )
          )}
        </div>
      </div>
    );
  };

  moveFolder = async (folder) => {
    try {
      var currentFolder = this.state.folder;

      await axios.put(`${apiUrl}/fileobject/move/folder`, {
        folderToMove: currentFolder.id,
        to: folder.id,
      });

      this.setState({
        moveFolderModalVisible: false,
        ownUpdate: true,
      });
    } catch (err) {
      console.log(err);
    }
  };

  copyFolder = async (folder) => {
    try {
      var currentFolder = this.state.folder;

      const newId = firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .doc().id;

      currentFolder.id = newId;
      currentFolder.path = `${folder.path}.`;
      currentFolder.parent = folder.id;

      await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .doc(currentFolder.id)
        .set({
          ...currentFolder,
        });

      this.setState({
        copyFolderModalVisible: false,
        ownUpdate: true,
      });
    } catch (err) {
      console.log(err);
    }
  };

  getMoveToContent = () => {
    return (
      <div
        className="copy-folder-to-content"
        onContextMenu={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        ref={this.moveFolderModalRef}
      >
        <div className="copy-folder-searchbar">
          <input type="text" placeholder="Search" autoFocus />
          <img src={searchIcon} />
        </div>
        <div className="folders-list-container">
          {this.state.topLevelFolders.map(
            (folder) =>
              folder.id != this.state.folder.id &&
              !folder.path.includes(this.state.folder.id) &&
              folder.id != this.state.folder.parent && (
                <div
                  className="folder-item"
                  style={{ borderRadius: "4px" }}
                  onClick={() => this.moveFolder(folder)}
                  key={folder.id}
                >
                  <svg
                    width="17"
                    height="14"
                    viewBox="0 0 17 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.9125 0C0.863812 0 0 0.889218 0 1.96875V12.0312C0 13.1108 0.863812 14 1.9125 14H15.0875C16.1362 14 17 13.1108 17 12.0312V4.15625C17 3.07672 16.1362 2.1875 15.0875 2.1875H8.51826L6.61821 0.557983C6.19822 0.197798 5.66914 0 5.12241 0H1.9125ZM1.9125 1.3125H5.12241C5.37128 1.3125 5.61109 1.40234 5.80225 1.56628L7.29141 2.84375L5.80225 4.12122C5.61109 4.28516 5.37128 4.375 5.12241 4.375H1.275V1.96875C1.275 1.59841 1.55274 1.3125 1.9125 1.3125ZM8.51826 3.5H15.0875C15.4473 3.5 15.725 3.78591 15.725 4.15625V12.0312C15.725 12.4016 15.4473 12.6875 15.0875 12.6875H1.9125C1.55274 12.6875 1.275 12.4016 1.275 12.0312V5.6875H5.12241C5.66914 5.6875 6.19822 5.4897 6.61821 5.12952L8.51826 3.5Z"
                      fill={folder.color}
                    />
                  </svg>

                  <span>{folder.name}</span>
                </div>
              )
          )}
        </div>
      </div>
    );
  };

  renameFolder = async () => {
    try {
      const { folder } = this.state;
      enableScroll();
      this.setLoading(true);

      if (folder.name.trim() == "") {
        this.setState({
          folder: this.props.folder,
          renameFolderModalVisible: false,
          ownUpdate: true,
        });
      } else {
        if (folder.name == this.props.folder.name) {
          this.setState({
            folder: this.props.folder,
            renameFolderModalVisible: false,
            ownUpdate: true,
          });
        } else {
          this.setState({
            renameFolderModalVisible: false,
            ownUpdate: true,
          });
          const user = await firebase.auth().currentUser;

          const dbFolder = await firebase
            .firestore()
            .collection(constants.FILEOBJECTS_COLLECTION)
            .where("id", "==", folder.id)
            .where("isArchived", "==", false)
            .where("type", "==", "FOLDER")
            .where("uid", "==", user.uid)
            .get();

          await dbFolder.docs[0].ref.update({
            ...dbFolder.docs[0].data(),
            name: folder.name,
          });
        }
      }
      this.setLoading(false);
    } catch (err) {
      this.setLoading(false);

      this.setState({
        folder: this.props.folder,
        ownUpdate: true,
      });
      console.log(err);
    }
  };

  handleNameChange = (e) => {
    this.setState({
      folder: {
        ...this.state.folder,
        name: e.target.value,
      },
      ownUpdate: true,
    });
  };

  getRenameContent = () => {
    return (
      <div
        className="rename-folder-content"
        onContextMenu={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        ref={this.renameFolderModalRef}
      >
        <input
          type="text"
          placeholder="Untitled"
          value={this.state.folder.name}
          onChange={this.handleNameChange}
          onKeyDown={this.handleKeyDown}
          autoFocus
          onFocus={this.handleFocus}
        />
        <button onClick={this.renameFolder}>Save</button>
      </div>
    );
  };

  handleFocus = (event) => event.target.select();

  handleKeyDown = (e) => {
    if (e.keyCode == 13) {
      this.renameFolder();
    } else if (e.keyCode == 27) {
      this.setState({
        folder: this.props.folder,
        renameFolderModalVisible: false,
        ownUpdate: true,
      });
    }
  };

  loadFolders = async (visible) => {
    if (!visible) {
      return;
    }
    try {
      const currentUser = await firebase.auth().currentUser;

      const uid = currentUser.uid;

      const res = await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .where("uid", "==", uid)
        .where("type", "==", "FOLDER")
        .where("isArchived", "==", false)
        .orderBy("createdOn", "desc")
        .get();

      const folders = res.docs.map((doc) => doc.data());
      this.setState({
        topLevelFolders: folders,
        ownUpdate: true,
      });
    } catch (err) {
      console.log(err);
    }
  };

  toggleCopyFolderModal = (e) => {
    e.stopPropagation();
    this.setState(
      {
        copyFolderModalVisible: !this.state.copyFolderModalVisible,
        ownUpdate: true,
      },
      () => {
        this.loadFolders(this.state.copyFolderModalVisible);
      }
    );
  };

  toggleMoveFolderModal = (e) => {
    e.stopPropagation();
    this.setState(
      {
        moveFolderModalVisible: !this.state.moveFolderModalVisible,
        ownUpdate: true,
      },
      () => {
        this.loadFolders(this.state.moveFolderModalVisible);
      }
    );
  };

  toggleRenameFolderModal = (e) => {
    e.stopPropagation();
    this.setState({
      renameFolderModalVisible: !this.state.renameFolderModalVisible,
      ownUpdate: true,
    });
  };

  deleteFolder = async (e) => {
    e.stopPropagation();
    try {
      this.setLoading(true);

      const { folder } = this.state;
      const user = await firebase.auth().currentUser;

      const dbFolder = await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .where("id", "==", folder.id)
        .where("isArchived", "==", false)
        .where("type", "==", "FOLDER")
        .where("uid", "==", user.uid)
        .get();

      await dbFolder.docs[0].ref.update({
        isArchived: true,
      });
    } catch (err) {
      this.setLoading(false);
      console.log(err);
    }
  };

  createSubNote = async (e) => {
    e.stopPropagation();
    try {
      const { folder } = this.state;
      const user = await firebase.auth().currentUser;
      this.setLoading(true);

      const res = await axios.get(`${unsplashProxyUrl}/get-random?count=1`);

      const bannerUrl = res.data[0] ? res.data[0].urls.regular : "";
      const downloadLocation = res.data[0]
        ? res.data[0].links.download_location
        : "";

      await axios.post(
        `${unsplashProxyUrl}/track-download?url=${downloadLocation}`
      );

      const newFile = new FileObject(
        user.uid,
        "Untitled",
        undefined,
        folder.color,
        bannerUrl,
        true,
        false,
        false,
        1,
        1,
        "NOTE",
        `${folder.path}${folder.id}.`,
        folder.id,
        false,
        false
      );

      const docRef = await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .doc();

      newFile.setId(docRef.id);

      await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .doc(newFile.id)
        .set(newFile.getObject());

      this.setLoading(false);

      this.setState({
        subFileObjectsOpen: true,
        ownUpdate: true,
      });

      this.getSubFileObjects();
    } catch (err) {
      this.setLoading(false);

      console.log(err);
    }
  };

  createSubFolder = async (e) => {
    e.stopPropagation();
    try {
      const { folder } = this.state;
      this.setLoading(true);
      const user = await firebase.auth().currentUser;

      const color = getFolderColor();
      const newFolder = new FileObject(
        user.uid,
        "Untitled",
        undefined,
        color,
        "",
        true,
        false,
        false,
        1,
        1,
        "FOLDER",
        `${folder.path}${folder.id}.`,
        folder.id,
        false,
        false
      );

      const docRef = await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .doc();

      newFolder.setId(docRef.id);

      await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .doc(newFolder.id)
        .set(newFolder.getObject());

      this.setLoading(false);

      this.setState({
        subFileObjectsOpen: true,
        ownUpdate: true,
      });

      this.getSubFileObjects();
    } catch (err) {
      this.setLoading(false);
    }
  };

  getSubFileObjects = async () => {
    try {
      const { folder } = this.state;
      if (this.unsubscribe != undefined) {
        this.unsubscribe();
      }
      const user = await firebase.auth().currentUser;

      this.unsubscribe = firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .where("parent", "==", folder.id)
        .where("uid", "==", user.uid)
        .where("isArchived", "==", false)
        .orderBy("createdOn", "desc")
        .onSnapshot((snap) => {
          const subFileObjects = [];
          snap.docs.forEach((doc) => {
            subFileObjects.push(doc.data());
          });

          this.setState({
            subFileObjects: subFileObjects,
            ownUpdate: true,
          });
        });
    } catch (err) {
      console.log(err);

      this.setLoading(false);
    }
  };

  setLoading = (loading) => {
    this.setState({
      loading: loading,
      ownUpdate: true,
    });
  };

  toggleSubFileObjectOpen = () => {
    this.setState(
      {
        subFileObjectsOpen: !this.state.subFileObjectsOpen,
        ownUpdate: true,
      },
      () => {
        if (this.state.subFileObjects) {
          this.getSubFileObjects();
        }
      }
    );
  };

  render() {
    const {
      folder,
      xPos,
      yPos,
      copyFolderModalVisible,
      moveFolderModalVisible,
      renameFolderModalVisible,
      subFileObjectsOpen,
      subFileObjects,
      loading,
    } = this.state;
    return (
      <div onClick={this.toggleSubFileObjectOpen}>
        <Dropdown
          trigger={["contextMenu"]}
          overlay={
            <div
              className="folder-context-menu"
              style={{ position: "fixed", left: xPos, top: yPos }}
            >
              <MenuItem onClick={this.createSubNote}>
                <img src={fileIcon} />
                <span>New note</span>
              </MenuItem>
              <MenuItem onClick={this.createSubFolder}>
                <img src={folderIcon} />
                <span>New folder</span>
              </MenuItem>

              <MenuItem onClick={this.toggleRenameFolderModal}>
                <img src={renameIcon} />
                <span>Rename</span>
              </MenuItem>

              {/* <Popover
              placement="right"
              content={this.getMoveToContent()}
              overlayClassName="no-arrow"
              trigger={"click"}
              visible={moveFolderModalVisible}
              destroyTooltipOnHide={true}
            >
              <MenuItem onClick={this.toggleMoveFolderModal}>
                <img src={moveToIcon} />
                <span>Move to</span>
              </MenuItem>
            </Popover> */}
              {/* <Popover
              placement="right"
              content={this.getCopyToContent()}
              overlayClassName="no-arrow"
              trigger={"click"}
              visible={copyFolderModalVisible}
              destroyTooltipOnHide={true}
            >
              <MenuItem onClick={this.toggleCopyFolderModal}>
                <img src={copyToIcon} />
                <span>Copy to</span>
              </MenuItem>
            </Popover> */}
              <Popover
                placement="right"
                content={this.getChangeColorContent()}
                overlayClassName="no-arrow"
                trigger="click"
              >
                <MenuItem onClick={(e) => e.stopPropagation()}>
                  <img src={changeColorIcon} />
                  <span>Color</span>
                  <img src={triangleIcon} className="context-menu-arrow" />
                </MenuItem>
              </Popover>

              <MenuItem onClick={this.deleteFolder}>
                <img src={deleteIcon} />
                <span>Delete</span>
              </MenuItem>
            </div>
          }
        >
          <Popover
            placement="top"
            content={this.getRenameContent()}
            overlayClassName="no-arrow"
            trigger={"click"}
            visible={renameFolderModalVisible}
            destroyTooltipOnHide={true}
          >
            <div className="folder-item">
              {subFileObjectsOpen ? (
                <svg
                  width="17"
                  height="14"
                  viewBox="0 0 17 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.82185 0C0.822869 0 0 0.889218 0 1.96875V12.4277H0.00632587C-0.00545968 13.2462 0.61068 14 1.41779 14H13.1768C13.9339 14 14.6164 13.4894 14.8824 12.7234L16.9098 6.89062V6.88892C17.2564 5.90697 16.5589 4.8125 15.5862 4.8125H15.3845V4.15625C15.3845 3.07672 14.5617 2.1875 13.5627 2.1875H8.11451L6.30531 0.557983C6.30505 0.557983 6.30479 0.557983 6.30452 0.557983C5.90446 0.197798 5.40044 0 4.87962 0H1.82185ZM1.82185 1.3125H4.87962C5.11669 1.3125 5.34513 1.40234 5.52723 1.56628L7.50565 3.3479C7.61486 3.44624 7.75253 3.50006 7.89469 3.5H13.5627C13.9054 3.5 14.17 3.78591 14.17 4.15625V4.8125H3.82715C3.07007 4.8125 2.38752 5.32307 2.12154 6.08911L1.21457 8.69873V1.96875C1.21457 1.59841 1.47914 1.3125 1.82185 1.3125ZM3.82715 6.125H15.5862C15.748 6.125 15.8329 6.2585 15.7751 6.42151C15.7746 6.42293 15.7741 6.42436 15.7736 6.42578L13.7453 12.262C13.6558 12.5197 13.4318 12.6875 13.1768 12.6875H1.41779C1.25677 12.6875 1.17148 12.555 1.22801 12.3927C1.22827 12.3924 1.22854 12.3921 1.2288 12.3918L3.25861 6.55054C3.34809 6.29283 3.57209 6.125 3.82715 6.125Z"
                    fill={folder.color}
                  />
                </svg>
              ) : (
                <svg
                  width="17"
                  height="14"
                  viewBox="0 0 17 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.9125 0C0.863812 0 0 0.889218 0 1.96875V12.0312C0 13.1108 0.863812 14 1.9125 14H15.0875C16.1362 14 17 13.1108 17 12.0312V4.15625C17 3.07672 16.1362 2.1875 15.0875 2.1875H8.51826L6.61821 0.557983C6.19822 0.197798 5.66914 0 5.12241 0H1.9125ZM1.9125 1.3125H5.12241C5.37128 1.3125 5.61109 1.40234 5.80225 1.56628L7.29141 2.84375L5.80225 4.12122C5.61109 4.28516 5.37128 4.375 5.12241 4.375H1.275V1.96875C1.275 1.59841 1.55274 1.3125 1.9125 1.3125ZM8.51826 3.5H15.0875C15.4473 3.5 15.725 3.78591 15.725 4.15625V12.0312C15.725 12.4016 15.4473 12.6875 15.0875 12.6875H1.9125C1.55274 12.6875 1.275 12.4016 1.275 12.0312V5.6875H5.12241C5.66914 5.6875 6.19822 5.4897 6.61821 5.12952L8.51826 3.5Z"
                    fill={folder.color}
                  />
                </svg>
              )}

              <span>{folder.name}</span>
              <span style={{ marginLeft: "auto", width: "18px" }}>
                {loading && (
                  <Loader
                    type="Puff"
                    color={folder.color}
                    height={15}
                    width={15}
                  />
                )}
              </span>
            </div>
          </Popover>
        </Dropdown>
        <div
          className={
            subFileObjectsOpen
              ? "sub-file-objects sub-file-objects-open"
              : "sub-file-objects sub-file-objects-close"
          }
          onClick={(e) => e.stopPropagation()}
          style={{ paddingLeft: `${folder.path.split(".").length + 15}px` }}
        >
          {subFileObjects.length > 0 ? (
            subFileObjects.map((fileObject, index) => {
              return fileObject.type == "FOLDER" ? (
                <FolderItem
                  folder={fileObject}
                  key={fileObject.id}
                  setActiveNote={this.props.setActiveNote}
                />
              ) : (
                <NoteItem
                  note={fileObject}
                  parentFolder={folder}
                  key={fileObject.id}
                  setActiveNote={this.props.setActiveNote}
                />
              );
            })
          ) : (
            <p
              style={{
                color: "#fff",
                width: "89%",
                marginLeft: "auto",
                userSelect: "none",
                fontWeight: "200",
              }}
            >
              Empty
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default FolderItem;
