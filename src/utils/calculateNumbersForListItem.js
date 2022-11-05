import { Transforms } from "slate";

const calculateNumbersForListItem = (editor) => {
  var blockNodes = Object.assign([], editor.children);

  for (var i = 0; i < blockNodes.length; i++) {
    if (blockNodes[i].type == "ordered-list-item") {
      // Get the current block item
      var currentOrderedListItem = Object.assign({}, blockNodes[i]);

      var previousBlock = undefined;

      if (blockNodes.length > 0) {
        // Get the previous block item
        previousBlock = Object.assign({}, blockNodes[i - 1]);
      }

      // if previous block item is undefined then set the current number to 1
      if (previousBlock != undefined) {
        // If previous block item is also a numbered item
        if (previousBlock.type == "ordered-list-item") {
          // Then set the current number to previous's number + 1
          var previousNumber = previousBlock.orderedItemNumber;
          currentOrderedListItem.orderedItemNumber = previousNumber + 1;

          blockNodes[i] = currentOrderedListItem;
        } else {
          // If previous block item is not numbered then set the current to 1

          currentOrderedListItem.orderedItemNumber = 1;

          blockNodes[i] = currentOrderedListItem;
        }
      } else {
        // if previous block item is undefined then set the current number to 1
        currentOrderedListItem.orderedItemNumber = 1;

        blockNodes[i] = currentOrderedListItem;
      }
    }
  }

  for (var i = 0; i < blockNodes.length; i++) {
    if (blockNodes[i].type == "ordered-list-item") {
      var currentOrderedListItem = Object.assign({}, blockNodes[i]);
      var newProperties = {
        orderedItemNumber: currentOrderedListItem.orderedItemNumber,
      };

      Transforms.setNodes(editor, newProperties, {
        at: [i],
        match: (node, path) => {
          return node.id === currentOrderedListItem.id;
        },
      });
    }
  }
};

export default calculateNumbersForListItem;
