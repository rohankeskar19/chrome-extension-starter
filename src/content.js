/*global chrome*/
/* src/content.js */

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
            href={chrome.runtime.getURL("/static/css/content.css")}
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

app.style.display = "none";

ReactDOM.render(<Main />, app);

function removeApp() {
  document.body.removeChild(app);
}
