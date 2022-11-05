import React from "react";

import grabIcon from "../../icons/noteeditor/grab-icon.svg";
import circleIcon from "../../icons/noteeditor/blockicons/circle-solid.svg";

import getClassNameForStyling from "../../utils/getClassNameForStyling";

const UnorderedItem = (props) => {
  return (
    <div
      {...props.attributes}
      className="unordered-list-item-block block"
      data-block-id={props.element.id}
    >
      <div className="grab-icon-container" contentEditable={false}>
        <img src={grabIcon} className="grab-icon" />
      </div>

      <div className="unordered-list-item">
        <div className="circle-icon-container" contentEditable={false}>
          <img src={circleIcon} />
        </div>
        <p className={getClassNameForStyling(props)}>{props.children}</p>
      </div>
    </div>
  );
};

export default UnorderedItem;
