import $ from "jquery";

const elementFromQuery = (storedQuery) => {
  const re = />textNode:nth-of-type\(([0-9]+)\)$/iu;
  const result = re.exec(storedQuery);

  if (result) {
    // For text nodes, nth-of-type needs to be handled differently (not a valid CSS selector)
    const textNodeIndex = parseInt(result[1], 10);
    storedQuery = storedQuery.replace(re, "");
    const parent = $(storedQuery)[0];

    if (!parent) return undefined;

    return parent.childNodes[textNodeIndex];
  }

  return $(storedQuery)[0];
};

export default elementFromQuery;
