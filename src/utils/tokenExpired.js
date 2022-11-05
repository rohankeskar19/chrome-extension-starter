import parseJwt from "./parseJwt";

const tokenExpired = (token) => {
  const decodedToken = parseJwt(token);

  return Date.now() >= decodedToken.exp * 1000;
};

export default tokenExpired;
