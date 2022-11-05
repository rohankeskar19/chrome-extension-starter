import React from "react";
import "./loader.css";
import Loader from "react-loader-spinner";

function Loading() {
  return (
    <div className="loader-container">
      <Loader type="Puff" color="#fff" height={30} width={30} />
    </div>
  );
}

export default Loading;
