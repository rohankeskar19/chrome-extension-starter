import React, { Component } from "react";
import { matchSorter } from "match-sorter";

import { Popover } from "antd";
import "./selectmenu.css";

import paragraph from "../../icons/noteeditor/selectmenu/paragraph.svg";
import heading1Icon from "../../icons/noteeditor/selectmenu/heading-1.svg";
import heading2Icon from "../../icons/noteeditor/selectmenu/heading-2.svg";
import heading3Icon from "../../icons/noteeditor/selectmenu/heading-3.svg";
import checkboxList from "../../icons/noteeditor/selectmenu/checkbox-list.svg";
import unorderedList from "../../icons/noteeditor/selectmenu/unordered-list.svg";
import orderedList from "../../icons/noteeditor/selectmenu/ordered-list.svg";
import imageIcon from "../../icons/noteeditor/selectmenu/image.svg";
import videoIcon from "../../icons/noteeditor/selectmenu/video.svg";
import dividerIcon from "../../icons/noteeditor/selectmenu/divider.svg";
import quoteIcon from "../../icons/noteeditor/selectmenu/quote-icon.svg";
import equationIcon from "../../icons/noteeditor/selectmenu/equation-icon.svg";
import bookmarkIcon from "../../icons/noteeditor/selectmenu/bookmark-icon.svg";
import tweetIcon from "../../icons/noteeditor/selectmenu/twitter.svg";
import youtubeMomentIcon from "../../icons/noteeditor/selectmenu/youtube-moment-icon.svg";

import keycode from "keycode";
import Singleton from "../../utils/getDocument";

const MENU_HEIGHT = 150;

class SelectMenu extends Component {
  state = {
    command: "",
    items: [
      {
        id: "paragraph",
        type: "paragraph",
        label: "Paragraph",
        description: "Normal text",
        icon: paragraph,
      },
      {
        id: "heading-one",
        type: "heading-one",
        label: "Heading 1",
        description: "Section heading",
        icon: heading1Icon,
      },
      {
        id: "heading-two",
        type: "heading-two",
        label: "Heading 2",
        description: "Section sub heading",
        icon: heading2Icon,
      },
      {
        id: "heading-three",
        type: "heading-three",
        label: "Heading 3",
        description: "Section sub heading",
        icon: heading3Icon,
      },
      {
        id: "checkbox-item",
        type: "checkbox-item",
        label: "Todo List",
        description: "Add a todo list",
        icon: checkboxList,
      },
      {
        id: "unordered-list-item",
        type: "unordered-list-item",
        label: "Bulleted List",
        description: "Create a bulleted list",
        icon: unorderedList,
      },
      {
        id: "ordered-list-item",
        type: "ordered-list-item",
        label: "Numbered List",
        description: "Create a numbered list",
        icon: orderedList,
      },
      {
        id: "image",
        type: "image",
        label: "Image",
        description: "Add Image",
        icon: imageIcon,
      },
      {
        id: "video",
        type: "video",
        label: "Video",
        description: "Embed video",
        icon: videoIcon,
      },

      // {
      //   id: "link",
      //   type: "link",
      //   label: "Link Note",
      //   description: "Add a link to another note",
      //   icon: noteLinkIcon,
      // },
      {
        id: "divider",
        type: "divider",
        label: "Divider",
        description: "Section divider",
        icon: dividerIcon,
      },
      // {
      //   id: "table",
      //   type: "table",
      //   label: "Table",
      //   description: "Create table",
      //   icon: heading1Icon,
      // },
      {
        id: "block-quote",
        type: "block-quote",
        label: "Quote",
        description: "Add a quote",
        icon: quoteIcon,
      },
      {
        id: "equation",
        type: "equation",
        label: "Equation",
        description: "Add a mathematic equation",
        icon: equationIcon,
      },
      {
        id: "bookmark",
        type: "bookmark",
        label: "Bookmark",
        description: "Add bookmark",
        icon: bookmarkIcon,
      },
      // {
      //   id: "tweet",
      //   type: "tweet",
      //   label: "Tweet",
      //   description: "Embed tweet",
      //   icon: tweetIcon,
      // },
      {
        id: "youtube-moment",
        type: "youtube-moment",
        label: "Save youtube moment",
        description: "Create link to current youtube moment",
        icon: youtubeMomentIcon,
      },
    ],
    itemsToRender: [],
    selectedItem: 0,
    open: this.props.open,
    canShow: this.props.canShow,
    position: this.props.position,
    ownUpdate: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (state.ownUpdate) {
      return {
        ...state,
        ownUpdate: false,
      };
    } else {
      if (props.open != state.open) {
        return {
          open: props.open,
          itemsToRender: props.open ? state.items : state.itemsToRender,
          command: "",
          selectedItem: props.open ? 0 : -1,
        };
      }
      if (props.position != state.position) {
        return {
          position: props.position,
        };
      }
      if (props.canShow != state.canShow) {
        return {
          canShow: props.canShow,
        };
      }
    }

    return null;
  }

  componentDidMount() {
    const document = Singleton.getDocument();

    document.addEventListener("keydown", this.keyDownHandler);
    document.addEventListener("mousedown", this.handleClick);

    this.setState({
      itemsToRender: this.state.items,
      ownUpdate: true,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { open, command, items, itemsToRender, selectedItem } = this.state;
    if (!open) {
      return;
    }

    if (prevProps.open != this.props.open) {
      this.setState({
        open: this.props.open,
        ownUpdate: true,
      });
    }

    if (prevState.command !== command) {
      var newSelectedItem = selectedItem;
      if (itemsToRender.length == 0) {
        newSelectedItem = 0;
      }
      const newItems = matchSorter(items, command.replace("/", ""), {
        keys: ["label"],
      });

      if (selectedItem >= newItems.length) {
        newSelectedItem = newItems.length - 1;
      }

      if (command == "") {
        this.setState({
          itemsToRender: items,
          selectedItem: newSelectedItem,
          ownUpdate: true,
        });
      } else {
        this.setState({
          itemsToRender: newItems,
          selectedItem: newSelectedItem,
          ownUpdate: true,
        });
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyDownHandler);
  }

  handleClick = (e) => {
    if (this.props.innerRef) {
      if (this.props.innerRef.current) {
        if (!this.props.innerRef.current.contains(e.target)) {
          this.props.setPopup(false);
        }
      }
    }
  };

  elementInViewport = (ele) => {
    const document = Singleton.getDocument();

    const container = document.getElementsByClassName(this.props.menuId)[0];
    let cTop = container.scrollTop;
    let cBottom = cTop + container.clientHeight;

    //Get element properties
    let eTop = ele.offsetTop;
    let eBottom = eTop + ele.clientHeight;

    //Check if in view
    let isVisible = eTop >= cTop && eBottom <= cBottom;

    //Return outcome
    return isVisible;
  };

  keyDownHandler = (e) => {
    const { open, itemsToRender, selectedItem, command } = this.state;
    const document = Singleton.getDocument();
    if (!open) {
      return;
    }
    switch (e.keyCode) {
      case keycode("enter"):
        e.preventDefault();
        if (itemsToRender.length > 0 && itemsToRender[selectedItem]) {
          this.props.onSelect(itemsToRender[selectedItem].type, command);
          this.props.setPopup(false);
          this.setState({
            command: "",
            ownUpdate: true,
          });
        } else {
          this.props.setPopup(false);
        }

        break;
      case keycode("Backspace"):
        if (!command) {
          this.props.setPopup(false);
        }
        this.setState({
          command: command.substring(0, command.length - 1),
          ownUpdate: true,
        });
        break;
      case keycode("Up"):
        e.preventDefault();
        if (selectedItem == -1) {
          this.setPopup({
            selectedItem: 0,
            ownUpdate: true,
          });
        } else {
          const prevItem =
            selectedItem === 0 ? itemsToRender.length - 1 : selectedItem - 1;
          if (itemsToRender.length > 0) {
            this.setState({ selectedItem: prevItem, ownUpdate: true }, () => {
              if (
                !this.elementInViewport(
                  document.getElementsByClassName(
                    `${this.props.menuId}-selected`
                  )[0]
                ) &&
                open
              ) {
                document
                  .getElementsByClassName(`${this.props.menuId}-selected`)[0]
                  .scrollIntoView({ block: "nearest" });
              }
            });
          }
        }

        break;
      case keycode("Down"):
        e.preventDefault();
        if (selectedItem == -1) {
          this.setState({
            selectedItem: 0,
            ownUpdate: true,
          });
        } else {
          const nextItem =
            selectedItem === itemsToRender.length - 1 ? 0 : selectedItem + 1;
          if (itemsToRender.length > 0) {
            this.setState({ selectedItem: nextItem, ownUpdate: true }, () => {
              if (
                !this.elementInViewport(
                  document.getElementsByClassName(
                    `${this.props.menuId}-selected`
                  )[0]
                ) &&
                open
              ) {
                document
                  .getElementsByClassName(`${this.props.menuId}-selected`)[0]
                  .scrollIntoView({ block: "nearest" });
              }
            });
          }
        }

      case keycode("Alt"):
        e.preventDefault();
        break;
      default:
        if (open) {
          if (this.state.itemsToRender.length == 0 && command.length > 18) {
            this.props.setPopup(false);
            this.setState({
              command: "",
              ownUpdate: true,
            });
          }
        }
        // Only take alphabetical keys
        if (
          e.keyCode != 16 &&
          e.keyCode != 9 &&
          e.keyCode != 20 &&
          e.keyCode != 17 &&
          e.keyCode != 18 &&
          e.keyCode != 13 &&
          e.keyCode != 27 &&
          e.keyCode != 45 &&
          e.keyCode != 33 &&
          e.keyCode != 36 &&
          e.keyCode != 46 &&
          e.keyCode != 35 &&
          e.keyCode != 34 &&
          e.keyCode != 144 &&
          e.keyCode != 44 &&
          e.keyCode != 145 &&
          e.keyCode != 19 &&
          e.keyCode != 112 &&
          e.keyCode != 113 &&
          e.keyCode != 114 &&
          e.keyCode != 115 &&
          e.keyCode != 116 &&
          e.keyCode != 117 &&
          e.keyCode != 118 &&
          e.keyCode != 119 &&
          e.keyCode != 120 &&
          e.keyCode != 121 &&
          e.keyCode != 122 &&
          e.keyCode != 123
        ) {
          this.setState({
            command: this.state.command + e.key,
            ownUpdate: true,
          });
        }
        break;
    }
  };

  getPopupContent = () => {
    const { itemsToRender, selectedItem } = this.state;
    if (itemsToRender.length > 0) {
      return (
        <div
          className="select-menu"
          ref={this.props.innerRef}
          contentEditable={false}
        >
          <div className={`items ${this.props.menuId}`}>
            {itemsToRender.map((item, key) => (
              <div
                className={
                  selectedItem == key
                    ? `menu-item-selected menu-item ${this.props.menuId}-selected`
                    : `menu-item`
                }
                role="button"
                key={key}
                onClick={() => {
                  this.props.onSelect(item.type, "/");
                  this.props.setPopup(false);
                }}
              >
                <img src={item.icon} />
                <div>
                  <p>{item.label}</p>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div className="no-blocks-found-container" ref={this.props.innerRef}>
          <p>No results</p>
        </div>
      );
    }
  };

  render() {
    const x = this.state.position.x;
    const y = this.state.position.y - MENU_HEIGHT;
    const positionAttributes = {
      top: y ? y : 0,
      left: x ? x : 0,
      position: "fixed",
      width: "20px",
      height: "20px",
      pointerEvents: "none",
    };
    const { open } = this.state;
    return (
      <Popover
        content={this.getPopupContent()}
        placement="bottomLeft"
        overlayClassName="no-arrow select-menu-popup"
        visible={open}
        destroyTooltipOnHide={true}
        getPopupContainer={(trigger) => trigger.parentElement}
      >
        <div
          style={positionAttributes}
          className="select-menu-position-handler"
          contentEditable={false}
        ></div>
      </Popover>
    );
  }
}

export default React.forwardRef((props, ref) => (
  <SelectMenu innerRef={ref} {...props} />
));
