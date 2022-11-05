import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBUVtCMPMRcXX71SFXeJ35BnZ5EQROFUEg",
  authDomain: "notealy-e047c.firebaseapp.com",
  projectId: "notealy-e047c",
  storageBucket: "notealy-e047c.appspot.com",
  messagingSenderId: "704354023285",
  appId: "1:704354023285:web:0e0c8740572de7e2f0453c",
  measurementId: "G-H1BSF2QXD2",
};

firebase.initializeApp(firebaseConfig);
// firebase.firestore().settings({ experimentalForceLongPolling: true });

export default firebase;
