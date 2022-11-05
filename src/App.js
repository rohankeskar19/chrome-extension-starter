import React, { useState, useEffect } from "react";

import "./App.css";
import SidebarContent from "./SidebarContent/SidebarContent";

import ContentContainer from "./pages/ContentContainer/ContentContainer";

import firebase from "./utils/firebase";
import apiUrl from "./utils/getApiUrl";
import Loader from "./components/Loader/Loader";
import setAuthToken from "./utils/setAuthToken";
import axios from "axios";
import isJson from "./utils/isJson";
import updateTokens from "./utils/chrome/updateTokens";
import clearTokens from "./utils/chrome/clearTokens";
import Singleton from "./utils/getDocument";
import WindowSingleton, { setWindow } from "./utils/getWindow";
import constants from "./utils/constants";
import FileObject from "./Models/FileObject";
import getFolderColor from "./utils/getFolderColor";
import $ from "jquery";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

var resizeEventListener = undefined;

function App({ chrome, removeApp, iframeDocument, window }) {
  const [state, setState] = useState({
    currentTab: 1,
    sidebarOpen: true,
    loading: false,
    sidebarDocked: true,
    userData: {},
    activeNote: {},
    folders: [],
    url: "",
  });

  const setTab = (tab) => {
    setState((prevState) => {
      return {
        ...prevState,
        currentTab: tab,
      };
    });
  };

  useEffect(() => {
    Singleton.setDocument(iframeDocument);
    WindowSingleton.setWindow(window);
  }, []);

  useEffect(() => {
    const window = WindowSingleton.getWindow();
    window.removeEventListener("resize", resizeEventListener);
    resizeEventListener = window.addEventListener("resize", function (e) {
      const width = window.innerWidth;
      if (width <= 1050) {
        if (state.sidebarDocked) {
          setState((prevState) => {
            return {
              ...prevState,
              sidebarDocked: false,
            };
          });
        }
      } else {
        if (!state.sidebarDocked) {
          setState((prevState) => {
            return {
              ...prevState,
              sidebarDocked: true,
            };
          });
        }
      }
    });
  }, [state.sidebarDocked]);

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      const key = e.key;

      if ((key == "x" || key == "≈") && e.altKey) {
        if ($("#notealy-extension-root").css("display") == "none") {
          $("#notealy-extension-root").css("display", "block");
        } else {
          $("#notealy-extension-root").css("display", "none");
        }
      }
    });

    iframeDocument.addEventListener("keydown", (e) => {
      const key = e.key;
      if ((key == "x" || key == "≈") && e.altKey) {
        if ($("#notealy-extension-root").css("display") == "none") {
          $("#notealy-extension-root").css("display", "block");
        } else {
          $("#notealy-extension-root").css("display", "none");
        }
      }
    });

    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (request.message == "startApp") {
        const authToken = request.authToken;
        const refreshToken = request.refreshToken;
        const uid = request.user.uid;

        setAuthToken(chrome, authToken, refreshToken, false);

        handleAuthentication(authToken, refreshToken, uid);
      } else if (request.message == "updateTokens") {
        console.log("Updating tokens");
        const authToken = request.authToken;
        const refreshToken = request.refreshToken;
        const uid = request.user.uid;

        setAuthToken(chrome, authToken, refreshToken, false);
        handleAuthentication(authToken, refreshToken, uid);
      }
    });
  }, []);

  const handleAuthentication = async (authToken, refreshToken, uid) => {
    try {
      await firebase.auth().signInWithCustomToken(authToken);

      const loggedInUser = await firebase.auth().currentUser;

      const userDoc = await firebase
        .firestore()
        .collection("users")
        .doc(loggedInUser.uid)
        .get();

      const userData = userDoc.data();

      const activeNote = await firebase
        .firestore()
        .collection("fileobjects")
        .doc(userData.lastOpenedNote)
        .get();

      getFolders();

      setState((prevState) => {
        return {
          ...prevState,
          userData: userData,
          activeNote: activeNote.data(),
        };
      });
    } catch (err) {
      if (err.code && err.code == "auth/invalid-custom-token") {
        try {
          const res = await axios.post(
            `${apiUrl}/auth/renewToken`,
            {
              authToken: authToken,
              refreshToken: refreshToken,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          setAuthToken(
            chrome,
            res.data.authToken,
            res.data.refreshToken,
            false
          );
          updateTokens(chrome, res.data.refreshToken, res.data.authToken);

          handleAuthentication(res.data.authToken, res.data.refreshToken, uid);
        } catch (err) {
          const response = err.response.data;

          if (response.error == "Invalid request") {
            clearTokens(chrome);
            removeApp();
          }
        }
      }
    }
  };

  const getFolders = async () => {
    try {
      const loggedInUser = await firebase.auth().currentUser;
      firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .where("type", "==", "FOLDER")
        .where("parent", "==", "none")
        .where("isArchived", "==", false)
        .where("uid", "==", loggedInUser.uid)
        .orderBy("createdOn", "desc")
        .onSnapshot((snap) => {
          const documents = snap.docs;
          const folders = [];

          documents.forEach((doc) => {
            folders.push(doc.data());
          });

          setState((prevState) => {
            return {
              ...prevState,
              folders: folders,
            };
          });
        });
    } catch (err) {
      console.log(err);
    }
  };

  const createFolder = async (folder) => {
    try {
      const uid = await firebase.auth().currentUser.uid;
      const color = getFolderColor();

      const newFolder = new FileObject(
        uid,
        folder.name,
        undefined,
        color,
        "",
        true,
        false,
        false,
        1,
        1,
        "FOLDER",
        "none.",
        "none",
        false,
        false
      ).getObject();

      const docRef = await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .doc();

      newFolder.id = docRef.id;

      await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .doc(newFolder.id)
        .set(newFolder);
    } catch (err) {
      console.log(err);
    }
  };

  const setActiveNote = (note) => {
    setState((prevState) => {
      return {
        ...prevState,
        activeNote: note,
        currentTab: 1,
      };
    });
  };

  const toggleSidebar = (bool) => {
    setState((prevState) => {
      return {
        ...prevState,
        sidebarOpen: bool,
      };
    });
  };

  const getClassNameForContentContainer = () => {
    const { sidebarOpen, sidebarDocked } = state;

    if (sidebarDocked) {
      if (sidebarOpen) {
        return "content-container";
      } else {
        return "content-container full-width";
      }
    } else {
      return "content-container full-width";
    }
  };

  return (
    <div id="app-container">
      {/* {state.loading && <Loader />} */}
      <SidebarContent
        toggleSidebar={toggleSidebar}
        setTab={setTab}
        userData={state.userData}
        folders={state.folders}
        setActiveNote={setActiveNote}
        createFolder={createFolder}
      />
      <div className={getClassNameForContentContainer()}>
        <ContentContainer
          currentTab={state.currentTab}
          activeNote={state.activeNote}
          setActiveNote={setActiveNote}
        />
      </div>
    </div>
  );
}

export default App;
