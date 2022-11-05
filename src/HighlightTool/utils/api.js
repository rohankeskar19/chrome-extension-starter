import axios from "axios";
import apiUrl from "../../utils/getApiUrl";
import localDb from "./localDb";
import loadAll from "./loadAll";

var api = {
  getHighlights: function () {
    const url = window.location.href;
    return axios.get(`${apiUrl}/highlight?url=${url}`);
  },
  saveHighlight: function (highlight) {
    axios.post(
      `${apiUrl}/highlight/add`,
      {
        highlight: {
          ...highlight,
          favourited: false,
          metadata: {},
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  },
  updateHighlight: function (highlight) {
    axios.put(`${apiUrl}/highlight`, {
      highlight: {
        ...highlight,
        metadata: {},
      },
    });
  },
  deleteHighlight: function (id) {
    axios.delete(`${apiUrl}/highlight/delete/${id}`);
  },
  checkPageExists: function (url) {
    return axios.get(`${apiUrl}/page/getPageFromUrl?url=${url}`);
    // fetch(apiUrl + "/page/getPageFromUrl?url=" + url, {
    //   headers: {
    //     authorization: "Bearer " + refreshToken,
    //     "Content-Type": "application/json",
    //   },
    //   method: "GET",
    // })
    //   .then((res) => {
    //     return res.json();
    //   })
    //   .then((data) => {
    //     cb(data);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  },
};

export default api;
