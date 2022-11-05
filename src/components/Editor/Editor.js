import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { createEditor, Transforms, Editor as SlateEditor, Node } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { withHistory } from "slate-history";
import { useDebouncedCallback } from "use-debounce";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Custom components / hovers
import SelectMenu from "../SelectMenu/SelectMenu";
import Toolbar from "../Toolbar/Toolbar";
import NoteDeletedMessage from "../NoteDeletedMessage/NoteDeletedMessage";

// Renderers
import Paragraph from "../BlockRenderers/Paragraph";
import Heading1 from "../BlockRenderers/Heading1";
import Heading2 from "../BlockRenderers/Heading2";
import Heading3 from "../BlockRenderers/Heading3";
import BlockQuote from "../BlockRenderers/BlockQuote";
import Divider from "../BlockRenderers/Divider";
import TodoItem from "../BlockRenderers/TodoItem";
import UnorderedItem from "../BlockRenderers/UnorderedItem";
import NumberedItem from "../BlockRenderers/NumberedItem";
import Bookmark from "../BlockRenderers/Bookmark";
import ImageBlock from "../BlockRenderers/ImageBlock";
import VideoBlock from "../BlockRenderers/VideoBlock";
import LinkLeaf from "../LinkLeaf/LinkLeaf";
import Equation from "../BlockRenderers/Equation";

// Utils
import getCaretCoordinates from "../../utils/getCaretCoordinates";
import getCurrentBlock from "../../utils/getCurrentBlock";
import getCaretIndex from "../../utils/getCaretIndex";
import isMarkActive from "../../utils/isMarkActive";
import keycode from "keycode";
import calculateNumbersForListItem from "../../utils/calculateNumbersForListItem";
import linkPreviewUrl from "../../utils/getLinkPreviewUrl";
import getClassNameForStyling from "../../utils/getClassNameForStyling";
import firebase from "../../utils/firebase";
import constants from "../../utils/constants";
import windowFocused from "../../utils/windowFocused";
import elementInViewport from "../../utils/elementInViewport";
import updateNote from "../../utils/updateNote";

// Data model
import Block from "../../Models/Block";

// Redux

// CSS
import "katex/dist/katex.min.css";
import "./editor.css";

// Plugins
import withHtml from "../../utils/withHtml";
import withVoid from "../../plugins/withVoid";
import getTimestampFromTime from "../../utils/getTimestampFromTime";
import TweetBlock from "../BlockRenderers/TweetBlock";
import isJson from "../../utils/isJson";
import getTweetIdFromUrl from "../../utils/getTweetIdFromUrl";
import useIsMountedRef from "../../utils/useIsMounteRef";
import Singleton from "../../utils/getDocument";
import WindowSingleton from "../../utils/getWindow";
import $ from "jquery";
import withInline from "../../plugins/withInline";
import isLinkActive from "../../utils/isLinkActive";
import getLinkValue from "../../utils/getLinkValue";
import wrapLink from "../../utils/wrapLink";

function Editor({
  fontStyle,
  textAlignment,
  smallText,
  fullWidth,
  noteData,
  scrollToBottom,
  setActiveNote,
}) {
  // Refs
  const selectMenuRef = useRef(null);
  const editorRef = useRef(null);
  const noteName = useRef(null);
  const isMountedRef = useIsMountedRef();
  const [state, setState] = useState({
    blocks: [...noteData.blocks],
    selectMenuIsOpen: false,
    selectMenuPosition: {
      x: null,
      y: null,
    },
    noteData: noteData,
    fontStyle: fontStyle,
    textAlignment: textAlignment,
    smallText: smallText,
    fullWidth: fullWidth,
    currentPath: undefined,
    isBold: false,
    isItalic: false,
    isUnderlined: false,
    isStrikeThrough: false,
    hasLink: false,
    isCode: false,
    isBackgroundColorActive: undefined,
    isTextColorActive: undefined,
    tabActive: false,
    loadingBlocks: [],
    currentLink: "",
    previousKey: undefined,
  });

  const debounced = useDebouncedCallback(
    async () => {
      try {
        var { blocks, noteData, tabActive } = state;

        noteData = {
          ...noteData,
          blocks: blocks,
        };
        await updateNote(noteData, "blocks");
      } catch (err) {
        console.log(err);
      }
    },
    1000,
    { maxWait: 5000 }
  );

  const debouncedName = useDebouncedCallback(
    async () => {
      try {
        var { noteData } = state;
        noteData = {
          ...noteData,
        };
        if (noteData.name.trim() == "") {
          noteData.name = "Untitled";
        }

        await updateNote(noteData, "name");
      } catch (err) {
        console.log(err);
      }
    },
    1000,
    { maxWait: 2000 }
  );

  useEffect(() => {
    if (state.noteData && noteData) {
      if (state.noteData.id != noteData.id) {
        editor.selection = undefined;
        if (isMountedRef.current) {
          setState((prevState) => {
            return {
              ...prevState,
              noteData: noteData,
              blocks: noteData.blocks,
            };
          });
        }
      } else {
        if (!state.tabActive) {
          editor.selection = undefined;
          if (isMountedRef.current) {
            setState((prevState) => {
              return {
                ...prevState,
                noteData: noteData,
                blocks: noteData.blocks,
              };
            });
          }
        }
      }
    }
  }, [noteData]);

  useEffect(() => {
    if (isMountedRef.current) {
      setState((prevState) => {
        return {
          ...prevState,
          fontStyle: fontStyle,
          textAlignment: textAlignment,
          smallText: smallText,
          fullWidth: fullWidth,
          noteData: noteData,
        };
      });
    }
  }, [fontStyle, textAlignment, smallText, fullWidth, noteData]);

  // componentdidmount
  useEffect(() => {
    const document = Singleton.getDocument();
    const window = WindowSingleton.getWindow();
    editorRef.current = ReactEditor.toDOMNode(editor, editor);
    document.addEventListener("mouseup", mouseUpHandler);
    if (isMountedRef.current) {
      setState((prevState) => {
        return {
          ...prevState,
          tabActive: windowFocused(),
        };
      });
    }

    window.addEventListener("message", async function (e) {
      try {
        const dataIsJson = isJson(e.data);
        if (!dataIsJson) return;

        const data = JSON.parse(e.data);
        const message = data.message;

        if (message == "addTextToNote") {
          const text = data.text;

          if (text) {
            if (text.trim() != "") {
              const currentBlock = getCurrentBlock(editor);
              if (
                ReactEditor.isFocused(editor) &&
                !SlateEditor.isVoid(editor, currentBlock)
              ) {
                Transforms.insertText(editor, text.toString(), {
                  at: SlateEditor.end(editor, editor.selection),
                });
                scrollToBottom();
              } else {
                ReactEditor.focus(editor);
                setTimeout(() => {
                  const newParagraphBlock = new Block({});
                  newParagraphBlock.setText(text.toString());

                  Transforms.insertNodes(
                    editor,
                    newParagraphBlock.getObject(),
                    {
                      at: [editor.children.length],
                    }
                  );
                  scrollToBottom();
                }, 200);
              }
            }
          }
        } else if (message == "addTweetToNote") {
          const tweet = data.tweet;
          var tweetId = getTweetIdFromUrl(data.tweet.tweetUrl);
          const newBlock = new Block({
            type: "tweet",
            fileUrl: tweet.tweetUrl,
          }).getObject();
          newBlock.tweetId = tweetId;

          if (ReactEditor.isFocused()) {
            Transforms.insertNodes(editor, newBlock);
          } else {
            ReactEditor.focus(editor);
            setTimeout(() => {
              Transforms.insertNodes(editor, newBlock);
            }, 200);
          }
        } else if (message == "addImageToNote") {
          const imageUrl = data.imageUrl;

          const newImageBlock = new Block({
            type: "image",
            fileUrl: imageUrl,
            blockWidth: data.width,
          });

          if (ReactEditor.isFocused()) {
            Transforms.insertNodes(editor, newImageBlock.getObject(), {
              at: [editor.children.length],
            });
          } else {
            ReactEditor.focus(editor);
            setTimeout(() => {
              Transforms.insertNodes(editor, newImageBlock.getObject(), {
                at: [editor.children.length],
              });
            }, 200);
          }
        } else if (message == "setImageForBlock") {
          const blocks = editor.children;
          const id = data.blockId;
          const image = data.image;
          const block = blocks.find((block) => block.id == id);
          if (block) {
            const path = ReactEditor.findPath(editor, block);

            Transforms.setNodes(
              editor,
              {
                fileUrl: image,
              },
              {
                at: path,
              }
            );
          }
        }
      } catch (err) {
        console.log(err);
      }
    });

    window.addEventListener("focus", (e) => {
      setState((prevState) => {
        return {
          ...prevState,
          tabActive: true,
        };
      });
    });

    window.addEventListener("blur", (e) => {
      setState((prevState) => {
        return {
          ...prevState,
          tabActive: false,
        };
      });
    });
  }, []);

  const editor = useMemo(
    () =>
      withInline(withVoid(withHtml(withReact(withHistory(createEditor()))))),
    []
  );

  const handleChange = async (newValue) => {
    try {
      var { x, y } = getCaretCoordinates();
      x = x != undefined ? x : state.selectMenuPosition.x;
      y = y != undefined ? y : state.selectMenuPosition.y;
      debounced({});
      setState((prevState) => {
        return {
          ...prevState,
          blocks: newValue,
          selectMenuPosition: {
            x,
            y,
          },
        };
      });
    } catch (err) {
      console.log(err);
    }
  };

  // useCallback to memoize that element if it occurs again
  const renderElement = useCallback(
    (props) => {
      props["fontStyle"] = state.fontStyle;
      props["textAlignment"] = state.textAlignment;
      props["smallText"] = state.smallText;
      props["loadingBlocks"] = state.loadingBlocks;

      switch (props.element.type) {
        case "paragraph":
          return <Paragraph {...props} />;
        case "heading-one":
          return <Heading1 {...props} />;
        case "heading-two":
          return <Heading2 {...props} />;
        case "heading-three":
          return <Heading3 {...props} />;
        case "block-quote":
          return <BlockQuote {...props} />;
        case "divider":
          return <Divider {...props} />;
        case "checkbox-item":
          return <TodoItem {...props} />;
        case "unordered-list-item":
          return <UnorderedItem {...props} />;
        case "ordered-list-item":
          return <NumberedItem {...props} />;
        case "bookmark":
          return <Bookmark {...props} />;
        case "equation":
          return <Equation {...props} />;
        case "image":
          return <ImageBlock {...props} />;
        case "video":
          return <VideoBlock {...props} />;
        case "tweet":
          return <TweetBlock {...props} />;
        case "link":
          return <LinkLeaf {...props} />;
        default:
          return <Paragraph {...props} />;
      }
    },
    [state.fontStyle, state.textAlignment, state.smallText, state.loadingBlocks]
  );

  const keyDownHandler = (e) => {
    const { blocks, selectMenuIsOpen } = state;

    const keyCode = e.keyCode;

    if (keyCode === keycode("escape")) {
      setState((prevState) => {
        return {
          ...prevState,
          selectMenuIsOpen: false,
        };
      }); // Enter press
    } else if (keyCode === keycode("enter")) {
      if (selectMenuIsOpen) {
        e.preventDefault();
        return;
      }
      const currentBlock = getCurrentBlock(editor);
      const currentBlockObj = new Block(currentBlock);
      const index = blocks.map((b) => b.id).indexOf(currentBlock.id);
      const text = Node.string(currentBlock);
      const caretIndex = getCaretIndex(editor.selection);

      if (
        currentBlock.type == "heading-one" ||
        currentBlock.type == "heading-two" ||
        currentBlock.type == "heading-three"
      ) {
      } else if (currentBlock.type == "block-quote") {
        e.preventDefault();
        const newParagraphBlock = new Block({ type: "paragraph" });
        Transforms.insertNodes(editor, newParagraphBlock.getObject());
      } else if (
        currentBlock.type === "checkbox-item" ||
        currentBlock.type === "unordered-list-item"
      ) {
        if (Node.string(currentBlock) != "") {
        } else {
          e.preventDefault();

          const path = editor.selection.focus.path[0];
          const newProperties = {
            type: "paragraph",
          };
          Transforms.setNodes(editor, newProperties, {
            at: [path],
            match: (node, path) => {
              return node.id === currentBlock.id;
            },
          });
        }
      } else if (currentBlock.type === "ordered-list-item") {
        if (currentBlockObj.getText() != "") {
        } else {
          e.preventDefault();
          const path = editor.selection.focus.path[0];
          const newProperties = {
            type: "paragraph",
          };
          Transforms.setNodes(editor, newProperties, {
            at: [path],
            match: (node, path) => {
              return node.id === currentBlock.id;
            },
          });
        }
      } else if (currentBlock.type === "bookmark") {
        e.preventDefault();
        var url = text;
        const path = [index];
        var prefix1 = "http://";
        var prefix2 = "https://";
        if (
          url.substr(0, prefix1.length) !== prefix1 &&
          url.substr(0, prefix2.length) !== prefix2
        ) {
          url = prefix2 + url;
        }

        const urlRegex =
          /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

        if (urlRegex.test(url)) {
          setState((prevState) => {
            return {
              ...prevState,
              loadingBlocks: !state.loadingBlocks.includes(currentBlock.id)
                ? [...state.loadingBlocks, currentBlock.id]
                : state.loadingBlocks,
            };
          });

          fetch(`${linkPreviewUrl}?url=${url.trim()}`)
            .then((res) => {
              if (res.ok) {
                return res.json();
              } else {
                throw new Error("metadata can't be scraped");
              }
            })
            .then((res) => {
              setState((prevState) => {
                return {
                  ...prevState,
                  loadingBlocks: state.loadingBlocks.filter(
                    (loadingBlock) => loadingBlock != currentBlock.id
                  ),
                };
              });

              const newProperties = {
                metadata: res.metadata ? res.metadata : {},
              };
              Transforms.setNodes(editor, newProperties, {
                at: path,
                match: (node, path) => {
                  return node.id === currentBlock.id;
                },
              });
            })
            .catch((err) => {
              setState((prevState) => {
                return {
                  ...prevState,
                  loadingBlocks: state.loadingBlocks.filter(
                    (loadingBlock) => loadingBlock != currentBlock.id
                  ),
                };
              });
              const newProperties = {
                metadata: {},
                showLink: true,
              };
              Transforms.setNodes(editor, newProperties, {
                at: path,
                match: (node, path) => {
                  return node.id === currentBlock.id;
                },
              });
            });
        }
      } else {
        // If caret is not at end then don't do anything - Fetches data and loads bookmark
        if (caretIndex < text.length) {
        } else {
          e.preventDefault();
          const newBlockToAdd = new Block({});
          Transforms.insertNodes(editor, newBlockToAdd.getObject());
        }
      }
      // Recalculate the numbers for all the numbered item list
      calculateNumbersForListItem(editor);
    } else if (keyCode === keycode("backspace")) {
      const currentBlock = getCurrentBlock(editor);
      const currentBlockObj = new Block(currentBlock);

      if (currentBlockObj.type === "bookmark") {
        if (
          Object.keys(currentBlockObj.metadata).length > 0 ||
          currentBlockObj.showLink ||
          currentBlockObj.getText() === "http://" ||
          currentBlockObj.getText() === "https://"
        ) {
          e.preventDefault();

          Transforms.removeNodes(editor);
        }
      }
      calculateNumbersForListItem(editor);
    } else if (keyCode === keycode("delete")) {
      const currentBlock = getCurrentBlock(editor);
      const index = blocks.map((b) => b.id).indexOf(currentBlock.id);
      const currentBlockObj = new Block(currentBlock);
      if (currentBlockObj.type === "bookmark") {
        if (
          Object.keys(currentBlockObj.metadata).length > 0 ||
          currentBlockObj.showLink
        ) {
          e.preventDefault();
          Transforms.removeNodes(editor, {
            at: [index],
          });
          calculateNumbersForListItem(editor);
        }
      }
    }

    setTimeout(() => {
      calculateNumbersForListItem(editor);
    }, 20);
    setState((prevState) => {
      return {
        ...prevState,
        previousKey: keyCode,
      };
    });
  };

  const mouseUpHandler = (e) => {
    // If some text is selected then show toolbar
    // Check if mouseup is occuring inside the editor
    if (editorRef.current) {
      if (editorRef.current.contains(e.target)) {
        if (canShowToolbar()) {
          const isBold = isMarkActive(editor, "bold");
          const isItalic = isMarkActive(editor, "italic");
          const isUnderlined = isMarkActive(editor, "underline");
          const isStrikeThrough = isMarkActive(editor, "strikethrough");
          const isCode = isMarkActive(editor, "code");
          const isBackgroundColorActive = isMarkActive(
            editor,
            "backgroundColor"
          );
          const hasLink = isLinkActive(editor);
          const currentLink = hasLink ? getLinkValue(editor) : undefined;

          const isTextColorActive = isMarkActive(editor, "textColor");
          // Set timeout to delay render which changes text selection

          setTimeout(() => {
            setState((prevState) => {
              return {
                ...prevState,
                currentPath: editor.selection
                  ? editor.selection.focus.path[0]
                  : state.currentPath,
                currentBlock: getCurrentBlock(editor),
                isBold: isBold,
                isItalic: isItalic,
                isUnderlined: isUnderlined,
                isStrikeThrough: isStrikeThrough,
                isCode: isCode,
                hasLink: hasLink != undefined && hasLink != "" ? true : false,
                currentLink: currentLink,
                isBackgroundColorActive: isBackgroundColorActive,
                isTextColorActive: isTextColorActive,
              };
            });
          }, 100);
        }
      }
    }
  };

  const canShowToolbar = () => {
    const currentBlock = getCurrentBlock(editor);
    if (currentBlock) {
      if (currentBlock.type == "equation") {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  const canShowSelectMenu = () => {
    const currentBlock = getCurrentBlock(editor);

    if (currentBlock) {
      if (
        currentBlock.type == "equation" ||
        currentBlock.type == "bookmark" ||
        currentBlock.type == undefined
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  const blockSelectionHandler = (type, command) => {
    if (type == "youtube-moment") {
      const link = window.location.href;

      const isYoutube =
        /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/.test(
          link
        );

      Transforms.delete(editor, {
        at: editor.selection,
        reverse: true,
        distance: command.length + 1,
      });

      if (!isYoutube) return;

      const ytVideo = $("#container video");

      var currentTime = ytVideo[0].currentTime;

      const videoId = link.split("watch?v=")[1];

      const url = `https://youtu.be/${videoId}?t=${Math.floor(
        currentTime >= 7 ? currentTime - 7 : currentTime
      )}`;

      const time = Math.floor(currentTime);

      const timeStampFromTime = getTimestampFromTime(parseInt(time));
      const currentSelection = editor.selection;

      Transforms.insertNodes(editor, {
        type: "link",
        url: url,
        children: [{ text: timeStampFromTime }],
      });
    } else {
      handleBlockAddition(type, command);
    }

    setTimeout(() => {
      calculateNumbersForListItem(editor);
    }, 20);
  };

  const handleBlockAddition = (type, command) => {
    const newBlock = new Block({
      type: type,
    });

    Transforms.delete(editor, {
      at: editor.selection,
      reverse: true,
      distance: command.length + 1,
    });

    Transforms.insertNodes(editor, newBlock.getObject());

    if (type == "divider") {
      const newParagraphBlock = new Block({
        type: "paragraph",
      });
      Transforms.insertNodes(editor, newParagraphBlock.getObject());
    }
  };

  const keyUpHandler = (e) => {
    const keyCode = e.keyCode;
    if (keyCode === keycode("Numpad /")) {
      if (canShowSelectMenu()) {
        setState((prevState) => {
          return {
            ...prevState,
            selectMenuIsOpen: true,
          };
        });
      }
    }
  };

  const setPopup = (bool) => {
    setState((prevState) => {
      return {
        ...prevState,
        selectMenuIsOpen: bool,
      };
    });
  };

  const convertTo = (type) => {
    const presentBlock = getCurrentBlock(editor);

    const anchorPath = editor.selection.anchor.path;
    const focusPath = editor.selection.focus.path;
    if (anchorPath && focusPath) {
      if (anchorPath[0] != focusPath[0]) {
        for (var i = anchorPath[0]; i <= focusPath[0]; i++) {
          const block = editor.children[i];

          if (!SlateEditor.isVoid(editor, block)) {
            const newProperties = {
              type: type,
            };

            const path = ReactEditor.findPath(editor, block);

            Transforms.setNodes(editor, newProperties, {
              at: path,
            });
          }
        }
      } else {
        const newProperties = {
          type: type,
        };

        Transforms.setNodes(editor, newProperties, {
          at: [state.currentPath],
          match: (node, path) => {
            return node.id === state.currentBlock.id;
          },
        });
      }
    } else {
      const newProperties = {
        type: type,
      };

      Transforms.setNodes(editor, newProperties, {
        at: [state.currentPath],
        match: (node, path) => {
          return node.id === state.currentBlock.id;
        },
      });
    }

    setTimeout(() => {
      calculateNumbersForListItem(editor);
    }, 20);
  };

  const getClassNameForLeaf = (leaf) => {
    var className = "";

    if (leaf.bold) {
      className += "text-decoration-bold ";
    }
    if (leaf.italic) {
      className += "text-decoration-italic ";
    }

    if (leaf.underline) {
      className += "text-decoration-underline ";
    }

    if (leaf.strikethrough) {
      className += "text-decoration-strikethrough ";
    }
    if (leaf.code) {
      className += "text-decoration-code ";
    }

    if (leaf.link) {
      className += "link-decoration ";
    }

    if (leaf.linkSelection) {
      className += "link-selection ";
    }

    return className;
  };

  const renderLeaf = useCallback(({ attributes, children, leaf }) => {
    const className = getClassNameForLeaf(leaf);
    return (
      <span
        className={className.length > 0 ? className : ""}
        {...attributes}
        spellCheck={leaf.code ? "false" : "true"}
        style={{
          backgroundColor:
            leaf.backgroundColor != undefined
              ? leaf.code
                ? "rgba(135, 131, 120, 0.15)"
                : leaf.backgroundColor
              : "#fff",
          color:
            leaf.textColor != undefined
              ? leaf.code
                ? "#eb5757"
                : leaf.textColor
              : "#000",
          borderBottomColor:
            leaf.textColor != undefined
              ? leaf.code
                ? "#eb5757"
                : leaf.textColor
              : "#000",
        }}
      >
        {children}
      </span>
    );
  }, []);

  const setBackgroundColor = (color) => {
    SlateEditor.removeMark(editor, "backgroundColor");
    SlateEditor.addMark(editor, "backgroundColor", color);
    const isBackgroundColorActive = isMarkActive(editor, "backgroundColor");

    setState((prevState) => {
      return {
        ...prevState,
        isBackgroundColorActive: isBackgroundColorActive,
      };
    });
  };

  const setTextColor = (color) => {
    SlateEditor.removeMark(editor, "textColor");
    SlateEditor.addMark(editor, "textColor", color);

    const isTextColorActive = isMarkActive(editor, "textColor");

    setState((prevState) => {
      return {
        ...prevState,
        isTextColorActive: isTextColorActive,
      };
    });
  };

  const toggleMark = (editor, format) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) {
      SlateEditor.removeMark(editor, format);
    } else {
      SlateEditor.addMark(editor, format, true);
    }
    setState((prevState) => {
      return {
        ...prevState,
        isBold: format == "bold" ? !isActive : state.isBold,
        isItalic: format == "italic" ? !isActive : state.isItalic,
        isUnderlined: format == "underline" ? !isActive : state.isUnderlined,
        isStrikeThrough:
          format == "strikethrough" ? !isActive : state.isStrikeThrough,
        isCode: format == "code" ? !isActive : state.isCode,
      };
    });
  };

  const setTextFormat = (e, format) => {
    e.preventDefault();
    toggleMark(editor, format);
  };

  const handleNoteNameChange = (e) => {
    const { value } = e.target;

    if (value.length < 100) {
      setState((prevState) => {
        return {
          ...prevState,
          noteData: {
            ...state.noteData,
            name: value,
          },
        };
      });
    } else {
      setState((prevState) => {
        return {
          ...prevState,
          noteData: {
            ...state.noteData,
            name: state.noteData.name,
          },
        };
      });
    }
    debouncedName({});
  };

  const unArchiveNote = async () => {
    try {
      const { noteData } = state;

      noteData.isArchived = false;

      await updateNote(noteData, "isArchived");
    } catch (err) {
      console.log(err);
    }
  };

  const deleteNotePermanently = async () => {
    try {
      const { noteData } = state;

      await firebase
        .firestore()
        .collection(constants.FILEOBJECTS_COLLECTION)
        .doc(noteData.id)
        .delete();

      setActiveNote({});
    } catch (err) {
      console.log(err);
    }
  };

  const handleNoteNameKeyDown = (e) => {
    const keyCode = e.keyCode;
    const { blocks } = state;

    if (keyCode == keycode("enter")) {
      if (blocks.length == 0) {
        e.preventDefault();
        const newParagraphBlock = new Block({});

        Transforms.insertNodes(editor, newParagraphBlock.getObject(), {
          at: [0],
        });

        ReactEditor.focus(editor);
      } else {
        if (
          blocks[0].type == "divider" ||
          blocks[0].type == "bookmark" ||
          blocks[0].type == "equation" ||
          blocks[0].type == "video" ||
          blocks[0].type == "image" ||
          blocks[0].type == "block-quote"
        ) {
          e.preventDefault();
          const newParagraphBlock = new Block({});

          Transforms.insertNodes(editor, newParagraphBlock.getObject(), {
            at: [0],
          });

          ReactEditor.focus(editor);
        } else {
          e.preventDefault();

          ReactEditor.focus(editor);
        }
      }
    }
  };

  const addParagraphBlockAtEnd = (e) => {
    const { blocks } = state;
    var allVoid = true;

    blocks.forEach((block) => {
      if (
        block.type != "divider" &&
        block.type != "bookmark" &&
        block.type != "equation" &&
        block.type != "video" &&
        block.type != "image" &&
        block.type != "tweet"
      ) {
        allVoid = false;
      }
    });
    if (allVoid) {
      const newParagraphBlock = new Block({ type: "paragraph" });
      Transforms.insertNodes(editor, newParagraphBlock.getObject(), {
        at: [blocks.length],
      });
      ReactEditor.focus(editor);
      Transforms.select(editor, [blocks.length - 1, 0]);
    } else {
      if (blocks[blocks.length - 1]) {
        if (
          blocks[blocks.length - 1].type == "divider" ||
          blocks[blocks.length - 1].type == "bookmark" ||
          blocks[blocks.length - 1].type == "equation" ||
          blocks[blocks.length - 1].type == "video" ||
          blocks[blocks.length - 1].type == "image" ||
          blocks[blocks.length - 1].type == "tweet"
        ) {
          const newParagraphBlock = new Block({ type: "paragraph" });
          Transforms.insertNodes(editor, newParagraphBlock.getObject(), {
            at: [blocks.length],
          });
          ReactEditor.focus(editor);
          Transforms.select(editor, [blocks.length - 1, 0]);
        }
      }
    }
  };

  const handleEditorClick = (e) => {};

  const handlePaste = () => {
    calculateNumbersForListItem(editor);
  };

  const handleCut = () => {
    calculateNumbersForListItem(editor);
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="page">
        <NoteDeletedMessage
          unArchiveNote={unArchiveNote}
          deleteNotePermanently={deleteNotePermanently}
          visible={state.noteData && state.noteData.isArchived}
        />

        <div className="note-editor" onClick={addParagraphBlockAtEnd}>
          <input
            type="text"
            className={`note-editor-note-name ${getClassNameForStyling(
              state.noteData
            )}`}
            onChange={handleNoteNameChange}
            onKeyDown={handleNoteNameKeyDown}
            value={state.noteData && state.noteData.name}
            placeholder="Untitled"
            ref={noteName}
          />

          <Slate editor={editor} onChange={handleChange} value={state.blocks}>
            <SelectMenu
              open={state.selectMenuIsOpen}
              position={state.selectMenuPosition}
              onSelect={blockSelectionHandler}
              setPopup={setPopup}
              ref={selectMenuRef}
              menuId={"note-editor-command-select-menu"}
              canShow={canShowSelectMenu()}
            />
            {canShowToolbar() && (
              <Toolbar
                isBold={state.isBold}
                isItalic={state.isItalic}
                isUnderlined={state.isUnderlined}
                isStrikeThrough={state.isStrikeThrough}
                isCode={state.isCode}
                hasLink={state.hasLink}
                currentLink={state.currentLink && state.currentLink.url}
                label={"Paragraph"}
                setTextFormat={setTextFormat}
                setBackgroundColor={setBackgroundColor}
                setTextColor={setTextColor}
                isBackgroundColorActive={state.isBackgroundColorActive}
                isTextColorActive={state.isTextColorActive}
                convertTo={(type) => convertTo(type)}
              />
            )}

            <Editable
              id={"blocks-container"}
              renderLeaf={renderLeaf}
              renderElement={renderElement}
              onKeyDown={keyDownHandler}
              onKeyUp={keyUpHandler}
              value={state.blocks}
              style={{ height: "120%", minHeight: "900px" }}
              placeholder="Type '/' for commands"
              readOnly={state.noteData.isArchived}
              onClick={handleEditorClick}
              onPaste={handlePaste}
              onCut={handleCut}
            />
          </Slate>
        </div>
      </div>
    </DndProvider>
  );
}

export default Editor;
