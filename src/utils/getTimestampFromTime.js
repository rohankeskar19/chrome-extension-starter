const getTimestampFromTime = (seconds) => {
  var measuredTime = new Date(null);
  measuredTime.setSeconds(seconds); // specify value of SECONDS
  var MHSTime = measuredTime
    .toISOString()
    .substr(11, 8)
    .trim()
    .replace(" ", "");

  return MHSTime;
};

export default getTimestampFromTime;
