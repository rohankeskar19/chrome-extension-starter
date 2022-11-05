import axios from "axios";
import clearTokens from "./chrome/clearTokens";
import updateTokens from "./chrome/updateTokens";
import apiUrl from "./getApiUrl";
import renewToken from "./renewToken";
import tokenExpired from "./tokenExpired";

const setAuthToken = (chrome, authToken, refreshToken, addInterceptor) => {
  axios.defaults.headers.common["authorization"] = `Bearer ${refreshToken}`;

  if (addInterceptor) {
    const interceptor = axios.interceptors.response.use(
      function (response) {
        // Do something with response data

        return response;
      },
      function (error) {
        // Do something with response error
        if (error.response.status == 401) {
          axios.interceptors.response.eject(interceptor);

          const errorResponse = error.response.data;

          if (errorResponse.error == "Token expired") {
            if (tokenExpired(refreshToken)) {
              renewToken(chrome, authToken, refreshToken, (response) => {
                console.log("Response arrived", response);
                setAuthToken(chrome, response.authToken, response.refreshToken);
              });
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }
};

export default setAuthToken;
