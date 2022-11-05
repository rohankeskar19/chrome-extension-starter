const escapeCSSString = (cssString) => {
  return cssString.replace(/(:)/gu, "\\$1");
};

export default escapeCSSString;
