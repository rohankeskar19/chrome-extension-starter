/*global chrome*/
/* src/content.js */
// Content script which will get injected into page

import React from "react";
import ReactDOM from "react-dom";
import Frame, { FrameContextConsumer } from "react-frame-component";

import CommandPalette from "./CommandPalette";

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
          <link
            href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
            rel="stylesheet"
          ></link>,
          <link rel="preconnect" href={"https://fonts.googleapis.com"}></link>,
          <link rel="preconnect" href={"https://fonts.gstatic.com"}></link>,
        ]}
        id="command-palette-frame"
        style={{
          display: "none", // Initially hidden
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "400px",
          border: "none",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          zIndex: "2147483647", // Highest z-index
        }}
      >
        <FrameContextConsumer>
          {({ document, window }) => {
            return (
              <CommandPalette
                iframeDocument={document}
                window={window}
                isExt={true}
                chrome={chrome}
                closeCommandPalette={toggleCommandPalette}
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

// Function to toggle command palette visibility
function toggleCommandPalette() {
  const frame = document.getElementById("command-palette-frame");
  if (frame) {
    const currentDisplay = frame.style.display;
    frame.style.display =
      currentDisplay === "none" || currentDisplay === "" ? "block" : "none";

    if (currentDisplay === "none" || currentDisplay === "") {
      // Focus the command palette input when opened
      setTimeout(() => {
        const input = frame.contentDocument.querySelector("input");
        if (input) input.focus();
      }, 100);
    }
  }
}

// Event listener for Cmd+K (or Ctrl+K)
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault(); // Prevent browser's default behavior
    toggleCommandPalette();
  }

  // Also close on Escape key
  if (e.key === "Escape") {
    const frame = document.getElementById("command-palette-frame");
    if (frame && frame.style.display === "block") {
      frame.style.display = "none";
    }
  }
});
