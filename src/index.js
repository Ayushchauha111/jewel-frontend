import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App";
import { BannerProvider } from "./components/common/BannerContext";
import { clearSessionAndRedirect } from "./utils/tokenValidator";

// Global axios: on 401 (e.g. someone else logged in, token invalid), sign out and redirect to login
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || error.config?.baseURL || '';
      const isAuthEndpoint = /\/auth\/(signin|signup|google)/i.test(url);
      if (!isAuthEndpoint && localStorage.getItem('user')) {
        clearSessionAndRedirect();
      }
    }
    return Promise.reject(error);
  }
);

// Disable console output in production for security
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
}

// StrictMode is disabled so effects run once in development (no duplicate API calls).
// Re-enable for debugging: wrap children in <React.StrictMode>.
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BannerProvider>
    <App />
  </BannerProvider>
);