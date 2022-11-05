import React, { Component } from "react";
import "./noteitem.css";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { Popover, Dropdown } from "antd";
import Loader from "react-loader-spinner";

import copyToIcon from "../../icons/folder-contextmenu/copy.svg";
import moveToIcon from "../../icons/folder-contextmenu/move-to.svg";
import renameIcon from "../../icons/folder-contextmenu/rename.svg";
import deleteIcon from "../../icons/folder-contextmenu/delete.svg";
import searchIcon from "../../icons/search.svg";

import { enableScroll } from "../../utils/scrollHandler";
import constants from "../../utils/constants";

import firebase from "../../utils/firebase";
import keycode from "keycode";
import FileObject from "../../Models/FileObject";
import Singleton from "../../utils/getDocument";

class NoteItem extends Component {
  constructor(props) {
    super(props);
    this.copyFolderModalRef = React.createRef(null);
    this.moveFolderModalRef = React.createRef(null);
    this.renameNoteModalRef = React.createRef(null);
  }

  state = {
    note: this.props.note,
    parentFolder: this.props.parentFolder,
    folders: [],
    xPos: 0,
    yPos: 0,
    ownUpdate: false,
    copyNoteModalVisible: false,
    moveNoteModalVisible: false,
    renameNoteModalVisible: false,
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
        copyNoteModalVisible: false,
        moveNoteModalVisible: false,
        renameNoteModalVisible: false,
        note: this.props.note,
        ownUpdate: true,
      });
    }
  };

  hideModals = (e) => {
    const {
      copyNoteModalVisible,
      moveNoteModalVisible,
      renameNoteModalVisible,
    } = this.state;

    if (this.copyFolderModalRef.current) {
      if (!this.copyFolderModalRef.current.contains(e.target)) {
        if (copyNoteModalVisible) {
          this.setState({
            copyNoteModalVisible: false,
            ownUpdate: true,
          });
        }
      }
    }
    if (this.moveFolderModalRef.current) {
      if (!this.moveFolderModalRef.current.contains(e.target)) {
        if (moveNoteModalVisible) {
          this.setState({
            moveNoteModalVisible: false,
            ownUpdate: true,
          });
        }
      }
    }
    if (this.renameNoteModalRef.current) {
      if (!this.renameNoteModalRef.current.contains(e.target)) {
        if (renameNoteModalVisible) {
          enableScroll();

          this.setState({
            renameNoteModalVisible: false,
            folder: this.props.folder,
            ownUpdate: true,
          });
        }
      }
    }
  };

  saveLastOpenedNote = async () => {
    try {
      const { note } = this.state;

      const uid = await firebase.auth().currentUser.uid;

      await firebase.firestore().collection("users").doc(uid).update({
        lastOpenedNote: note.id,
      });
    } catch (err) {
      console.log(err);
    }
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
          {this.state.folders.map(
            (folder) =>
              folder.id != this.state.parentFolder.id && (
                <div
                  className="folder-item"
                  style={{ borderRadius: "4px" }}
                  onClick={() => this.copyNote(folder)}
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

  moveNote = async (folder) => {
    try {
      var currentNote = this.state.note;

      await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .doc(currentNote.id)
        .update({
          parent: folder.id,
          path: `${folder.path}.`,
        });
    } catch (err) {
      console.log(err);
    }
  };

  copyNote = async (folder) => {
    try {
      var currentNote = this.state.note;

      const newId = firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .doc().id;

      currentNote.id = newId;
      currentNote.path = `${folder.path}.`;
      currentNote.parent = folder.id;

      await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .doc(currentNote.id)
        .set({
          ...currentNote,
        });

      this.setState({
        copyNoteModalVisible: false,
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
          {this.state.folders.map(
            (folder) =>
              folder.id != this.state.parentFolder.id && (
                <div
                  className="folder-item"
                  style={{ borderRadius: "4px" }}
                  onClick={() => this.moveNote(folder)}
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

  handleNameChange = (e) => {
    this.setState({
      note: {
        ...this.state.note,
        name: e.target.value,
      },
      ownUpdate: true,
    });
  };

  static getDerivedStateFromProps(props, state) {
    if (state.ownUpdate) {
      return {
        ...state,
        ownUpdate: false,
      };
    } else {
      if (props.note != state.note) {
        return {
          note: props.note,
        };
      }
      if (props.parentFolder != state.parentFolder) {
        return {
          parentFolder: props.parentFolder,
        };
      }
    }

    return null;
  }

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
        folders: folders,
        ownUpdate: true,
      });
    } catch (err) {
      console.log(err);
    }
  };

  toggleCopyNoteModal = (e) => {
    e.stopPropagation();
    this.setState(
      {
        copyNoteModalVisible: !this.state.copyNoteModalVisible,
        ownUpdate: true,
      },
      () => {
        this.loadFolders(this.state.copyNoteModalVisible);
      }
    );
  };

  toggleMoveNoteModal = (e) => {
    e.stopPropagation();
    this.setState(
      {
        moveNoteModalVisible: !this.state.moveNoteModalVisible,
        ownUpdate: true,
      },
      () => {
        this.loadFolders(this.state.moveNoteModalVisible);
      }
    );
  };

  toggleRenameNoteModal = (e) => {
    e.stopPropagation();
    this.setState({
      renameNoteModalVisible: !this.state.renameNoteModalVisible,
      ownUpdate: true,
    });
  };

  renameNote = async () => {
    try {
      const { note } = this.state;
      enableScroll();
      this.setLoading(true);
      const newNote = new FileObject(
        note.uid,
        note.name,
        note.blocks,
        note.color,
        note.banner,
        note.showBanner,
        note.smallText,
        note.fullWidth,
        note.textAlignment,
        note.fontStyle,
        note.type,
        note.path,
        note.parent,
        note.favourited,
        note.isArchived
      );

      if (note.name.trim() == "") {
        this.setState({
          note: this.props.note,
          renameNoteModalVisible: false,
          ownUpdate: true,
        });
      } else {
        if (note.name == this.props.note.name) {
          this.setState({
            note: this.props.note,
            renameNoteModalVisible: false,
            ownUpdate: true,
          });
        } else {
          this.setState({
            renameNoteModalVisible: false,
            ownUpdate: true,
          });
          const user = await firebase.auth().currentUser;

          const dbNote = await firebase
            .firestore()
            .collection(constants.FILEOBJECTS_COLLECTION)
            .where("id", "==", note.id)
            .where("isArchived", "==", false)
            .where("type", "==", "NOTE")
            .where("uid", "==", user.uid)
            .get();

          await dbNote.docs[0].ref.update({
            ...dbNote.docs[0].data(),
            name: note.name,
            blocks: newNote.blocks,
          });
        }
      }
      this.setLoading(false);
    } catch (err) {
      this.setLoading(false);

      this.setState({
        note: this.props.note,
        ownUpdate: true,
      });
      console.log(err);
    }
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
        ref={this.renameNoteModalRef}
      >
        <input
          type="text"
          placeholder="Untitled"
          value={this.state.note.name}
          onChange={this.handleNameChange}
          onKeyDown={(e) => e.keyCode == 13 && this.renameNote()}
          autoFocus
          onFocus={this.handleFocus}
        />
        <button onClick={this.renameNote}>Save</button>
      </div>
    );
  };

  handleFocus = (event) => event.target.select();

  deleteNote = async (e) => {
    e.stopPropagation();
    try {
      const { note } = this.state;
      this.setLoading(true);
      const user = await firebase.auth().currentUser;

      const dbNote = await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .where("id", "==", note.id)
        .where("isArchived", "==", false)
        .where("type", "==", "NOTE")
        .where("uid", "==", user.uid)
        .get();
      await dbNote.docs[0].ref.update({
        isArchived: true,
      });
    } catch (err) {
      this.setLoading(false);
      console.log(err);
    }
  };

  setActiveNote = () => {
    const { note } = this.state;
    this.props.setActiveNote(note);
    this.saveLastOpenedNote();
  };
  setLoading = (loading) => {
    this.setState({
      loading: loading,
      ownUpdate: true,
    });
  };

  render() {
    const {
      note,
      parentFolder,
      xPos,
      yPos,
      moveNoteModalVisible,
      copyNoteModalVisible,
      renameNoteModalVisible,
      loading,
    } = this.state;

    return (
      <Dropdown
        trigger={["contextMenu"]}
        overlay={
          <div
            className="folder-context-menu"
            // id={note.id.toString()}
            // style={{ position: "fixed", left: xPos, top: yPos }}
          >
            <MenuItem onClick={this.toggleRenameNoteModal}>
              <img src={renameIcon} />
              <span>Rename</span>
            </MenuItem>

            {/* <Popover
          placement="right"
          content={this.getMoveToContent()}
          overlayClassName="no-arrow"
          trigger={"click"}
          visible={moveNoteModalVisible}
          destroyTooltipOnHide={true}
        >
          <MenuItem onClick={this.toggleMoveNoteModal}>
            <img src={moveToIcon} />
            <span>Move to</span>
          </MenuItem>
        </Popover>
        <Popover
          placement="right"
          content={this.getCopyToContent()}
          overlayClassName="no-arrow"
          trigger={"click"}
          visible={copyNoteModalVisible}
          destroyTooltipOnHide={true}
        >
          <MenuItem onClick={this.toggleCopyNoteModal}>
            <img src={copyToIcon} />
            <span>Copy to</span>
          </MenuItem>
        </Popover> */}

            <MenuItem onClick={this.deleteNote}>
              <img src={deleteIcon} />
              <span>Delete</span>
            </MenuItem>
          </div>
        }
      >
        <div className="note-item" onClick={this.setActiveNote}>
          <Popover
            placement="top"
            content={this.getRenameContent()}
            overlayClassName="no-arrow"
            trigger={"click"}
            visible={renameNoteModalVisible}
            destroyTooltipOnHide={true}
          >
            <div className="note-item">
              <span
                style={{ backgroundColor: parentFolder.color }}
                className="note-highlight-color"
              ></span>
              <span className="note-name">{note.name}</span>
              <span style={{ marginLeft: "auto", width: "18px" }}>
                {loading && (
                  <Loader
                    type="Puff"
                    color={parentFolder.color}
                    height={15}
                    width={15}
                  />
                )}
              </span>
            </div>
          </Popover>
        </div>
      </Dropdown>
    );
  }
}

export default NoteItem;
