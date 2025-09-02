/*global chrome*/
/* src/content.js */
// Content script which will get injected into page

import React from "react";
import ReactDOM from "react-dom";
import Frame, { FrameContextConsumer } from "react-frame-component";
import App from "./App.js";

import "simplebar-react/dist/simplebar.min.css";
import "./tailwind.css";

class Main extends React.Component {
  render() {
    return (
      <Frame
        head={[
          <link
            type="text/css"
            rel="stylesheet"
            href={chrome.runtime.getURL("/static/css/content.css")}
          ></link>,
          <link rel="preconnect" href={"https://fonts.googleapis.com"}></link>,
          <link rel="preconnect" href={"https://fonts.gstatic.com"}></link>,
        ]}
        id="command-palette-frame"
        style={{
          display: "none",
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "400px",
          border: "none",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          zIndex: "2147483647",
        }}
      >
        <FrameContextConsumer>
          {({ document, window }) => {
            return <App iframeDocument={document} window={window} />;
          }}
        </FrameContextConsumer>
      </Frame>
    );
  }
}

const app = document.createElement("div");
app.id = "extension-root";

document.body.appendChild(app);

ReactDOM.render(<Main />, app);
