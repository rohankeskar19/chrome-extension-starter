var Singleton = (function () {
  var document;

  return {
    getDocument: function () {
      return document;
    },
    setDocument: function (documentParam) {
      document = documentParam;
    },
  };
})();

export default Singleton;
