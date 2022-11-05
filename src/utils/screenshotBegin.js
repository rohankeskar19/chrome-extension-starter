import screenshotVisibleArea from "./screenshotVisibleArea";

const screenshotBegin = (chrome, shared) => {
  // Identify which part of the DOM is "scrolling", and store the previous position
  var scrollNode = document.scrollingElement || document.documentElement;

  if (scrollNode.scrollHeight > 32766) {
    alert(
      "\n\n\nDue to Chrome canvas memory limits, the screenshot will be limited to 32766px height.\n\n\n"
    );
  }

  shared["originalScrollTop"] = scrollNode.scrollTop; // ->[] save user scrollTop
  shared["tab"] = {
    hasVscrollbar: window.innerHeight < scrollNode.scrollHeight,
  };
  scrollNode.scrollTop = 0;
  setTimeout(function () {
    screenshotVisibleArea(chrome, shared);
  }, 100);
};

export default screenshotBegin;
