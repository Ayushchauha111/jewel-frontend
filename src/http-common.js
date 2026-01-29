import axios from "axios";
import { isTokenExpired, clearSessionAndRedirect } from "./utils/tokenValidator";

// Create an Axios instance
const http = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the Bearer token
http.interceptors.request.use(
  (config) => {
    // Retrieve the user from localStorage
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
          // Token expired - clear session and redirect
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
    // If response.data is a string, try to parse it as JSON
    if (typeof response.data === 'string') {
      try {
        response.data = JSON.parse(response.data);
      } catch (e) {
        // If parsing fails, keep original string
        console.warn('Failed to parse response as JSON:', e);
      }
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        // No user in storage, redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const user = JSON.parse(userStr);
        const requestUrl = error.config?.url || '';
        
        // Only skip logout for actual auth endpoints (signin, signup, google auth)
        // If a logged-in user gets 401 on any other endpoint, their token is invalid - logout
        const authEndpoints = ['/auth/signin', '/auth/signup', '/auth/google'];
        const isAuthEndpoint = authEndpoints.some(ep => requestUrl.includes(ep));
      
        // If user is logged in and it's NOT an auth endpoint, clear session and redirect to login
        if (user && !isAuthEndpoint) {
          clearSessionAndRedirect();
        } else if (!user) {
          // No user found, redirect to login
          window.location.href = '/login';
        }
      } catch (parseError) {
        console.error('Error parsing user from localStorage:', parseError);
        localStorage.removeItem("user");
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default http;