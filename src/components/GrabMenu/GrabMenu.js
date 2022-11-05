import React from "react";

import deleteIcon from "../../icons/noteeditor/grabiconmenu/delete.svg";
import duplicateIcon from "../../icons/noteeditor/grabiconmenu/duplicate-icon.svg";
import convertToIcon from "../../icons/noteeditor/grabiconmenu/convert-to.svg";
import moveToIcon from "../../icons/noteeditor/grabiconmenu/move-to.svg";
import copyToIcon from "../../icons/noteeditor/grabiconmenu/copy-to.svg";
import colorIcon from "../../icons/noteeditor/grabiconmenu/color.svg";
import caretIcon from "../../icons/noteeditor/grabiconmenu/caret-right.svg";

import "./grabmenu.css";

const GrabMenu = () => {
  return (
    <div className="grab-icon-menu">
      <div>
        <img src={deleteIcon} />
        <p>Delete</p>
      </div>
      <div>
        <img src={duplicateIcon} />
        <p>Duplicate</p>
      </div>
      <div>
        <img src={convertToIcon} />
        <p>Convert to</p>
        <img src={caretIcon} className="caret-icon" />
      </div>
      <div>
        <img src={moveToIcon} />
        <p>Move to</p>
      </div>
      <div>
        <img src={copyToIcon} />
        <p>Copy to</p>
      </div>
      <div>
        <img src={colorIcon} />
        <p>Color</p>
        <img src={caretIcon} className="caret-icon" />
      </div>
    </div>
  );
};

export default GrabMenu;
