import React from "react";
import ReactDOM from "react-dom";
import Singleton from "../../utils/getDocument";

const Portal = ({ children }) => {
  const document = Singleton.getDocument();
  return typeof document === "object"
    ? ReactDOM.createPortal(children, document.body)
    : null;
};

export default Portal;
