const isBase64 = (string) => {
  return string.startsWith("data:image/png;base64");
};
export default isBase64;
