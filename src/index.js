import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BannerProvider } from "./components/common/BannerContext";

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