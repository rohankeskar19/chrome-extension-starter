const videoType = (url) => {
  const youtubeRegex =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  const vimeoRegex =
    /^(http\:\/\/|https\:\/\/)?(www\.)?(vimeo\.com\/)([0-9]+)$/;

  const isYoutube = youtubeRegex.test(url);
  const isVimeo = vimeoRegex.test(url);
  if (isYoutube) {
    return "youtube";
  } else if (isVimeo) {
    return "vimeo";
  } else {
    return "regular";
  }
};

export default videoType;
