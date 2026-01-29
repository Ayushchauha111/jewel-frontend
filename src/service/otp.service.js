import http from "../http-common-otp";

class OtpService {
  

  verifyOtp(email, otp) {
    return http.post(`/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
  }
  
  
}

export default new OtpService();