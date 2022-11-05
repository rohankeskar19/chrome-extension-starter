import React from "react";
import "./tooltipcontent.css";

function TooltipContent({ text, type }) {
  const getClassFromType = (type) => {
    switch (type) {
      case 1:
        return "black-tooltip";
      case 2:
        return "white-tooltip";
      default:
        return "black-tooltip";
    }
  };

  return (
    <span
      contentEditable={false}
      className={`tooltip-content-text ${getClassFromType(type)}`}
    >
      {text}
    </span>
  );
}

export default TooltipContent;
