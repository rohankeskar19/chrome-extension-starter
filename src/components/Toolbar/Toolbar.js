import React, { useState, useEffect, useRef } from "react";
import { Popover } from "antd";
import { Editor, Range, Transforms } from "slate";
import { useSlate, ReactEditor } from "slate-react";

import "./toolbar.css";

import dropdownArrow from "../../icons/toolbar/dropdown-arrow.svg";
import textBackground from "../../icons/toolbar/text-background.svg";
import textColor from "../../icons/toolbar/text-color.svg";
import bulletedList from "../../icons/toolbar/bulleted-list.svg";
import numberedList from "../../icons/toolbar/numbered-list.svg";
import checkboxItem from "../../icons/toolbar/checkbox.svg";
import openLinkIcon from "../../icons/open-link.svg";
import trashIcon from "../../icons/trash.svg";

import backgroundColors from "../../constants/texbackgroundcolors.json";
import textColors from "../../constants/textcolors.json";
import Portal from "../Portal/Portal";
import keycode from "keycode";

import isMarkActive from "../../utils/isMarkActive";
import getCurrentBlock from "../../utils/getCurrentBlock";
import getNameFromType from "../../utils/getNameFromType";
import useIsMountedRef from "../../utils/useIsMounteRef";
import Singleton from "../../utils/getDocument";
import WindowSingleton from "../../utils/getWindow";
import wrapLink from "../../utils/wrapLink";
import isLinkActive from "../../utils/isLinkActive";
import unwrapLink from "../../utils/unwrapLink";

var mousedownListener = undefined;
var currentSelection = undefined;

const Toolbar = ({
  block,
  label,
  setTextFormat,
  setBackgroundColor,
  setTextColor,
  isBold,
  isItalic,
  isUnderlined,
  isStrikeThrough,
  isCode,
  isBackgroundColorActive,
  isTextColorActive,
  hasLink,
  currentLink,
  convertTo,
}) => {
  const ref = useRef(null);
  const editor = useSlate();
  const textBackgroundRef = useRef(null);
  const textColorRef = useRef(null);
  const addLinkRef = useRef(null);
  const convertToRef = useRef(null);
  const isMountedRef = useIsMountedRef();

  const convertToButtonRef = useRef(null);
  const textBackgroundButtonRef = useRef(null);
  const textColorButtonRef = useRef(null);
  const addLinkButtonRef = useRef(null);
  const addLinkPlaceholderRef = useRef(null);

  const [state, setState] = useState({
    block: block,
    label: label,
    isBold: isBold,
    isItalic: isItalic,
    isUnderlined: isUnderlined,
    isStrikeThrough: isStrikeThrough,
    isCode: isCode,
    hasLink: hasLink,
    currentLink: currentLink,
    link: "",
    textBackgroundPopupVisible: false,
    textColorPopupVisible: false,
    addLinkPopupVisible: false,
    convertToPopupVisible: false,
    isBackgroundColorActive: undefined,
    isTextColorActive: undefined,
    toolbarLeft: 0,
    toolbarTop: 0,
  });

  useEffect(() => {
    if (isMountedRef.current) {
      setState((prevState) => {
        return {
          ...prevState,
          block: block,
          label: label,
          isBold: isBold,
          isItalic: isItalic,
          isUnderlined: isUnderlined,
          isStrikeThrough: isStrikeThrough,
          isCode: isCode,
          isBackgroundColorActive: isBackgroundColorActive,
          isTextColorActive: isTextColorActive,
          hasLink: hasLink,
          currentLink: currentLink,
          link: hasLink ? currentLink : state.link,
        };
      });
    }
  }, [
    block,
    label,
    isBold,
    isItalic,
    isUnderlined,
    isStrikeThrough,
    isCode,
    isBackgroundColorActive,
    isTextColorActive,
    hasLink,
    currentLink,
  ]);

  useEffect(() => {
    const document = Singleton.getDocument();

    if (mousedownListener) {
      document.removeEventListener("mousedown", mousedownListener);
    }

    mousedownListener = document.addEventListener("mousedown", (e) => {
      var clickedOutsideLinkButton = false;
      var clickedOutsideLinkInputContainer = false;

      if (addLinkRef) {
        if (addLinkRef.current) {
          if (!addLinkRef.current.contains(e.target)) {
            clickedOutsideLinkInputContainer = true;
          }
        }
      }

      if (addLinkButtonRef) {
        if (addLinkButtonRef.current) {
          if (!addLinkButtonRef.current.contains(e.target)) {
            clickedOutsideLinkButton = true;
          }
        }
      }

      if (
        clickedOutsideLinkButton &&
        clickedOutsideLinkInputContainer &&
        state.addLinkPopupVisible
      ) {
        removeLinkMark();
        setState((prevState) => {
          return {
            ...prevState,
            addLinkPopupVisible: false,
          };
        });
      }
    });
  }, [state.addLinkPopupVisible]);

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === "" ||
      state.addLinkPopupVisible
    ) {
      el.classList.remove("toolbar-visible");
      el.classList.add("toolbar-hidden");

      return;
    }
    const window = WindowSingleton.getWindow();

    const domSelection = window.getSelection();

    if (domSelection.rangeCount > 0) {
      const domRange = domSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();

      el.classList.remove("toolbar-hidden");
      el.classList.add("toolbar-visible");

      var left =
        rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2;
      var top = rect.top + window.pageYOffset - el.offsetHeight - 5;

      if (top < 0) {
        top = 3;
      }

      el.style.top = `${top}px`;

      // To prevent small jiggle bug
      const difference = Math.abs(
        Math.ceil(left) - Math.ceil(parseFloat(el.style.left.split("px")[0]))
      );
      if (difference == 0 || difference == 1) {
        return;
      }

      const boundingBox = el.getBoundingClientRect();

      // If toolbar is outside on right side of window
      if (left + boundingBox.width > window.innerWidth) {
        var y = window.innerWidth - left;
        var x = boundingBox.width - y;
        left = left - (x + 3);
      }

      // If toolbar is outside window on left
      if (left < 0) {
        left = 3;
      }
      addLinkPlaceholderRef.current.style.left = `${left + 240}px`;
      addLinkPlaceholderRef.current.style.top = `${top + 38}px`;

      el.style.left = `${left}px`;
    }
  });

  const addLinkMark = () => {
    Editor.addMark(editor, "linkSelection", true);
    currentSelection = editor.selection;
  };

  const removeLinkMark = () => {
    if (currentSelection && ReactEditor.hasRange(editor, currentSelection)) {
      ReactEditor.focus(editor);
      Transforms.select(editor, { ...currentSelection });
      if (isMarkActive(editor, "linkSelection")) {
        Editor.removeMark(editor, "linkSelection");
        const el = ref.current;
        el.classList.remove("toolbar-visible");
        el.classList.add("toolbar-hidden");
      }
    }
  };

  const addLink = (url) => {
    if (currentSelection && ReactEditor.hasRange(editor, currentSelection)) {
      Transforms.select(editor, { ...currentSelection });
      removeLinkMark();

      if (isLinkActive(editor)) {
        Transforms.setNodes(
          editor,
          {
            url: url,
          },
          {
            match: (n) => n.type == "link",
          }
        );
      } else {
        wrapLink(editor, url);
      }
    }
  };

  const removeLink = () => {
    if (currentSelection && ReactEditor.hasRange(editor, currentSelection)) {
      Transforms.select(editor, { ...currentSelection });
      removeLinkMark();

      if (isLinkActive(editor)) {
        unwrapLink(editor);
      }
    }
  };

  const getConvertBlockContent = () => {
    return (
      <div
        className="convert-block-list"
        ref={convertToRef}
        contentEditable={false}
      >
        <p className="convert-list-heading">Convert to</p>
        <div className="convert-list-options">
          <h1 onClick={() => convertTo("heading-one")}>Heading 1</h1>
          <h2 onClick={() => convertTo("heading-two")}>Heading 2</h2>
          <h3 onClick={() => convertTo("heading-three")}>Heading 3</h3>
          <p onClick={() => convertTo("paragraph")}>Paragraph</p>
        </div>
      </div>
    );
  };

  const openLink = () => {
    const newWindow = window.open(
      state.currentLink,
      "_blank",
      "noopener,noreferrer"
    );
    if (newWindow) newWindow.opener = null;
  };

  const removeLinkLocal = () => {
    removeLink();
    setState((prevState) => {
      return {
        ...prevState,
        addLinkPopupVisible: false,
        link: "",
      };
    });
  };

  const getAddLinkContent = () => {
    const { hasLink } = state;

    if (hasLink) {
      return (
        <div
          className="link-exists-container"
          ref={addLinkRef}
          contentEditable={false}
        >
          <div className="add-link-container">
            <input
              placeholder="www.google.com"
              autoFocus={true}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              style={{ padding: "0" }}
              value={state.link}
              type="text"
            />
            <button onClick={addLinkToText}>Save</button>
          </div>
          <div className="link-exists-action-item" onClick={openLink}>
            <img src={openLinkIcon} />
            <p>Open link</p>
          </div>
          <div className="link-exists-action-item" onClick={removeLinkLocal}>
            <img src={trashIcon} style={{ width: "17px" }} />
            <p>Remove link</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="add-link-container" ref={addLinkRef}>
          <input
            placeholder="www.google.com"
            autoFocus={true}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{ padding: "0" }}
            value={state.link}
            type="text"
          />
          <button onClick={addLinkToText}>Save</button>
        </div>
      );
    }
  };

  const handleKeyDown = (e) => {
    const keyCode = e.keyCode;
    if (keyCode == keycode("enter")) {
      e.preventDefault();
      var { link } = state;
      if (link.trim() != "") {
        var prefix1 = "http://";
        var prefix2 = "https://";
        if (
          link.substr(0, prefix1.length) !== prefix1 &&
          link.substr(0, prefix2.length) !== prefix2
        ) {
          link = prefix2 + link;
        }

        const urlRegex =
          /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

        if (urlRegex.test(link)) {
          addLink(link);
          setState((prevState) => {
            return {
              ...prevState,
              addLinkPopupVisible: false,
              link: "",
            };
          });
        }
      }
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setState((prevState) => {
      return {
        ...prevState,
        link: value,
      };
    });
  };

  const addLinkToText = () => {
    var { link } = state;
    var prefix1 = "http://";
    var prefix2 = "https://";
    if (
      link.substr(0, prefix1.length) !== prefix1 &&
      link.substr(0, prefix2.length) !== prefix2
    ) {
      link = prefix2 + link;
    }

    const urlRegex =
      /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

    if (urlRegex.test(link)) {
      addLink(link);
      setState((prevState) => {
        return {
          ...prevState,
          addLinkPopupVisible: false,
          link: "",
        };
      });
    }
  };

  const handleBackgroundColor = (color) => {
    setBackgroundColor(color);
    setState((prevState) => {
      return {
        ...prevState,
        textBackgroundPopupVisible: false,
      };
    });
  };

  const handleTextColor = (color) => {
    setTextColor(color);
    setState((prevState) => {
      return {
        ...prevState,
        textColorPopupVisible: false,
      };
    });
  };

  const getTextBackgroundContent = () => {
    return (
      <div
        className="text-background-colors-container"
        ref={textBackgroundRef}
        onMouseDown={(e) => e.preventDefault()}
        contentEditable={false}
      >
        {backgroundColors.map((color, index) => {
          return (
            <div
              style={{ backgroundColor: `${color}` }}
              key={color + index}
              onMouseDown={(e) => {
                e.preventDefault();
                handleBackgroundColor(color);
              }}
            ></div>
          );
        })}
      </div>
    );
  };

  const getTextColorContent = () => {
    return (
      <div
        className="text-colors-container"
        ref={textColorRef}
        onMouseDown={(e) => e.preventDefault()}
        contentEditable={false}
      >
        {textColors.map((color, index) => {
          return (
            <svg
              width="8"
              height="10"
              viewBox="0 0 8 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              key={color + index}
              onMouseDown={(e) => {
                e.preventDefault();
                handleTextColor(color);
              }}
            >
              <path
                d="M3.9917 0.000100999C3.91892 0.00175962 3.84818 0.0256797 3.7881 0.0689432C3.72802 0.112207 3.68119 0.172944 3.65334 0.243744L0.0285449 9.45388C-0.009526 9.55067 -0.00951452 9.65942 0.0285766 9.7562C0.0666678 9.85298 0.139718 9.92987 0.231658 9.96995C0.323598 10.01 0.426896 10.01 0.518828 9.96992C0.61076 9.92982 0.683794 9.85291 0.721865 9.75612L1.55824 7.63118H6.44176L7.27814 9.75612C7.29699 9.80404 7.32462 9.84759 7.35946 9.88428C7.39429 9.92096 7.43565 9.95006 7.48117 9.96992C7.52669 9.98977 7.57548 9.99999 7.62475 10C7.67403 10 7.72282 9.98979 7.76834 9.96995C7.81387 9.9501 7.85523 9.92101 7.89008 9.88434C7.92492 9.84766 7.95256 9.80412 7.97142 9.7562C7.99028 9.70828 7.99999 9.65691 8 9.60504C8.00001 9.55317 7.99031 9.5018 7.97146 9.45388L4.34666 0.243744C4.31773 0.170191 4.26835 0.107565 4.205 0.0640848C4.14165 0.0206043 4.0673 -0.00169929 3.9917 0.000100999V0.000100999ZM4 1.42701L6.13123 6.84165H1.86877L4 1.42701Z"
                fill={color}
              />
            </svg>
          );
        })}
      </div>
    );
  };

  const toggleTextBackgroundPopup = () => {
    setState((prevState) => {
      return {
        ...prevState,
        textBackgroundPopupVisible: !state.textBackgroundPopupVisible,
      };
    });
  };
  const toggleTextColorPopup = () => {
    setState((prevState) => {
      return {
        ...prevState,
        textColorPopupVisible: !state.textColorPopupVisible,
      };
    });
  };

  const toggleAddLinkPopup = (e) => {
    if (!state.addLinkPopupVisible) {
      addLinkMark();
    } else {
      removeLinkMark();
    }

    setState((prevState) => {
      return {
        ...prevState,
        addLinkPopupVisible: !state.addLinkPopupVisible,
      };
    });
  };

  const toggleConvertToPopup = (e) => {
    setState((prevState) => {
      return {
        ...prevState,
        convertToPopupVisible: !state.convertToPopupVisible,
      };
    });
  };
  return (
    <Portal>
      <Popover
        overlayClassName="no-arrow"
        placement={"top"}
        content={getAddLinkContent()}
        visible={state.addLinkPopupVisible}
        destroyTooltipOnHide={true}
        getPopupContainer={(trigger) => trigger.parentElement}
      >
        <div
          style={{
            opacity: "0",
            pointerEvents: "none",
            width: "10px",
            height: "10px",
            position: "absolute",
            // left: state.toolbarLeft,
            // top: state.toolbarTop,
            backgroundColor: "#000",
            zIndex: "10000000",
          }}
          ref={addLinkPlaceholderRef}
        ></div>
      </Popover>
      <div
        className="inline-toolbar"
        ref={ref}
        style={{
          position: "absolute",
          top: "-10000px",
          left: "-10000px",
          marginTop: "-6px",
        }}
      >
        <Popover
          placement="top"
          overlayClassName="no-arrow"
          content={getConvertBlockContent()}
          trigger="click"
          getPopupContainer={(trigger) => trigger.parentElement}
          destroyTooltipOnHide={true}
        >
          <div
            className="block-type-dropdown"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleConvertToPopup();
            }}
            ref={convertToButtonRef}
          >
            <span
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            >
              {getNameFromType(getCurrentBlock(editor).type)}
            </span>
            <img
              src={dropdownArrow}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            />
          </div>
        </Popover>
        <div className="text-style-tools">
          {/* Bold text  */}

          <span
            onMouseDown={(e) => {
              e.preventDefault();
              setTextFormat(e, "bold");
            }}
            className="bold-text-container"
          >
            <svg
              width="8"
              height="10"
              viewBox="0 0 8 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.944408 7.65798e-05C0.808351 -0.00165745 0.67356 0.0260759 0.549505 0.0813283C0.42545 0.136581 0.315141 0.218012 0.226328 0.3199C0.137515 0.421789 0.0723519 0.541663 0.0354177 0.6711C-0.00151651 0.800538 -0.00932599 0.936399 0.0125377 1.06914V8.92829C-0.00974875 9.06122 -0.00225758 9.19736 0.034483 9.32712C0.0712236 9.45687 0.136319 9.57708 0.225178 9.67927C0.314038 9.78146 0.424498 9.86313 0.548768 9.91853C0.673038 9.97394 0.808093 10.0017 0.944408 9.99992H4.93814C6.61812 9.99992 8 8.6341 8 6.97365C8 5.94112 7.43266 5.06756 6.62455 4.52046C6.96012 4.04974 7.20125 3.5089 7.20125 2.89477C7.20125 1.30698 5.87898 7.65798e-05 4.27252 7.65798e-05H0.944408ZM1.87628 1.84215H4.27252C4.87166 1.84215 5.33751 2.30259 5.33751 2.89477C5.33751 3.48695 4.87166 3.94738 4.27252 3.94738H2.0094C1.96487 3.94715 1.92039 3.95007 1.87628 3.95612V1.84215ZM1.87628 5.78072C1.89889 5.78394 1.92161 5.78634 1.9444 5.78792C1.96604 5.78918 1.98772 5.78969 2.0094 5.78946H4.27252H4.93814C5.61074 5.78946 6.13626 6.30887 6.13626 6.97365C6.13626 7.63843 5.61074 8.15784 4.93814 8.15784H1.87628V5.78072Z"
                fill={isMarkActive(editor, "bold") ? "#2da7f8" : "black"}
              />
            </svg>
          </span>
          {/* Italic text */}

          <span
            onMouseDown={(e) => {
              e.preventDefault();
              setTextFormat(e, "italic");
            }}
            className="italic-text-container"
          >
            <svg
              width="9"
              height="10"
              viewBox="0 0 9 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.30868 0.00047238C6.29269 0.00124416 6.27676 0.00296837 6.26096 0.00563659H3.23606C3.18023 0.00481073 3.12481 0.0155991 3.073 0.0373747C3.02119 0.0591503 2.97404 0.0914788 2.93428 0.132482C2.89452 0.173484 2.86295 0.222343 2.8414 0.27622C2.81985 0.330096 2.80875 0.387915 2.80875 0.446316C2.80875 0.504717 2.81985 0.562535 2.8414 0.616411C2.86295 0.670287 2.89452 0.719147 2.93428 0.760149C2.97404 0.801152 3.02119 0.833481 3.073 0.855256C3.12481 0.877032 3.18023 0.88782 3.23606 0.886994H5.71073L2.66663 9.113H0.427313C0.371484 9.11218 0.316055 9.12296 0.264247 9.14474C0.212439 9.16652 0.165285 9.19884 0.125526 9.23985C0.085767 9.28085 0.0541954 9.32971 0.0326462 9.38358C0.0110971 9.43746 0 9.49528 0 9.55368C0 9.61208 0.0110971 9.6699 0.0326462 9.72378C0.0541954 9.77765 0.085767 9.82651 0.125526 9.86751C0.165285 9.90852 0.212439 9.94085 0.264247 9.96262C0.316055 9.9844 0.371484 9.99519 0.427313 9.99436H2.88552C2.93003 10.0019 2.97541 10.0019 3.01992 9.99436H6.32569C6.38152 9.99519 6.43695 9.9844 6.48875 9.96262C6.54056 9.94085 6.58772 9.90852 6.62748 9.86751C6.66723 9.82651 6.69881 9.77765 6.72036 9.72378C6.7419 9.6699 6.753 9.61208 6.753 9.55368C6.753 9.49528 6.7419 9.43746 6.72036 9.38358C6.69881 9.32971 6.66723 9.28085 6.62748 9.23985C6.58772 9.19884 6.54056 9.16652 6.48875 9.14474C6.43695 9.12296 6.38152 9.11218 6.32569 9.113H3.57015L6.61424 0.886994H8.57269C8.62852 0.88782 8.68395 0.877032 8.73575 0.855256C8.78756 0.833481 8.83472 0.801152 8.87447 0.760149C8.91423 0.719147 8.94581 0.670287 8.96735 0.616411C8.9889 0.562535 9 0.504717 9 0.446316C9 0.387915 8.9889 0.330096 8.96735 0.27622C8.94581 0.222343 8.91423 0.173484 8.87447 0.132482C8.83472 0.0914788 8.78756 0.0591503 8.73575 0.0373747C8.68395 0.0155991 8.62852 0.00481073 8.57269 0.00563659H6.39536C6.36671 0.000798156 6.33767 -0.000932435 6.30868 0.00047238Z"
                fill={isMarkActive(editor, "italic") ? "#2da7f8" : "black"}
              />
            </svg>
          </span>
          {/* Underline text */}

          <span
            onMouseDown={(e) => {
              e.preventDefault();
              setTextFormat(e, "underline");
            }}
            className="underline-text-container"
          >
            <svg
              width="8"
              height="10"
              viewBox="0 0 8 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.398879 4.6945e-05C0.293034 0.00163831 0.192173 0.0435956 0.11845 0.116703C0.0447269 0.18981 0.00417039 0.288089 0.00568877 0.389953V4.74649C0.00568877 6.79421 1.73906 8.46236 3.86686 8.46236C5.99465 8.46236 7.72802 6.79421 7.72802 4.74649V0.389953C7.72877 0.339015 7.71899 0.288443 7.69926 0.241174C7.67952 0.193905 7.65022 0.150882 7.61305 0.114606C7.57589 0.0783306 7.5316 0.0495251 7.48277 0.0298639C7.43393 0.0102027 7.38153 7.7861e-05 7.32859 7.7861e-05C7.27566 7.7861e-05 7.22325 0.0102027 7.17442 0.0298639C7.12559 0.0495251 7.0813 0.0783306 7.04413 0.114606C7.00697 0.150882 6.97767 0.193905 6.95793 0.241174C6.93819 0.288443 6.92841 0.339015 6.92916 0.389953V4.74649C6.92916 6.37876 5.56295 7.69356 3.86686 7.69356C2.17076 7.69356 0.804551 6.37876 0.804551 4.74649V0.389953C0.805318 0.338503 0.795345 0.287429 0.775223 0.239757C0.755101 0.192085 0.72524 0.148786 0.687409 0.112425C0.649578 0.0760645 0.604547 0.0473823 0.554985 0.0280787C0.505423 0.00877511 0.452339 -0.000757123 0.398879 4.6945e-05ZM0.40512 9.23116C0.352191 9.23044 0.29964 9.23985 0.250523 9.25885C0.201406 9.27784 0.156701 9.30604 0.119006 9.34181C0.0813123 9.37757 0.0513806 9.42019 0.0309506 9.46719C0.0105206 9.51418 0 9.56462 0 9.61556C0 9.6665 0.0105206 9.71694 0.0309506 9.76393C0.0513806 9.81093 0.0813123 9.85355 0.119006 9.88932C0.156701 9.92508 0.201406 9.95328 0.250523 9.97228C0.29964 9.99127 0.352191 10.0007 0.40512 9.99996H7.59488C7.64781 10.0007 7.70036 9.99127 7.74948 9.97228C7.7986 9.95328 7.8433 9.92508 7.88099 9.88932C7.91869 9.85355 7.94862 9.81093 7.96905 9.76393C7.98948 9.71694 8 9.6665 8 9.61556C8 9.56462 7.98948 9.51418 7.96905 9.46719C7.94862 9.42019 7.91869 9.37757 7.88099 9.34181C7.8433 9.30604 7.7986 9.27784 7.74948 9.25885C7.70036 9.23985 7.64781 9.23044 7.59488 9.23116H0.40512Z"
                fill={isMarkActive(editor, "underline") ? "#2da7f8" : "black"}
              />
            </svg>
          </span>

          {/* Strikethrough text */}

          <span
            onMouseDown={(e) => {
              e.preventDefault();
              setTextFormat(e, "strikethrough");
            }}
            className="strikethrough-text-container"
          >
            <svg
              width="9"
              height="10"
              viewBox="0 0 9 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.35956 0C2.8038 0 1.1295 0.782353 1.1295 2.5C1.1295 3.06706 1.33686 3.49118 1.66492 3.82353H3.39296C2.49219 3.49912 1.97213 3.14941 1.97213 2.5C1.97213 1.22029 3.53379 0.882353 4.35956 0.882353C5.77573 0.882353 6.57017 1.61781 6.60163 1.64752C6.7724 1.81281 7.03899 1.80192 7.19684 1.62339C7.35469 1.44457 7.34457 1.16513 7.1738 0.999541C7.13139 0.958658 6.12065 0 4.35956 0ZM0.427313 4.70588C0.371484 4.70506 0.316055 4.71586 0.264247 4.73766C0.212439 4.75946 0.165285 4.79182 0.125526 4.83287C0.0857668 4.87392 0.0541954 4.92283 0.0326462 4.97677C0.0110971 5.03071 0 5.08859 0 5.14706C0 5.20553 0.0110971 5.26341 0.0326462 5.31735C0.0541954 5.37128 0.0857668 5.4202 0.125526 5.46125C0.165285 5.5023 0.212439 5.53466 0.264247 5.55646C0.316055 5.57826 0.371484 5.58906 0.427313 5.58824H5.83855C6.588 5.95098 7.02788 6.41639 7.02788 7.20588C7.02788 7.87265 6.24508 9.11765 4.35956 9.11765C2.626 9.11765 1.64011 7.86603 1.59854 7.8125C1.45333 7.6225 1.18916 7.59152 1.00771 7.74299C0.825708 7.89476 0.795308 8.17223 0.940239 8.36282C0.991077 8.42988 2.20862 10 4.35956 10C6.75458 10 7.8705 8.33265 7.8705 7.20588C7.8705 6.51417 7.64434 5.994 7.28736 5.58824H8.57269C8.62852 5.58906 8.68395 5.57826 8.73575 5.55646C8.78756 5.53466 8.83472 5.5023 8.87447 5.46125C8.91423 5.4202 8.94581 5.37128 8.96735 5.31735C8.9889 5.26341 9 5.20553 9 5.14706C9 5.08859 8.9889 5.03071 8.96735 4.97677C8.94581 4.92283 8.91423 4.87392 8.87447 4.83287C8.83472 4.79182 8.78756 4.75946 8.73575 4.73766C8.68395 4.71586 8.62852 4.70506 8.57269 4.70588H0.427313Z"
                fill={
                  isMarkActive(editor, "strikethrough") ? "#2da7f8" : "black"
                }
              />
            </svg>
          </span>
          {/* Code text */}

          <span
            onMouseDown={(e) => {
              e.preventDefault();
              setTextFormat(e, "code");
            }}
            className="code-text-container"
          >
            <svg
              width="14"
              height="10"
              viewBox="0 0 14 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.42682 4.56323e-05C8.3251 0.00153751 8.22653 0.0348421 8.14548 0.0951015C8.06443 0.155361 8.00515 0.239423 7.97628 0.335027L5.1127 9.37829C5.09163 9.43756 5.08294 9.50037 5.08716 9.56299C5.09138 9.62562 5.1084 9.68677 5.13723 9.74281C5.16606 9.79885 5.2061 9.84862 5.25497 9.88918C5.30383 9.92974 5.36052 9.96025 5.42167 9.97889C5.48281 9.99753 5.54716 10.0039 5.61088 9.99768C5.67459 9.99145 5.73638 9.97271 5.79255 9.94258C5.84873 9.91246 5.89814 9.87156 5.93786 9.82233C5.97757 9.7731 6.00677 9.71654 6.02372 9.65602L8.8873 0.612756C8.91083 0.542007 8.9168 0.466779 8.90471 0.393317C8.89262 0.319855 8.86282 0.250279 8.8178 0.190366C8.77277 0.130453 8.71381 0.0819325 8.64581 0.048832C8.57781 0.0157315 8.50274 -0.000993603 8.42682 4.56323e-05ZM3.66226 1.56045C3.53816 1.56094 3.41913 1.60878 3.33042 1.69383L0.148658 4.65628C0.101693 4.69998 0.0642933 4.7526 0.0387364 4.81092C0.0131796 4.86924 0 4.93205 0 4.99552C0 5.059 0.0131796 5.12181 0.0387364 5.18013C0.0642933 5.23845 0.101693 5.29106 0.148658 5.33477L3.33042 8.29722C3.37587 8.33954 3.42938 8.37267 3.4879 8.39472C3.54642 8.41677 3.6088 8.42731 3.67147 8.42573C3.73415 8.42415 3.79589 8.41048 3.85318 8.38552C3.91046 8.36055 3.96217 8.32477 4.00535 8.28021C4.04852 8.23566 4.08232 8.1832 4.10481 8.12585C4.1273 8.06849 4.13804 8.00735 4.13642 7.94593C4.1348 7.8845 4.12085 7.82399 4.09536 7.76785C4.06988 7.71171 4.03336 7.66104 3.9879 7.61873L1.1703 4.99552L3.9879 2.37232C4.0587 2.3084 4.10813 2.22499 4.12969 2.13304C4.15126 2.0411 4.14395 1.94491 4.10873 1.8571C4.07352 1.7693 4.01203 1.69398 3.93235 1.64104C3.85268 1.5881 3.75852 1.56 3.66226 1.56045ZM10.3234 1.56106C10.2285 1.5635 10.1365 1.59363 10.0592 1.6476C9.98183 1.70157 9.92266 1.77691 9.88923 1.86401C9.85581 1.9511 9.84965 2.04599 9.87153 2.13654C9.89342 2.22709 9.94236 2.30918 10.0121 2.37232L12.8297 4.99552L10.0121 7.61873C9.96664 7.66104 9.93012 7.71171 9.90464 7.76785C9.87915 7.82399 9.8652 7.8845 9.86358 7.94593C9.86196 8.00735 9.8727 8.06849 9.89519 8.12585C9.91768 8.1832 9.95148 8.23566 9.99465 8.28021C10.0378 8.32477 10.0895 8.36055 10.1468 8.38552C10.2041 8.41048 10.2659 8.42415 10.3285 8.42573C10.3912 8.42731 10.4536 8.41677 10.5121 8.39472C10.5706 8.37267 10.6241 8.33954 10.6696 8.29722L13.8513 5.33477C13.8983 5.29106 13.9357 5.23845 13.9613 5.18013C13.9868 5.12181 14 5.059 14 4.99552C14 4.93205 13.9868 4.86924 13.9613 4.81092C13.9357 4.7526 13.8983 4.69998 13.8513 4.65628L10.6696 1.69383C10.6239 1.65014 10.5697 1.61587 10.5102 1.59306C10.4508 1.57026 10.3873 1.55937 10.3234 1.56106Z"
                fill={isMarkActive(editor, "code") ? "#2da7f8" : "black"}
              />
            </svg>
          </span>
        </div>

        <div className="text-color-container">
          <Popover
            overlayClassName="no-arrow"
            placement="bottom"
            content={getTextBackgroundContent()}
            trigger="click"
            destroyTooltipOnHide={true}
          >
            {isMarkActive(editor, "backgroundColor") != undefined ? (
              <div
                className="color-preview text-background-container"
                onMouseDown={(e) => {
                  e.preventDefault();
                  toggleTextBackgroundPopup();
                }}
                ref={textBackgroundButtonRef}
              >
                <div
                  style={{
                    backgroundColor: isMarkActive(editor, "backgroundColor"),
                  }}
                ></div>
              </div>
            ) : (
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  toggleTextBackgroundPopup();
                }}
                ref={textBackgroundButtonRef}
                className="text-background-container"
              >
                <img src={textBackground} />
              </div>
            )}
          </Popover>
          <Popover
            overlayClassName="no-arrow"
            placement="bottom"
            content={getTextColorContent()}
            trigger="click"
            destroyTooltipOnHide={true}
          >
            {isMarkActive(editor, "textColor") != undefined ? (
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  toggleTextColorPopup();
                }}
                ref={textColorButtonRef}
                className="text-color-color-container"
              >
                <svg
                  width="16"
                  height="10"
                  viewBox="0 0 16 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <path
                    d="M3.9917 0.000100999C3.91892 0.00175962 3.84818 0.0256797 3.7881 0.0689432C3.72802 0.112207 3.68119 0.172944 3.65334 0.243744L0.0285449 9.45388C-0.009526 9.55067 -0.00951452 9.65942 0.0285766 9.7562C0.0666678 9.85298 0.139718 9.92987 0.231658 9.96995C0.323598 10.01 0.426896 10.01 0.518828 9.96992C0.610759 9.92982 0.683794 9.85291 0.721865 9.75612L1.55824 7.63118H6.44176L7.27813 9.75612C7.29699 9.80404 7.32462 9.84759 7.35946 9.88428C7.39429 9.92096 7.43565 9.95006 7.48117 9.96992C7.52669 9.98977 7.57548 9.99999 7.62475 10C7.67403 10 7.72282 9.98979 7.76834 9.96995C7.81387 9.9501 7.85523 9.92101 7.89008 9.88434C7.92492 9.84766 7.95256 9.80412 7.97142 9.7562C7.99028 9.70828 7.99999 9.65691 8 9.60504C8.00001 9.55317 7.99031 9.5018 7.97146 9.45388L4.34666 0.243744C4.31773 0.170191 4.26835 0.107565 4.205 0.0640848C4.14165 0.0206043 4.0673 -0.00169929 3.9917 0.000100999ZM4 1.42701L6.13123 6.84165H1.86877L4 1.42701Z"
                    fill={isMarkActive(editor, "textColor")}
                  />
                  <path
                    d="M15.6737 4L12.3263 4C12.078 4 11.9209 4.21775 12.0413 4.39521L12.8781 5.62903L13.715 6.86284C13.839 7.04572 14.161 7.04572 14.285 6.86284L15.9587 4.39521C16.0791 4.21775 15.922 4 15.6737 4Z"
                    fill="#1A1A1A"
                  />
                </svg>
              </div>
            ) : (
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  toggleTextColorPopup();
                }}
                ref={textColorButtonRef}
                className="text-color-color-container"
              >
                <img src={textColor} />
              </div>
            )}
          </Popover>
          {/* Text link */}

          <div
            onMouseDown={(e) => {
              e.preventDefault();
              toggleAddLinkPopup();
            }}
            ref={addLinkButtonRef}
            className="add-link-text-container"
          >
            <svg
              width="16"
              height="8"
              viewBox="0 0 16 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onMouseDown={(e) => e.preventDefault()}
            >
              <path
                d="M3.79052 5.1693e-05C1.70313 5.1693e-05 0 1.70318 0 3.79057C0 5.87796 1.70313 7.58109 3.79052 7.58109H5.34118C5.40968 7.58205 5.47768 7.5694 5.54124 7.54386C5.6048 7.51832 5.66265 7.4804 5.71143 7.4323C5.76021 7.38421 5.79895 7.3269 5.82538 7.26371C5.85182 7.20052 5.86544 7.1327 5.86544 7.0642C5.86544 6.9957 5.85182 6.92788 5.82538 6.86469C5.79895 6.80149 5.76021 6.74418 5.71143 6.69609C5.66265 6.648 5.6048 6.61008 5.54124 6.58454C5.47768 6.55899 5.40968 6.54634 5.34118 6.54731H3.79052C2.26175 6.54731 1.03378 5.31933 1.03378 3.79057C1.03378 2.2618 2.26175 1.03383 3.79052 1.03383H5.34118C5.40968 1.0348 5.47768 1.02214 5.54124 0.996602C5.6048 0.971061 5.66265 0.933141 5.71143 0.885048C5.76021 0.836954 5.79895 0.779645 5.82538 0.716452C5.85182 0.653259 5.86544 0.585441 5.86544 0.51694C5.86544 0.44844 5.85182 0.380622 5.82538 0.317429C5.79895 0.254235 5.76021 0.196927 5.71143 0.148833C5.66265 0.100739 5.6048 0.0628199 5.54124 0.0372785C5.47768 0.011737 5.40968 -0.000916981 5.34118 5.1693e-05H3.79052ZM9.82089 5.1693e-05C9.75239 -0.000916981 9.68439 0.011737 9.62083 0.0372785C9.55727 0.0628199 9.49942 0.100739 9.45064 0.148833C9.40186 0.196927 9.36313 0.254235 9.33669 0.317429C9.31025 0.380622 9.29664 0.44844 9.29664 0.51694C9.29664 0.585441 9.31025 0.653259 9.33669 0.716452C9.36313 0.779645 9.40186 0.836954 9.45064 0.885048C9.49942 0.933141 9.55727 0.971061 9.62083 0.996602C9.68439 1.02214 9.75239 1.0348 9.82089 1.03383H11.3716C12.9003 1.03383 14.1283 2.2618 14.1283 3.79057C14.1283 5.31933 12.9003 6.54731 11.3716 6.54731H9.82089C9.75239 6.54634 9.68439 6.55899 9.62083 6.58454C9.55727 6.61008 9.49942 6.648 9.45064 6.69609C9.40186 6.74418 9.36313 6.80149 9.33669 6.86469C9.31025 6.92788 9.29664 6.9957 9.29664 7.0642C9.29664 7.1327 9.31025 7.20052 9.33669 7.26371C9.36313 7.3269 9.40186 7.38421 9.45064 7.4323C9.49942 7.4804 9.55727 7.51832 9.62083 7.54386C9.68439 7.5694 9.75239 7.58205 9.82089 7.58109H11.3716C13.4589 7.58109 15.1621 5.87796 15.1621 3.79057C15.1621 1.70318 13.4589 5.1693e-05 11.3716 5.1693e-05H9.82089ZM3.27363 3.27368C3.20514 3.27271 3.13713 3.28537 3.07357 3.31091C3.01001 3.33645 2.95216 3.37437 2.90338 3.42246C2.8546 3.47056 2.81587 3.52786 2.78943 3.59106C2.76299 3.65425 2.74938 3.72207 2.74938 3.79057C2.74938 3.85907 2.76299 3.92689 2.78943 3.99008C2.81587 4.05327 2.8546 4.11058 2.90338 4.15868C2.95216 4.20677 3.01001 4.24469 3.07357 4.27023C3.13713 4.29577 3.20514 4.30843 3.27363 4.30746H11.8884C11.9569 4.30843 12.0249 4.29577 12.0885 4.27023C12.1521 4.24469 12.2099 4.20677 12.2587 4.15868C12.3075 4.11058 12.3462 4.05327 12.3726 3.99008C12.3991 3.92689 12.4127 3.85907 12.4127 3.79057C12.4127 3.72207 12.3991 3.65425 12.3726 3.59106C12.3462 3.52786 12.3075 3.47056 12.2587 3.42246C12.2099 3.37437 12.1521 3.33645 12.0885 3.31091C12.0249 3.28537 11.9569 3.27271 11.8884 3.27368H3.27363Z"
                fill={isLinkActive(editor) ? "#2da7f8" : "#424242"}
              />
            </svg>
          </div>
        </div>
        <div className="block-type-container">
          <div
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            className="convert-to-bulleted-list-container"
          >
            <img
              src={bulletedList}
              onMouseDown={(e) => {
                e.preventDefault();
                convertTo("unordered-list-item");
              }}
            />
          </div>

          <div
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            className="convert-to-numbered-list-container"
          >
            <img
              src={numberedList}
              onMouseDown={(e) => {
                e.preventDefault();
                convertTo("ordered-list-item");
              }}
            />
          </div>

          <div
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            className="convert-to-checkbox-list-container"
          >
            <img
              src={checkboxItem}
              onMouseDown={(e) => {
                e.preventDefault();
                convertTo("checkbox-item");
              }}
            />
          </div>
        </div>
      </div>
    </Portal>
  );
};
export default Toolbar;
