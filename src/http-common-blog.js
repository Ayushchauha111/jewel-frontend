import axios from "axios";
import { isTokenExpired, clearSessionAndRedirect } from "./utils/tokenValidator";

const http = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/blog`,
  headers: {
    "Content-Type": "application/json",
  },
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

    // If the user is logged in and has an accessToken, add it to the headers
    if (user && user.accessToken) {
        // Check if token is expired before making request
        if (isTokenExpired(user.accessToken)) {
          clearSessionAndRedirect();
          return Promise.reject(new Error('Token expired'));
        }
      config.headers.Authorization = `Bearer ${user.accessToken}`;
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

// Add a response interceptor to handle token expiration or unauthorized access
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      // Note: Admin endpoints will still get 401, but component can handle it
      clearSessionAndRedirect();
    }
    return Promise.reject(error);
  }
);

export default http;