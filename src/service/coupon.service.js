import http from "../http-common-coupon";

class CouponService {
  // Public methods
  fetchCoupons() {
    return http.get("");
  }

  validateCoupon(code) {
    return http.get(`/validate?code=${encodeURIComponent(code)}`);
  }

  // Admin methods
  getAllCoupons() {
    return http.get("");
  }

  createCoupon(coupon) {
    return http.post("", coupon);
  }

  updateCoupon(id, coupon) {
    return http.put(`/${id}`, coupon);
  }

  deleteCoupon(id) {
    return http.delete(`/${id}`);
  }
}

const couponService = new CouponService();
export default couponService;
