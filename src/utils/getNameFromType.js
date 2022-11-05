import availableBlocks from "../constants/availableblocks.json";

const getNameFromType = (type) => {
  var name = "";
  availableBlocks.forEach((block) => {
    if (block.type == type) {
      name = block.label;
    }
  });

  return name;
};

export default getNameFromType;
