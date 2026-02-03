import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../../service/auth.service';
import PaymentService from '../../service/payment.service';
import CustomerNav from './CustomerNav';
import './CustomerHome.css';
import './Checkout.css';

const API_URL = '/api';
const SHIPPING_CHARGE = 10;
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_Ng4zjvXBo18B7Z';
const MAKING_CHARGES_PER_GM = 1150;
const CGST_RATE = 0.015;  // 1.5%
const SGST_RATE = 0.015;  // 1.5%
const GST_RATE = 0.03;    // 3%

function Checkout() {
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    shippingAddress: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!AuthService.getCurrentUser());
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const normalized = (Array.isArray(parsed) ? parsed : []).map((item) => ({
          ...item,
          makingCharges: item.makingCharges != null ? Number(item.makingCharges) : 0
        }));
        setCart(normalized);
      } catch (_) {
        setCart([]);
      }
    }
  }, []);

  const persistCart = (nextCart) => {
    setCart(nextCart);
    localStorage.setItem('cart', JSON.stringify(nextCart));
  };

  const getLineTotal = (item) => {
    const qty = item.quantity || 1;
    const unit = parseFloat(item.sellingPrice) || 0;
    return unit * qty;
  };

  const removeFromCart = (itemId) => {
    const next = cart.filter((i) => i.id !== itemId);
    persistCart(next);
  };

  const updateQuantity = (itemId, delta) => {
    const next = cart.map((i) => {
      if (i.id !== itemId) return i;
      const qty = Math.max(0, (i.quantity || 1) + delta);
      if (qty <= 0) return null;
      return { ...i, quantity: qty };
    }).filter(Boolean);
    persistCart(next);
  };

  const updateItemField = (itemId, value) => {
    const next = cart.map((i) => {
      if (i.id !== itemId) return i;
      return { ...i, sellingPrice: value === '' ? '' : value };
    });
    persistCart(next);
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    navigate('/');
  };

  const getSubtotal = () => cart.reduce((sum, item) => sum + getLineTotal(item), 0);

  const calculateTotal = () => getSubtotal() + SHIPPING_CHARGE;

  // Tax breakdown from subtotal (prices are inclusive of making + GST)
  const getTaxBreakdown = () => {
    const subtotal = getSubtotal();
    const taxableValue = subtotal / (1 + GST_RATE); // value before 3% GST
    const cgst = taxableValue * CGST_RATE;
    const sgst = taxableValue * SGST_RATE;
    const gstTotal = cgst + sgst;
    return { cgst, sgst, gstTotal };
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create or get customer
      let customer;
      try {
        // URL encode the phone number to handle special characters like +
        const encodedPhone = encodeURIComponent(customerInfo.phone);
        // Use relative URL to ensure proxy works correctly
        const customerRes = await axios.get(`/api/customers/phone/${encodedPhone}`);
        customer = customerRes.data;
      } catch (error) {
        // If customer doesn't exist (404), create new customer
        if (error.response?.status === 404) {
          // Use relative URL to ensure proxy works correctly
          const newCustomerRes = await axios.post(`/api/customers`, {
            name: customerInfo.name,
            phone: customerInfo.phone,
            email: customerInfo.email
          });
          customer = newCustomerRes.data;
        } else {
          throw error; // Re-throw if it's a different error
        }
      }

      // Create order (line total = unitPrice * quantity + makingCharges)
      const orderItems = cart.map(item => ({
        itemName: item.articleName,
        quantity: item.quantity || 1,
        unitPrice: parseFloat(item.sellingPrice) || 0,
        totalPrice: getLineTotal(item)
      }));

      const orderData = {
        customer: { id: customer.id },
        items: orderItems,
        shippingAddress: customerInfo.shippingAddress,
        shippingCharge: SHIPPING_CHARGE
      };

      // Use relative URL to ensure proxy works correctly
      const orderRes = await axios.post(`/api/orders`, orderData);
      const order = orderRes.data;
      const totalAmount = calculateTotal();

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        return;
      }

      // Create Razorpay order
      const paymentOrderRes = await PaymentService.createOrder(totalAmount);
      const razorpayOrder = paymentOrderRes.data; // axios already parses JSON responses

      // Initialize Razorpay checkout
      const options = {
        key: RAZORPAY_KEY,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Jewelry Shop',
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await PaymentService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verifyRes.data === 'Payment successful!') {
                  // Update order payment status - use relative URL
                  await axios.put(`/api/orders/${order.id}/payment`, {
                    status: 'PAID',
                    paymentId: response.razorpay_payment_id
                  });

              // Clear cart
              localStorage.removeItem('cart');
              
              // Redirect to order status
              navigate(`/order/${order.id}`);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Error verifying payment. Please contact support.');
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        theme: {
          color: '#ff9900'
        },
        modal: {
          ondismiss: function() {
            alert('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error creating order:', error);
      let errorMessage = 'An error occurred while creating the order.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(`Error creating order: ${errorMessage}`);
    }
  };

  const cartCount = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);

  if (cart.length === 0) {
    return (
      <div className="customer-home checkout-page">
        <CustomerNav cartCount={0} />
        <div className="checkout-main">
          <div className="checkout-empty">
            <p>Your cart is empty.</p>
            <p><Link to="/products">Continue shopping</Link></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-home checkout-page">
      <CustomerNav cartCount={cartCount} />

      <div className="checkout-main">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-grid">
          <div className="checkout-summary-card">
            <h3>Order Summary</h3>
            <div className="checkout-items">
              {cart.map((item) => (
                <div key={item.id} className="checkout-item-row">
                  <div className="checkout-item-info">
                    <h4 className="checkout-item-name">{item.articleName}</h4>
                    <div className="checkout-item-controls">
                      <label className="checkout-qty-wrap">
                        <span className="checkout-qty-label">Qty</span>
                        <span className="checkout-qty-btns">
                          <button type="button" className="checkout-qty-btn" onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity">−</button>
                          <span className="checkout-qty-value">{item.quantity || 1}</span>
                          <button type="button" className="checkout-qty-btn" onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity">+</button>
                        </span>
                      </label>
                      <label className="checkout-price-wrap">
                        <span className="checkout-price-label">Price (₹)</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="checkout-price-input"
                          value={item.sellingPrice === '' || item.sellingPrice == null ? '' : item.sellingPrice}
                          onChange={(e) => updateItemField(item.id, e.target.value)}
                          placeholder="0"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="checkout-item-right">
                    <span className="checkout-item-total">₹{getLineTotal(item).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <button type="button" className="checkout-item-remove" onClick={() => removeFromCart(item.id)} title="Remove from cart" aria-label="Remove from cart">🗑️ Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="checkout-add-more">
              <Link to="/products" className="checkout-add-more-link">+ Add more items</Link>
            </div>

            <div className="checkout-totals">
              <div className="checkout-totals-row">
                <span className="label">Subtotal (incl. GST)</span>
                <span className="value">₹{getSubtotal().toLocaleString('en-IN')}</span>
              </div>

              {cart.length > 0 && (() => {
                const { cgst, sgst, gstTotal } = getTaxBreakdown();
                return (
                  <div className="checkout-totals-breakdown">
                    <div className="row">
                      <span>CGST (1.5%)</span>
                      <span>₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="row">
                      <span>SGST (1.5%)</span>
                      <span>₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="row">
                      <span>GST (3%)</span>
                      <span>₹{gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="checkout-totals-note">GST is included in the subtotal.</p>
                  </div>
                );
              })()}

              <div className="checkout-totals-row">
                <span className="label">Shipping</span>
                <span className="value">₹{SHIPPING_CHARGE}</span>
              </div>

              <div className="checkout-totals-final">
                <span className="label">Total</span>
                <span className="value">₹{calculateTotal().toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="checkout-form-card">
            <h3>Customer Information</h3>
            <div className="checkout-form-group">
              <label>Name *</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                required
                placeholder="Your full name"
              />
            </div>
            <div className="checkout-form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                required
                placeholder="10-digit mobile number"
              />
            </div>
            <div className="checkout-form-group">
              <label>Email</label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="checkout-form-group">
              <label>Shipping Address *</label>
              <textarea
                value={customerInfo.shippingAddress}
                onChange={(e) => setCustomerInfo({ ...customerInfo, shippingAddress: e.target.value })}
                rows={4}
                required
                placeholder="Full address for delivery"
              />
            </div>
            <button type="submit" className="checkout-submit">
              Proceed to Payment — ₹{calculateTotal().toLocaleString('en-IN')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
