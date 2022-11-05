const tagValuesToIds = (valueArr, originalArr) => {
  const newArr = [];

  valueArr.forEach((value) => {
    originalArr.forEach((tag) => {
      if (tag.name == value) {
        newArr.push(tag.id);
      }
    });
  });

  return newArr;
};

export default tagValuesToIds;
