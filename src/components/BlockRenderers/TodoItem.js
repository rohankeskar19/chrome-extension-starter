import React from "react";

import grabIcon from "../../icons/noteeditor/grab-icon.svg";
import checkIcon from "../../icons/noteeditor/blockicons/check.svg";

import { Transforms } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";

import getClassNameForStyling from "../../utils/getClassNameForStyling";

const TodoItem = (props) => {
  const editor = useSlateStatic();

  return (
    <div
      {...props.attributes}
      className="paragraph-block block"
      data-block-id={props.element.id}
    >
      <div className="grab-icon-container" contentEditable={false}>
        <img src={grabIcon} className="grab-icon" />
      </div>

      <div className="checkbox-item">
        <div className="checkbox-container" contentEditable={false}>
          <div className="checkbox-item-icon-container">
            <div
              className={
                props.element.isChecked
                  ? "checkbox-check-mark checkbox-checked"
                  : "checkbox-check-mark"
              }
              onClick={() => {
                const path = ReactEditor.findPath(editor, props.element);
                const newProperties = {
                  isChecked: !props.element.isChecked,
                };
                Transforms.setNodes(editor, newProperties, { at: path });
              }}
            >
              <img
                src={checkIcon}
                className={
                  props.element.isChecked
                    ? "checkbox-icon checkbox-checked-icon"
                    : "checkbox-icon"
                }
              />
            </div>
          </div>
        </div>
        <p
          className={
            props.element.isChecked
              ? `checkbox-text-checked ${getClassNameForStyling(props)}`
              : `${getClassNameForStyling(props)}`
          }
        >
          {props.children}
        </p>
      </div>
    </div>
  );
};

export default TodoItem;
