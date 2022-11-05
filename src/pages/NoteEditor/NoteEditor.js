import React, { Component } from "react";
import "./noteeditor.css";
import Editor from "../../components/Editor/Editor";

import addTagIcon from "../../icons/add-tag.svg";
import ellipsisIcon from "../../icons/ellipsis.svg";

import textAlignLeft from "../../icons/text-align-left.svg";
import textAlignCenter from "../../icons/text-align-center.svg";
import textAlignRight from "../../icons/text-align-right.svg";

import fontStyleRegular from "../../icons/font-style-regular.svg";
import fontStyleSerif from "../../icons/font-style-serif.svg";
import fontStyleMono from "../../icons/font-style-monospace.svg";

import fontStyleRegularActive from "../../icons/font-style-regular-active.svg";
import fontStyleSerifActive from "../../icons/font-style-serif-active.svg";
import fontStyleMonoActive from "../../icons/font-style-monospace-active.svg";

import changeCoverIcon from "../../icons/noteeditor/editor/change-cover-icon.svg";
import addToFavouriteIcon from "../../icons/noteeditor/editor/favourites.svg";
import favouritedIcon from "../../icons/noteeditor/editor/favourites-filled.svg";

import moveToIcon from "../../icons/noteeditor/editor/move-to.svg";
import trashIcon from "../../icons/noteeditor/editor/delete.svg";

import { Popover, Select, Switch } from "antd";
import firebase from "../../utils/firebase";
import constants from "../../utils/constants";
import updateNote from "../../utils/updateNote";
import unsplashProxyUrl from "../../utils/unsplashProxyUrl";
import axios from "axios";
import isJson from "../../utils/isJson";
import Singleton from "../../utils/getDocument";
import $ from "jquery";
import WindowSingleton from "../../utils/getWindow";

var noteDataListener = undefined;
var messageListener = undefined;
var uploadTask = undefined;

class NoteEditor extends Component {
  constructor(props) {
    super(props);
    this.noteName = React.createRef();
    this.noteMenuRef = React.createRef();
    this.ellipsisRef = React.createRef();
    this.tagInputRef = React.createRef();
    this.noteEditorContainerRef = React.createRef();
  }
  state = {
    noteData: this.props.activeNote,
    absoluteActive: this.props.absoluteActive,
    sidebarOpen: this.props.sidebarOpen,
    noteMenuPopupVisible: false,
    uploadProgress: 0,
    uploading: false,
    ownUpdate: false,
    tagInputOpen: false,
  };

  static getDerivedStateFromProps(props, state) {
    try {
      if (state.ownUpdate) {
        return {
          ...state,
          ownUpdate: false,
        };
      } else {
        if (props.activeNote.id != state.noteData.id) {
          return {
            noteData: props.activeNote,
          };
        }

        if (props.sidebarOpen != state.sidebarOpen) {
          return {
            sidebarOpen: props.sidebarOpen,
          };
        }

        if (props.absoluteActive != state.absoluteActive) {
          return {
            absoluteActive: props.absoluteActive,
          };
        }
      }
    } catch (err) {
      console.log(err);
    }

    return null;
  }

  toggleNoteMenuPopup = () => {
    this.setState({
      noteMenuPopupVisible: !this.state.noteMenuPopupVisible,
      ownUpdate: true,
    });
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.noteData && prevState.noteData) {
      if (this.state.noteData.id != prevState.noteData.id) {
        // Listen for note changes
        if (noteDataListener) {
          noteDataListener();
        }

        noteDataListener = firebase
          .firestore()
          .collection(constants.FILEOBJECTS_COLLECTION)
          .doc(this.state.noteData.id)
          .onSnapshot((doc) => {
            if (doc.exists) {
              this.setState({
                noteData: doc.data(),
                ownUpdate: true,
              });
            } else {
              this.props.setActiveNote({});
            }
          });

        this.scrollToTop();

        // Listen for events from inject_script.js
        const window = WindowSingleton.getWindow();

        if (messageListener) {
          window.removeEventListener("message", messageListener);
        }

        const self = this;
        messageListener = window.addEventListener(
          "message",
          async function (e) {
            try {
              const dataIsJson = isJson(e.data);
              if (!dataIsJson) return;
              const data = JSON.parse(e.data);
              const message = data.message;
              if (message == "changeCover") {
                if (data.type == "unsplash_pick") {
                  const url = data.url;
                  const downloadLocation = data.downloadLocation;
                  var noteData = self.state.noteData;
                  noteData = {
                    ...noteData,
                    banner: url,
                  };
                  await updateNote(noteData, "banner");
                  await axios.post(
                    `${unsplashProxyUrl}/track-download?url=${downloadLocation}`
                  );
                  self.setState({
                    noteData: noteData,
                    ownUpdate: true,
                  });
                } else if (data.type == "image_pick") {
                  if (uploadTask) {
                    uploadTask.cancel();
                  }
                  const uid = firebase.auth().currentUser.uid;
                  const storageRef = firebase.storage().ref();
                  const fileName = `${Date.now()}.jpg`;
                  const file = data.file;
                  var noteData = self.state.noteData;
                  noteData = {
                    ...noteData,
                    banner: file,
                  };
                  self.setState({
                    noteData: noteData,
                    ownUpdate: true,
                  });
                  uploadTask = storageRef
                    .child(uid)
                    .child("uploads")
                    .child("banners")
                    .child(fileName)
                    .putString(file, "data_url", { contentType: "image/jpg" });
                  uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                      var progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                      progress =
                        parseInt(progress) == 100
                          ? "100"
                          : parseInt(progress).toPrecision(2).toString();
                      switch (snapshot.state) {
                        case firebase.storage.TaskState.CANCELED: // or 'canceled'
                          self.setState({
                            uploading: false,
                            uploadProgress: 0,
                            ownUpdate: true,
                          });
                          break;
                        case firebase.storage.TaskState.PAUSED: // or 'paused'
                          self.setState({
                            uploading: false,
                            ownUpdate: true,
                          });
                          break;
                        case firebase.storage.TaskState.RUNNING: // or 'running'
                          self.setState({
                            uploading: true,
                            ownUpdate: true,
                          });
                          break;
                      }
                      self.setState({
                        uploadProgress: progress,
                        ownUpdate: true,
                      });
                    },
                    (error) => {},
                    () => {
                      uploadTask.snapshot.ref
                        .getDownloadURL()
                        .then(async (downloadURL) => {
                          try {
                            var noteData = self.state.noteData;
                            noteData = {
                              ...noteData,
                              banner: downloadURL,
                            };
                            await updateNote(noteData, "banner");
                            self.setState({
                              uploading: false,
                              uploadProgress: 0,
                              imageUrl: "",
                              fileInvalidError: false,
                              noteData: noteData,
                              ownUpdate: true,
                            });
                          } catch (err) {
                            console.log(err);
                          }
                        });
                    }
                  );
                } else if (data.type == "url_paste") {
                  const url = data.url;
                  var noteData = self.state.noteData;
                  noteData = {
                    ...noteData,
                    banner: url,
                  };
                  await updateNote(noteData, "banner");
                  self.setState({
                    noteData: noteData,
                    ownUpdate: true,
                  });
                }
              }
            } catch (err) {
              console.log(err);
            }
          }
        );
      }
    }
  }

  componentDidMount() {
    setTimeout(() => {
      const document = Singleton.getDocument();

      document.addEventListener("mousedown", (e) => {
        if (this.noteMenuRef.current && this.ellipsisRef.current) {
          if (
            !this.noteMenuRef.current.contains(e.target) &&
            !this.ellipsisRef.current.contains(e.target)
          ) {
            this.toggleNoteMenuPopup();
          }
        }
      });

      document.addEventListener("mousedown", (e) => {
        if (this.tagInputRef) {
          if (this.tagInputRef.current) {
            if (!this.tagInputRef.current.contains(e.target)) {
              this.toggleTagInput();
            }
          }
        }
      });
    }, 500);
  }

  toggleApp = (e) => {
    // parent.window.postMessage(
    //   JSON.stringify({
    //     message: "toggleApp",
    //   }),
    //   "*",
    //   []
    // );
  };

  toggleCover = (e) => {
    e.stopPropagation();

    const { noteData } = this.state;
    noteData.showBanner = !noteData.showBanner;

    this.setState(
      {
        noteData: {
          ...noteData,
        },
        ownUpdate: true,
      },
      async () => {
        try {
          await updateNote(noteData, "showBanner");
        } catch (err) {
          console.log(err);
        }
      }
    );
  };

  toggleSmallText = (e) => {
    e.stopPropagation();

    const { noteData } = this.state;
    noteData.smallText = !noteData.smallText;

    this.setState(
      {
        noteData: {
          ...noteData,
        },
        ownUpdate: true,
      },
      async () => {
        try {
          await updateNote(noteData, "smallText");
        } catch (err) {
          console.log(err);
        }
      }
    );
  };

  toggleFullWidth = (e) => {
    e.stopPropagation();

    const { noteData } = this.state;
    noteData.fullWidth = !noteData.fullWidth;

    this.setState(
      {
        noteData: {
          ...noteData,
        },
        ownUpdate: true,
      },
      async () => {
        try {
          await updateNote(noteData, "fullWidth");
        } catch (err) {
          console.log(err);
        }
      }
    );
  };

  setFontStyle = (fontStyle) => {
    const { noteData } = this.state;

    noteData.fontStyle = fontStyle;

    this.setState(
      {
        noteData: {
          ...noteData,
        },
        ownUpdate: true,
      },
      async () => {
        try {
          await updateNote(noteData, "fontStyle");
        } catch (err) {
          console.log(err);
        }
      }
    );
  };

  setTextAlignment = (textAlignment) => {
    const { noteData } = this.state;

    noteData.textAlignment = textAlignment;

    this.setState(
      {
        noteData: {
          ...noteData,
        },
        ownUpdate: true,
      },
      async () => {
        try {
          await updateNote(noteData, "textAlignment");
        } catch (err) {
          console.log(err);
        }
      }
    );
  };

  toggleChangeCoverModal = () => {
    this.toggleNoteMenuPopup();

    $("#notealy-modal-iframe-container").css("display", "block");

    const modalIframe = $("#notealy-modal-iframe-container > iframe")[0];

    modalIframe.contentWindow.postMessage(
      JSON.stringify({
        message: "toggleChangeCoverModal",
      })
    );
  };

  toggleFavourite = () => {
    const { noteData } = this.state;

    noteData.favourited = !noteData.favourited;

    this.setState(
      {
        noteData: {
          ...noteData,
        },
        ownUpdate: true,
      },
      async () => {
        try {
          await updateNote(noteData, "favourited");
        } catch (err) {
          console.log(err);
        }
      }
    );
  };

  getNoteMenu = () => {
    const { noteData } = this.state;
    return (
      <div className="note-menu" ref={this.noteMenuRef}>
        <p style={{ fontWeight: "400" }}>TEXT ALIGNMENT</p>
        <div className="text-alignment-buttons-container">
          <div
            className={
              noteData.textAlignment == 1
                ? "text-alignment-button text-alignment-button-active"
                : "text-alignment-button"
            }
            onClick={() => this.setTextAlignment(1)}
          >
            <img src={textAlignLeft} />
          </div>
          <div
            className={
              noteData.textAlignment == 2
                ? "text-alignment-button text-alignment-button-active"
                : "text-alignment-button"
            }
            onClick={() => this.setTextAlignment(2)}
          >
            <img src={textAlignCenter} />
          </div>
          <div
            className={
              noteData.textAlignment == 3
                ? "text-alignment-button text-alignment-button-active"
                : "text-alignment-button"
            }
            onClick={() => this.setTextAlignment(3)}
          >
            <img src={textAlignRight} />
          </div>
        </div>
        <div className="note-menu-divider"></div>
        <p style={{ fontWeight: "400" }}>FONT STYLE</p>
        <div className="font-style-buttons-container">
          <div
            className={
              noteData.fontStyle == 1
                ? "font-style-button font-style-button-active"
                : "font-style-button"
            }
            onClick={() => this.setFontStyle(1)}
          >
            {noteData.fontStyle == 1 ? (
              <img src={fontStyleRegularActive} style={{ width: "30px" }} />
            ) : (
              <img src={fontStyleRegular} style={{ width: "30px" }} />
            )}
          </div>
          <div
            className={
              noteData.fontStyle == 2
                ? "font-style-button font-style-button-active"
                : "font-style-button"
            }
            onClick={() => this.setFontStyle(2)}
          >
            {noteData.fontStyle == 2 ? (
              <img src={fontStyleSerifActive} style={{ width: "38px" }} />
            ) : (
              <img src={fontStyleSerif} style={{ width: "38px" }} />
            )}
          </div>
          <div
            className={
              noteData.fontStyle == 3
                ? "font-style-button font-style-button-active"
                : "font-style-button"
            }
            onClick={() => this.setFontStyle(3)}
          >
            {noteData.fontStyle == 3 ? (
              <img src={fontStyleMonoActive} style={{ width: "45px" }} />
            ) : (
              <img src={fontStyleMono} style={{ width: "45px" }} />
            )}
          </div>
        </div>
        <div className="note-menu-divider"></div>
        <div className="toggle-menu-container">
          <div className="toggle-menu-item" onClick={this.toggleCover}>
            <p>Show cover</p>
            <Switch
              checked={noteData.showBanner}
              onClick={(checked, e) => this.toggleCover(e)}
            />
          </div>
          <div className="toggle-menu-item" onClick={this.toggleSmallText}>
            <p>Small text</p>
            <Switch
              checked={noteData.smallText}
              onClick={(checked, e) => this.toggleSmallText(e)}
            />
          </div>
          {/* <div className="toggle-menu-item" onClick={this.toggleFullWidth}>
            <p>Full width</p>
            <Switch
              checked={noteData.fullWidth}
              onClick={(checked, e) => this.toggleFullWidth(e)}
            />
          </div> */}
        </div>
        <div className="note-menu-divider"></div>
        <div className="note-menu-container">
          <div className="note-menu-item" onClick={this.toggleChangeCoverModal}>
            <img src={changeCoverIcon} />
            <p>Change cover</p>
          </div>
          {/* {noteData.favourited ? (
            <div className="note-menu-item" onClick={this.toggleFavourite}>
              <img src={favouritedIcon} />
              <p>Remove from favourites</p>
            </div>
          ) : (
            <div className="note-menu-item" onClick={this.toggleFavourite}>
              <img src={addToFavouriteIcon} />
              <p>Add to favourites</p>
            </div>
          )} */}

          {/* <div className="note-menu-item">
            <img src={moveToIcon} />
            <p>Move to</p>
          </div> */}
          <div className="note-menu-item" onClick={this.archiveNote}>
            <img src={trashIcon} style={{ width: "16px" }} />
            <p>Archive</p>
          </div>
        </div>
        {/* <div className="note-menu-divider"></div>
        <div className="note-menu-container">
          <div className="note-menu-item">
            <img src={exportIcon} style={{ width: "17px", height: "15px" }} />
            <p>Export</p>
          </div>
        </div> */}
      </div>
    );
  };

  archiveNote = async () => {
    try {
      const { noteData } = this.state;

      noteData.isArchived = true;

      this.toggleNoteMenuPopup();

      await updateNote(noteData, "isArchived");
    } catch (err) {
      console.log(err);
    }
  };

  toggleTagInput = () => {
    this.setState({
      tagInputOpen: !this.state.tagInputOpen,
      ownUpdate: true,
    });
  };

  scrollToTop = () => {
    if (this.noteEditorContainerRef) {
      if (this.noteEditorContainerRef.current) {
        this.noteEditorContainerRef.current.scrollTop = 0;
      }
    }
  };

  scrollToBottom = () => {
    if (this.noteEditorContainerRef) {
      if (this.noteEditorContainerRef.current) {
        this.noteEditorContainerRef.current.scrollTop =
          this.noteEditorContainerRef.current.scrollHeight;
      }
    }
  };

  render() {
    const {
      noteData,
      sidebarOpen,
      noteMenuPopupVisible,
      uploadProgress,
      uploading,
    } = this.state;
    return (
      <div className="page-container">
        {noteData && Object.keys(noteData).length > 0 && (
          <div
            className="note-editor-container"
            ref={this.noteEditorContainerRef}
          >
            <div
              className={
                sidebarOpen
                  ? "note-header note-header-sidebar-open"
                  : "note-header note-header-sidebar-closed"
              }
            >
              {/* {this.state.tagInputOpen ? (
                <div className="tag-input-container" ref={this.tagInputRef}>
                  <Select
                    placeholder="Enter tags"
                    mode="tags"
                    getPopupContainer={(trigger) => trigger}
                    autoFocus={true}
                    open={true}
                    maxTagCount={6}
                  ></Select>
                </div>
              ) : (
                <div
                  className="note-header-button"
                  onClick={this.toggleTagInput}
                >
                  <img src={addTagIcon} />
                </div>
              )} */}

              <div style={{ marginLeft: "auto" }}>
                {/* <div className="note-header-button">
                  <img src={searchIcon} />
                </div> */}
                <Popover
                  trigger={"click"}
                  content={this.getNoteMenu()}
                  destroyTooltipOnHide={true}
                  overlayClassName="no-arrow"
                  placement="bottomRight"
                  visible={noteMenuPopupVisible}
                >
                  <div
                    className="note-header-button"
                    onClick={this.toggleNoteMenuPopup}
                    ref={this.ellipsisRef}
                  >
                    <img src={ellipsisIcon} />
                  </div>
                </Popover>
              </div>
            </div>
            {noteData.showBanner && (
              <div className="dark-overlay">
                <div
                  className={
                    sidebarOpen
                      ? "note-cover note-cover-sidebar-open"
                      : "note-cover note-cover-sidebar-closed"
                  }
                  style={{
                    backgroundImage: `url(${noteData.banner})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                ></div>
                {uploading && (
                  <div className={"cover-uploading-text"}>
                    <p>{uploadProgress}% Uploading...</p>
                  </div>
                )}
              </div>
            )}

            <div className="note-content-container">
              <Editor
                fontStyle={noteData.fontStyle}
                textAlignment={noteData.textAlignment}
                smallText={noteData.smallText}
                fullWidth={noteData.fullWidth}
                noteData={noteData}
                scrollToBottom={this.scrollToBottom}
                setActiveNote={this.props.setActiveNote}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    noteData: state.note.noteData,
  };
};

export default NoteEditor;
