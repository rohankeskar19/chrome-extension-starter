const addBlockAtIndex = (index, block, blocks) => {
  var updatedBlocks = Object.assign([], blocks);

  updatedBlocks.splice(index + 1, 0, block);

  return updatedBlocks;
};

export default addBlockAtIndex;
