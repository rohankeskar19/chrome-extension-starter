import defaultColors from "../constants/defaultcolors.json";
const colorSet = defaultColors;

const getFolderColor = () => {
  const random = Math.floor(Math.random() * colorSet.length);
  const color = colorSet[random];

  return color;
};

export default getFolderColor;
