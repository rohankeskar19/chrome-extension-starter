import React, { useState, useEffect, useRef } from "react";
import { Popover, Button } from "antd";
import { Transforms } from "slate";
import { useSlateStatic, ReactEditor, useSelected } from "slate-react";
import grabIcon from "../../icons/noteeditor/grab-icon.svg";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-latex";
import { BlockMath } from "react-katex";
import Singleton from "../../utils/getDocument";

const Equation = (props) => {
  const editor = useSlateStatic();
  const selected = useSelected();

  const [state, setState] = useState({
    formulaInputPopupVisible: false,
    formulaValue: props.element.equationText,
  });

  const formulaContainerRef = useRef(null);
  const formulaInputContainerRef = useRef(null);

  useEffect(() => {
    const document = Singleton.getDocument();
    document.addEventListener("mousedown", (e) => {
      if (formulaInputContainerRef) {
        if (formulaInputContainerRef.current) {
          if (
            !formulaInputContainerRef.current.contains(e.target) &&
            !formulaContainerRef.current.contains(e.target)
          ) {
            setState((prevState) => {
              return {
                ...prevState,
                formulaInputPopupVisible: false,
              };
            });
          }
        }
      }
    });
  }, []);

  const toggleFormulaInputPopup = () => {
    setState((prevState) => {
      return {
        ...prevState,
        formulaInputPopupVisible: !state.formulaInputPopupVisible,
      };
    });
  };

  const handleChange = (value) => {
    const path = ReactEditor.findPath(editor, props.element);

    const newProperties = {
      equationText: value,
    };

    Transforms.setNodes(editor, newProperties, { at: path });

    setState((prevState) => {
      return {
        ...prevState,
        formulaValue: value,
      };
    });
  };

  const getFormulaInputContent = () => {
    return (
      <div className="formula-input-container" ref={formulaInputContainerRef}>
        <Editor
          value={state.formulaValue}
          onValueChange={handleChange}
          highlight={(code) => highlight(code, languages.tex)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
          }}
          autoFocus={true}
          onFocus={(e) => e.target.select()}
          className="katex-input-container"
        />
        <Button type="primary" onClick={toggleFormulaInputPopup}>
          Save
        </Button>
      </div>
    );
  };

  return (
    <div
      {...props.attributes}
      className="equation-block block"
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
      <Popover
        placement="bottom"
        content={getFormulaInputContent()}
        overlayClassName="no-arrow"
        visible={state.formulaInputPopupVisible}
        destroyTooltipOnHide={true}
      >
        <div
          className="equation-container"
          onClick={toggleFormulaInputPopup}
          ref={formulaContainerRef}
          contentEditable={false}
        >
          {state.formulaValue == "" ? (
            <div
              className="equation-renderer"
              dangerouslySetInnerHTML={{
                __html: state.formulaValue == "" ? "" : state.formulaHtml,
              }}
              placeholder={"Tex equation (Click to edit)"}
              contentEditable={false}
            ></div>
          ) : (
            <BlockMath math={state.formulaValue} />
          )}
        </div>
      </Popover>
      <div style={{ display: "none" }} contentEditable={false}>
        {props.children}
      </div>
    </div>
  );
};

export default Equation;
