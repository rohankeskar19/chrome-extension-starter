import constants from "./constants";
import firebase from "../utils/firebase";

const updateNote = (noteData, field) => {
  return firebase
    .firestore()
    .collection(constants.FILEOBJECTS_COLLECTION)
    .doc(noteData.id)
    .update({
      [field]: noteData[field],
    });
};

export default updateNote;
