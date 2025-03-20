/*global chrome*/
/* src/content.js */
// Content script which will get injected into page

import React from "react";
import ReactDOM from "react-dom";
import Frame, { FrameContextConsumer } from "react-frame-component";

import App from "./App";

class Main extends React.Component {
  render() {
    return (
      <Frame
        head={[
          <link
            type="text/css"
            rel="stylesheet"
            href={chrome.runtime.getURL("/static/css/newpage.css")}
          ></link>,
          <link rel="preconnect" href={"https://fonts.googleapis.com"}></link>,
          <link rel="preconnect" href={"https://fonts.gstatic.com"}></link>,
        ]}
      >
        <FrameContextConsumer>
          {({ document, window }) => {
            return (
              <App
                iframeDocument={document}
                window={window}
                isExt={true}
                chrome={chrome}
                removeApp={removeApp}
              />
            );
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

console.log("Inside new page");

function removeApp() {
  document.body.removeChild(app);
}
