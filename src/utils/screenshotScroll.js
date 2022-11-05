import screenshotEnd from "./screenshotEnd";
import screenshotVisibleArea from "./screenshotVisibleArea";

const screenshotScroll = (chrome, shared) => {
  // Identify which part of the DOM is "scrolling", and store the previous position
  var scrollNode = document.scrollingElement || document.documentElement;
  var scrollTopBeforeScrolling = scrollNode.scrollTop;

  // Scroll down!
  scrollNode.scrollTop += window.innerHeight;

  if (
    scrollNode.scrollTop == scrollTopBeforeScrolling ||
    scrollNode.scrollTop > 32766
  ) {
    // 32766 --> Skia / Chrome Canvas Limitation, see recursiveImageMerge()
    // END ||
    shared.imageDirtyCutAt = scrollTopBeforeScrolling % window.innerHeight;
    scrollNode.scrollTop = shared.originalScrollTop; // <-[] restore user scrollTop
    screenshotEnd(chrome, shared);
  } else {
    // LOOP >>
    // This bounces to the screenshot call before coming back in this function.
    // The delay is due to some weird race conditions.
    setTimeout(function () {
      screenshotVisibleArea(chrome, shared);
    }, 500);
  }
};

export default screenshotScroll;
