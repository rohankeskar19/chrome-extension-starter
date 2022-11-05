import React, { useState, useEffect } from "react";

import grabIcon from "../../icons/noteeditor/grab-icon.svg";
import bookmarkLinkIcon from "../../icons/noteeditor/bookmark-link-icon.svg";
import Loader from "react-loader-spinner";

import Block from "../../Models/Block";

import { useSelected, useSlateStatic } from "slate-react";
import showSelectedHalo from "../../utils/showSelectedHalo";
import getClassNameForStyling from "../../utils/getClassNameForStyling";

const Bookmark = (props) => {
  const selected = useSelected();

  const editor = useSlateStatic();

  const [state, setState] = useState({
    loading: props.loadingBlocks.includes(props.element.id),
    error: undefined,
  });

  const showSelected = showSelectedHalo(editor, selected, props.element);

  useEffect(() => {
    setState((prevState) => {
      return {
        ...prevState,
        loading: props.loadingBlocks.includes(props.element.id),
      };
    });
  }, [props.blockLoading, props.loadingBlocks]);

  const getBookMarkContent = () => {
    const currentBlock = new Block(props.element);
    const metaData = currentBlock.getMetadata();
    if (metaData && Object.keys(metaData).length > 0) {
      return (
        <div
          contentEditable={false}
          style={{ width: "calc(100% - 20px)", maxWidth: "calc(100% - 20px)" }}
          className={getClassNameForStyling(props)}
        >
          <a
            href={currentBlock.getText()}
            target="_blank"
            className="bookmark bookmark-preview"
          >
            <div className="metadata-info">
              {metaData.title ? (
                <p className="metadata-title">{metaData.title}</p>
              ) : metaData.provider ? (
                <p className="metadata-title">{metaData.provider}</p>
              ) : (
                ""
              )}
              {metaData.description && (
                <p className="metadata-description">{metaData.description}</p>
              )}
              <div
                className="bookmark-preview-footer"
                style={{
                  marginTop:
                    metaData.description || metaData.title || metaData.provider
                      ? "5px"
                      : "0px",
                }}
              >
                {metaData.icon && (
                  <img className="metadata-icon" src={metaData.icon} />
                )}
                {metaData.url && <p className="metadata-url">{metaData.url}</p>}
              </div>
            </div>

            <div
              className="metadata-image"
              style={{
                backgroundImage: metaData.image
                  ? `url(${metaData.image})`
                  : `url(${metaData.icon})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                height: metaData.description ? "108px" : "75px",
              }}
            />
          </a>
        </div>
      );
    } else {
      if (state.loading) {
        return (
          <div
            contentEditable={false}
            className={`bookmark bookmark-loading ${getClassNameForStyling(
              props
            )}`}
            onDrop={(e) => e.preventDefault()}
          >
            <Loader type="Puff" color={"#7E7E7E"} height={25} width={25} />
            <p contentEditable={false} onDrop={(e) => e.preventDefault()}>
              {props.children}
            </p>
          </div>
        );
      } else if (state.error) {
        return (
          <div
            className={`bookmark bookmark-error ${getClassNameForStyling(
              props
            )}`}
            onDrop={(e) => e.preventDefault()}
          >
            <img src={bookmarkLinkIcon} contentEditable={false} />
            <p style={{ color: "#FF7878" }} onDrop={(e) => e.preventDefault()}>
              {props.children}
            </p>
          </div>
        );
      } else if (currentBlock.showLink) {
        return (
          <div
            contentEditable={false}
            style={{ width: "100%", maxWidth: "100%" }}
            onDrop={(e) => e.preventDefault()}
            className={getClassNameForStyling(props)}
          >
            <a
              href={currentBlock.getText()}
              target="_blank"
              className="bookmark bookmark-preview"
            >
              <p
                contentEditable={false}
                style={{
                  display: "none",
                }}
              >
                {props.children}
              </p>
              <div className="metadata-info">
                <p className="metadata-title">{currentBlock.getText()}</p>
              </div>
            </a>
          </div>
        );
      } else {
        return (
          <div className="bookmark bookmark-input">
            <img
              src={bookmarkLinkIcon}
              contentEditable={false}
              style={{ userSelect: "none" }}
            />
            <p
              onDrop={(e) => e.preventDefault()}
              className={getClassNameForStyling(props)}
            >
              {props.children}
            </p>
          </div>
        );
      }
    }
  };

  return (
    <div
      {...props.attributes}
      className="bookmark-block block"
      data-block-id={props.element.id}
    >
      <div className="grab-icon-container" contentEditable={false}>
        <img src={grabIcon} className="grab-icon" />
      </div>
      <div
        className={
          showSelected
            ? "block-selected-halo block-selected"
            : "block-selected-halo"
        }
        contentEditable={false}
      ></div>
      {getBookMarkContent()}
      {props.element.metadata &&
        Object.keys(props.element.metadata).length > 0 && (
          <div
            style={{
              display: "none",
            }}
            contentEditable={false}
          >
            {props.children}
          </div>
        )}
    </div>
  );
};

export default Bookmark;
