import axios from "axios";
import { isTokenExpired, clearSessionAndRedirect } from "./utils/tokenValidator";

const http = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/auth`,
  headers: {
    "Content-type": "application/json"
  }
});

// Add a request interceptor to include the Bearer token
http.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return config;
    }

    try {
      const user = JSON.parse(userStr);
      const token = user?.accessToken || user?.token || localStorage.getItem('token');
      if (token) {
        if (isTokenExpired(token)) {
          clearSessionAndRedirect();
          return Promise.reject(new Error('Token expired'));
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem("user");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 responses
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't logout on /validate endpoint - let the caller handle it
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('/validate')) {
        clearSessionAndRedirect();
      }
    }
    return Promise.reject(error);
  }
);

export default http;