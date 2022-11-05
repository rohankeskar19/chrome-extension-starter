const getClassNameForStyling = (props) => {
  var className = "";
  if (props.fontStyle == 2) {
    className += "merriweather ";
  } else if (props.fontStyle == 3) {
    className += "monospace ";
  }

  if (props.textAlignment == 2) {
    className += "text-align-center ";
  } else if (props.textAlignment == 3) {
    className += "text-align-right ";
  }

  if (props.smallText) {
    className += "small-text ";
  }

  className = className.trim();

  return className;
};

export default getClassNameForStyling;
