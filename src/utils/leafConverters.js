const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
  B: () => ({ bold: true }),
  U: () => ({ underline: true }),
  PRE: () => ({ code: true }),
};

export default TEXT_TAGS;
