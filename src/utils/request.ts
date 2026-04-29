

import type { AxiosRequestConfig } from "axios"
import axios from "axios"



const instance = axios.create({
  baseURL: "https://api.peoplecore.tech/api",
  headers: {
    "Content-Type": "application/json"
  }
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== "/login") {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const request = async(config: AxiosRequestConfig) => {
  return instance({
    ...config,
  })
}