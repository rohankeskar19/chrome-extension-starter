import React, { useEffect, useRef } from "react";

import grabIcon from "../../icons/noteeditor/grab-icon.svg";
import { useSelected, useSlateStatic } from "slate-react";
import showSelectedHalo from "../../utils/showSelectedHalo";
import getClassNameForStyling from "../../utils/getClassNameForStyling";
import { useDndBlock } from "./Dnd/useDndBlock";
import useMergedRef from "@react-hook/merged-ref";

const Paragraph = (props) => {
  const selected = useSelected();
  const editor = useSlateStatic();

  const blockRef = useRef(null);
  const ref = useRef(null);
  const rootRef = useRef(null);
  const dragWrapperRef = useRef(null);

  const multiRootRef = useMergedRef(ref, rootRef);

  const { dropLine, dragRef, isDragging } = useDndBlock({
    id: props.element.id,
    blockRef: rootRef,
  });

  const multiDragRef = useMergedRef(dragRef, dragWrapperRef);

  return (
    <div className="paragraph-block block" ref={multiRootRef}>
      <div
        className="grab-icon-container"
        contentEditable={false}
        ref={multiDragRef}
      >
        <img src={grabIcon} className="grab-icon" />
      </div>

      <p
        className={`${getClassNameForStyling(props).trim()}`}
        placeholder="Type '/' for commands"
        ref={rootRef}
      >
        {props.children}
      </p>
    </div>
  );
};

export default Paragraph;
