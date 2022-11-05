import { jsx } from "slate-hyperscript";

const getFragmentsFromBlocks = (blocks) => {
  const fragments = blocks.map((block) => {
    return jsx("fragment", {}, block);
  });

  return fragments;
};

export default getFragmentsFromBlocks;
