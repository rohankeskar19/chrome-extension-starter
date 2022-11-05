const deleteBlockAtIndex = (index, blocks) => {
  var updatedBlocks = Object.assign([], blocks);

  updatedBlocks.splice(index, 1);

  return updatedBlocks;
};

export default deleteBlockAtIndex;
