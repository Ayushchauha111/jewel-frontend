import http from "../http-common-payment";

class PaymentService {
  createOrder(amount) {
    return http.post("/create-order", { amount });
  }

  verifyPayment(orderId, paymentId, signature) {
    return http.post("/verify-payment", { orderId, paymentId, signature });
  }
}

export default new PaymentService();
