import $ from "jquery";

const moveToolbarToHighlight = (highlightEl, cursorX) => {
  const hoverToolEl = $("#notealy-highlight-hover-tool-iframe-container");

  const boundingRect = highlightEl.getBoundingClientRect();
  const toolWidth = 95; // When changing this, also update the width in css #highlighter--hover-tools--container

  const hoverTop = boundingRect.top - 45;
  hoverToolEl.css({ top: hoverTop });

  if (cursorX !== undefined) {
    let hoverLeft = null;
    if (boundingRect.width < toolWidth) {
      // center the toolbar if the highlight is smaller than the toolbar
      hoverLeft = boundingRect.left + boundingRect.width / 2 - toolWidth / 2;
    } else if (cursorX - boundingRect.left < toolWidth / 2) {
      // If the toolbar would overflow the highlight on the left, snap it to the left of the highlight
      hoverLeft = boundingRect.left;
    } else if (boundingRect.right - cursorX < toolWidth / 2) {
      // If the toolbar would overflow the highlight on the right, snap it to the right of the highlight
      hoverLeft = boundingRect.right - toolWidth;
    } else {
      // Else, center the toolbar above the cursor
      hoverLeft = cursorX - toolWidth / 2;
    }

    hoverToolEl.css({ left: hoverLeft });
  }

  hoverToolEl.show();
};

export default moveToolbarToHighlight;
