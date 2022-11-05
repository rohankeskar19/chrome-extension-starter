const withVoid = (editor) => {
  const { isVoid } = editor;

  editor.isVoid = (element) => {
    switch (element.type) {
      case "divider":
        return true;
      case "equation":
        return true;
      case "image":
        return true;
      case "video":
        return true;
      case "tweet":
        return true;
      case "bookmark":
        if (
          (element.metadata && Object.keys(element.metadata).length > 0) ||
          element.showLink
        ) {
          return true;
        } else {
          return isVoid(element);
        }

      default:
        return isVoid(element);
    }
  };

  return editor;
};

export default withVoid;
