const canShowConvertTo = (blockType) => {
  switch (blockType) {
    case "image":
      return false;
    case "divider":
      return false;
    case "video":
      return false;
    case "table":
      return false;
    case "bookmark":
      return false;
    default:
      return true;
  }
};

export default canShowConvertTo;
