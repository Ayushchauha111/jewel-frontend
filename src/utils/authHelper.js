// Helper function to get authentication token
export const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.accessToken || user?.token || localStorage.getItem('token');
  } catch (error) {
    return localStorage.getItem('token');
  }
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
