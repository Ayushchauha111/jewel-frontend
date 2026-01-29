import http from "../http-common-password";

class PasswordService {
  
  forgotPassword(email) {
    return http.post(`/forgot-password?email=${encodeURIComponent(email)}`);
  }


  resetPassword(email, newPassword,otp) {
    return http.post(`/reset-password?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}&otp=${encodeURIComponent(otp)}`);
  }

}

export default new PasswordService();