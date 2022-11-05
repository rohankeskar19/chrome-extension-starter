import React from "react";

import grabIcon from "../../icons/noteeditor/grab-icon.svg";

import getClassNameForStyling from "../../utils/getClassNameForStyling";

const NumberedItem = (props) => {
  return (
    <div
      {...props.attributes}
      className="unordered-list-item-block block"
      data-block-id={props.element.id}
    >
      <div className="grab-icon-container" contentEditable={false}>
        <img src={grabIcon} className="grab-icon" />
      </div>

      <div className="ordered-list-item">
        <div
          className="ordered-list-item-number-container"
          contentEditable={false}
        >
          <p
            className={`number-text ${getClassNameForStyling(props)}`}
          >{`${props.element.orderedItemNumber}.`}</p>
        </div>
        <p className={getClassNameForStyling(props)}>{props.children}</p>
      </div>
    </div>
  );
};

export default NumberedItem;
