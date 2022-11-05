import React from "react";
import { Tooltip } from "antd";
import "./linkleaf.css";
import globeIcon from "../../icons/globe.svg";

function LinkLeaf({ overlayClassName, attributes, children, element, leaf }) {
  const openLink = () => {
    const newWindow = window.open(element.url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  };

  const getLinkOverlay = () => {
    return (
      <span className="link-tooltip-container" contentEditable={false}>
        <img src={globeIcon} />
        <p className="link-tooltip-text-container">{element.url}</p>
      </span>
    );
  };

  return (
    <Tooltip
      placement="bottomLeft"
      overlay={getLinkOverlay()}
      overlayClassName={"link-tooltip no-arrow no-animation"}
      destroyTooltipOnHide={true}
      getTooltipContainer={(trigger) => trigger.parentElement}
    >
      <a
        className={"link-decoration"}
        {...attributes}
        href={element.url}
        onClick={openLink}
      >
        {children}
      </a>
    </Tooltip>
  );
}

export default LinkLeaf;
