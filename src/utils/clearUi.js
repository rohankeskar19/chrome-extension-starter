const clearUi = () => {
  const app = document.getElementById("notealy-extension-root");
  const modalContainer = document.getElementById(
    "notealy-modal-iframe-container"
  );
  const sideToggle = document.getElementById(
    "notealy-side-toggle-iframe-container"
  );
  const highlightTool = document.getElementById(
    "notealy-highlight-tool-iframe-container"
  );
  const highlightHoverTool = document.getElementById(
    "notealy-highlight-hover-tool-iframe-container"
  );
  const saveButton = document.getElementById("notealy-save-button");
  const addToLibraryBtn = document.getElementById("notealy-addtonote-button");

  document.removeChild(app);
  document.removeChild(modalContainer);
  document.removeChild(sideToggle);
  document.removeChild(highlightTool);
  document.removeChild(highlightHoverTool);
  document.removeChild(saveButton);
  document.removeChild(addToLibraryBtn);
};

export default clearUi;
