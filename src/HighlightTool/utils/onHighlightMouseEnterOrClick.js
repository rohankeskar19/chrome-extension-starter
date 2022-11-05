import $ from "jquery";
import moveToolbarToHighlight from "./moveToolbarToHighlight";

const onHighlightMouseEnterOrClick = (e) => {
  /* eslint-disable-line no-redeclare */
  const newHighlightEl = e.target;
  const newHighlightId = newHighlightEl.getAttribute("data-highlight-id");

  const highlightToolIframe = $(
    "#notealy-highlight-hover-tool-iframe-container > iframe"
  )[0];

  console.log(highlightToolIframe);

  highlightToolIframe.contentWindow.postMessage(
    JSON.stringify({
      message: "setCurrentHighlight",
      highlightId: newHighlightId,
    }),
    "*",
    []
  );

  // Position (and show) the hover toolbar above the highlight
  moveToolbarToHighlight(newHighlightEl, e.clientX);
};

export default onHighlightMouseEnterOrClick;
