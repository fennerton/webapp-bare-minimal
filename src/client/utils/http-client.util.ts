import axios from "axios";
import { useBoundStore } from "../states/bound.store";
import { Endpoint } from "../constants/endpoints.enum";

const httpClient = axios.create({
  withCredentials: true,
  baseURL: "/api",
});

httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const response = error.response;
    let convertedError = error;

    try {
      const userLogout = useBoundStore.getState().userLogout;

      if (response) {
        if (response.status === 401) {
          if (response.config.url !== Endpoint.LOGIN) {
            userLogout("/login");
          }
        } else if (response.status === 402) {
          userLogout("/first-time-login");
        } else if (response.status === 500) {
          convertedError = new Error(response.data);
        }
      }
      return Promise.reject(convertedError);
    } catch (error) {
      return Promise.reject(error);
    }
  },
);

export default httpClient;
