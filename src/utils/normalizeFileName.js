const normalizeFileName = (string) => {
  var out = string;
  //out = out.replace(/"/, '\''); // To avoid collision with DOM attribute
  //out = out.replace(/\/\?<>\\:\*\|/, '-'); // Windows safe
  out = out
    .replace(/[^a-zA-Z0-9_\-+,;'!?$£@&%()\[\]=]/g, " ")
    .replace(/ +/g, " "); // Hard replace
  return out;
};
export default normalizeFileName;
