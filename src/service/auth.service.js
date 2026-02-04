import http from "../http-common-auth";

function getAdminDeviceId() {
  try {
    let id = sessionStorage.getItem("adminDeviceId");
    if (!id) {
      id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      sessionStorage.setItem("adminDeviceId", id);
    }
    return id;
  } catch (_) {
    return "";
  }
}

class AuthService {
  login(username, password) {
    const deviceId = getAdminDeviceId();
    const config = deviceId ? { headers: { "X-Device-Id": deviceId } } : {};
    return http
      .post("signin", { username, password }, config)
      .then(response => {
        const data = response.data;
        // Backend returns token as 'token', but we also support 'accessToken' for compatibility
        const token = data.token || data.accessToken;
        if (token) {
          // Store with accessToken key for compatibility with existing code
          const userData = { ...data, accessToken: token };
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("token", token);
        }

        return data;
      });
  }

  /**
   * Google OAuth Sign-In
   * @param {string} credential - The Google ID token
   */
  googleAuth(credential) {
    return http
      .post("google", { credential })
      .then(response => {
        const data = response.data;
        // Backend returns token as 'token', but we also support 'accessToken' for compatibility
        const token = data.token || data.accessToken;
        if (token) {
          // Store with accessToken key for compatibility with existing code
          const userData = { ...data, accessToken: token };
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("token", token);
        }
        return data;
      });
  }

  logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  register(username, email, password) {
    return http.post("signup", {
      username,
      email,
      password,
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));;
  }

  updateCurrentUserProfile(profileImageUrl) {
    const user = this.getCurrentUser();
    if (user) {
      user.profileImageUrl = profileImageUrl;
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  /**
   * Validate current session token with server
   * Returns true if token is valid, false otherwise
   */
  async validateToken() {
    try {
      const response = await http.get("validate");
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Change password for current user
   * @param {string} currentPassword - Current password for verification
   * @param {string} newPassword - New password to set
   */
  changePassword(currentPassword, newPassword) {
    return http.post(`change-password?currentPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}`);
  }
}

export default new AuthService();