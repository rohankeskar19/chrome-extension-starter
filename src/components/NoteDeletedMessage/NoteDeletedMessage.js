import React, { useState, useEffect } from "react";
import "./notedeletedmessage.css";

import undoIcon from "../../icons/noteeditor/undo.svg";
import deletePermanentlyIcon from "../../icons/noteeditor/permanently-deleted.svg";
import useIsMountedRef from "../../utils/useIsMounteRef";

function NoteDeletedMessage({ unArchiveNote, deleteNotePermanently, visible }) {
  const isMountedRef = useIsMountedRef();

  const [state, setState] = useState({
    visible: visible,
  });

  useEffect(() => {
    if (isMountedRef.current) {
      setState((prevState) => {
        return {
          ...prevState,
          visible: visible,
        };
      });
    }
  }, [visible]);

  return (
    <div
      className={
        state.visible
          ? "note-deleted-message note-deleted-message-visible"
          : "note-deleted-message note-deleted-message-hidden"
      }
    >
      <div className="note-deleted-message-container">
        <p>This note has been archived.</p>
        <div className="note-deleted-message-button-container">
          <div className="note-delete-btn-primary" onClick={unArchiveNote}>
            <span>Undo</span>
            {/* <img src={undoIcon} /> */}
          </div>
          <div
            className="note-delete-btn-ghost"
            onClick={deleteNotePermanently}
          >
            <span>Delete permanently</span>
            {/* <img src={deletePermanentlyIcon} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteDeletedMessage;
