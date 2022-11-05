import React, { useState, useEffect } from "react";
import "./unsplashitem.css";

function UnsplashItem({ photo, onImageSelected, allLandscape, forImageBlock }) {
  const [state, setState] = useState({
    showOverlay: false,
    allLandscape: allLandscape,
  });

  useEffect(() => {
    setState((prevState) => {
      return {
        ...prevState,
        allLandscape: allLandscape,
      };
    });
  }, [allLandscape]);

  const handleMouseEnter = () => {
    setState((prevState) => {
      return {
        ...prevState,
        showOverlay: true,
      };
    });
  };

  const handleMouseLeave = () => {
    setState((prevState) => {
      return {
        ...prevState,
        showOverlay: true,
      };
    });
  };
  return (
    <div
      className={forImageBlock ? "unsplash-item-image-block" : "unsplash-item"}
    >
      <img
        src={photo.urls.small}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() =>
          onImageSelected(photo.urls.regular, photo.links.download_location)
        }
      />
      <p>
        by{" "}
        <a
          href={`${photo.user.links.html}?utm_source=Notealy&utm_medium=referral`}
          target={"_blank"}
        >
          {photo.user.name}
        </a>
      </p>
    </div>
  );
}

export default UnsplashItem;
