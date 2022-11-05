import React, { useEffect } from "react";

import grabIcon from "../../icons/noteeditor/grab-icon.svg";
import { useSelected } from "slate-react";

const Divider = (props) => {
  const selected = useSelected();

  return (
    <div
      {...props.attributes}
      className="divider-block block"
      data-block-id={props.element.id}
    >
      <div
        className={
          selected
            ? "block-selected-halo block-selected"
            : "block-selected-halo"
        }
        contentEditable={false}
      ></div>
      <div className="grab-icon-container" contentEditable={false}>
        <img src={grabIcon} className="grab-icon" />
      </div>
      <div className="divider"></div>
      <div style={{ display: "none" }} contentEditable={false}>
        {props.children}
      </div>
    </div>
  );
};

export default Divider;
