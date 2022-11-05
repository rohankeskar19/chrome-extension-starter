import React from "react";

import grabIcon from "../../icons/noteeditor/grab-icon.svg";

import getClassNameForStyling from "../../utils/getClassNameForStyling";

const HeadingTwo = (props) => {
  return (
    <div
      {...props.attributes}
      className="heading-block block"
      data-block-id={props.element.id}
    >
      <div className="grab-icon-container" contentEditable={false}>
        <img src={grabIcon} className="grab-icon" />
      </div>

      <h2 className={getClassNameForStyling(props)}>{props.children}</h2>
    </div>
  );
};

export default HeadingTwo;
