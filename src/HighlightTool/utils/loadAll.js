import load from "./load";

const loadAll = (highlights) => {
  /* eslint-disable-line no-redeclare, no-unused-vars */

  if (!highlights) return;
  for (let i = 0; i < highlights.length; i++) {
    load(highlights[i]);
  }
};

export default loadAll;
