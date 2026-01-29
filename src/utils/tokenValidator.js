/**
 * Token validation utility
 * Handles JWT token expiration checks and app version validation
 * 
 * IMPORTANT: When deploying breaking changes that affect authentication or API contracts,
 * increment the APP_VERSION below. This will force all logged-in users to logout and
 * re-authenticate, preventing issues with stale tokens or incompatible client state.
 * 
 * Example: Change '1.0.0' to '1.0.1' when deploying breaking changes
 */

// App version - increment this when you deploy breaking changes
const APP_VERSION = '1.0.1';
const VERSION_STORAGE_KEY = 'app_version';
const TOKEN_CHECK_INTERVAL = 2 * 60 * 1000; // Check every 2 minutes - balanced approach

/**
 * Decode JWT token to get expiration time
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // Check if token expires in less than 1 minute (buffer time)
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const bufferTime = 60 * 1000; // 1 minute buffer
  
  return expirationTime - currentTime < bufferTime;
};

/**
 * Check if app version has changed (indicating breaking changes)
 * @returns {boolean} - True if version changed and logout is needed
 */
export const shouldForceLogout = () => {
  const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
  
  if (!storedVersion) {
    // First time - store current version
    localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    return false;
  }
  
  if (storedVersion !== APP_VERSION) {
    // Version changed - force logout
    localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    return true;
  }
  
  return false;
};

/**
 * Validate user session
 * @returns {boolean} - True if session is valid
 */
export const validateSession = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    const user = JSON.parse(userStr);
    if (!user || !user.accessToken) return false;
    
    // Check if token is expired
    if (isTokenExpired(user.accessToken)) {
      return false;
    }
    
    // Check if app version changed
    if (shouldForceLogout()) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
};

/**
 * Clear session and redirect to login
 */
export const clearSessionAndRedirect = () => {
  // Clear user session
  localStorage.removeItem('user');
  // Don't clear app version - we want to keep it for next login
  
  // Always redirect to login (even if already there, it will refresh the page)
  // Use replace to avoid adding to history
  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.replace('/login');
  } else {
    // If already on login/register, just reload to clear any cached state
    window.location.reload();
  }
};

/**
 * Get token check interval
 */
export const getTokenCheckInterval = () => TOKEN_CHECK_INTERVAL;

/**
 * Get app version
 */
export const getAppVersion = () => APP_VERSION;

