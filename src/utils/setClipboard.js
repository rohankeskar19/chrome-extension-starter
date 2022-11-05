const setClipboard = (html, cb, errcb) => {
  var type = "text/html";
  var blob = new Blob([html], { type });
  var data = [new ClipboardItem({ [type]: blob })];

  navigator.clipboard.write(data).then(
    function () {
      cb();
    },
    function () {
      errcb();
    }
  );
};

export default setClipboard;
