import React, { useState, useEffect, useRef } from "react";
import "./videoplayer.css";

function VideoPlayer({ url, autoPlay, defaultAudioLevel, defaultFullScreen }) {
  const videoPlayerRef = useRef(null);

  return (
    <div className="notealy-video-player">
      <video className="notealy-video-player-html" ref={videoPlayerRef}>
        <source src={url} />
      </video>
      <div className="notealy-video-player-controls"></div>
    </div>
  );
}

export default VideoPlayer;
