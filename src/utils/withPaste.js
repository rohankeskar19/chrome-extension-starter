const withPaste = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const clipboardData = data.getData("application/x-slate-fragment");

    insertData(data);
  };

  return editor;
};

export default withPaste;
