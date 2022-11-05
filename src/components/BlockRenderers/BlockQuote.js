import React, { useEffect } from "react";

import grabIcon from "../../icons/noteeditor/grab-icon.svg";
import getClassNameForStyling from "../../utils/getClassNameForStyling";

const BlockQuote = (props) => {
  return (
    <div
      {...props.attributes}
      className="quote-block block"
      data-block-id={props.element.id}
    >
      <div className="grab-icon-container" contentEditable={false}>
        <img src={grabIcon} className="grab-icon" />
      </div>
      <p
        placeholder="Enter a quote here..."
        className={`placeholder-container ${getClassNameForStyling(props)}`}
      >
        {props.children}
      </p>
    </div>
  );
};

export default BlockQuote;
