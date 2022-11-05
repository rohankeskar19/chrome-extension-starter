var WindowSingleton = (function () {
  var window;

  return {
    getWindow: function () {
      return window;
    },
    setWindow: function (windowParam) {
      window = windowParam;
    },
  };
})();

export default WindowSingleton;
