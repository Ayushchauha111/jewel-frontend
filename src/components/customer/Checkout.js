import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../../service/auth.service';
import PaymentService from '../../service/payment.service';
import './CustomerHome.css';

const API_URL = '/api';
const SHIPPING_CHARGE = 10;
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_Ng4zjvXBo18B7Z';

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
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    navigate('/');
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    return subtotal + SHIPPING_CHARGE;
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

      // Create order
      const orderItems = cart.map(item => ({
        itemName: item.articleName,
        quantity: item.quantity || 1,
        unitPrice: parseFloat(item.sellingPrice) || 0,
        totalPrice: (parseFloat(item.sellingPrice) || 0) * (item.quantity || 1)
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

  return (
    <div className="customer-home">
      <nav className="customer-nav">
        <h1>Jewelry Shop</h1>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>

      <div className="featured-section" style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Checkout</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="checkout-summary">
            <h3 style={{ marginBottom: '1.5rem', color: '#131921' }}>Order Summary</h3>
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem 0',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#131921' }}>{item.articleName}</h4>
                    <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>
                      Quantity: {item.quantity} × ₹{item.sellingPrice}
                    </p>
                  </div>
                  <p style={{ fontWeight: 'bold', color: '#131921', fontSize: '1.1rem' }}>
                    ₹{item.sellingPrice * item.quantity}
                  </p>
                </div>
              ))}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666' }}>Subtotal:</span>
                  <span style={{ fontWeight: '600' }}>₹{cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666' }}>Shipping:</span>
                  <span style={{ fontWeight: '600' }}>₹{SHIPPING_CHARGE}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#131921' }}>Total:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#B12704' }}>
                    ₹{calculateTotal()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="checkout-form" style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '2rem', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#131921' }}>Customer Information</h3>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#131921' }}>
                Name *
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#131921' }}>
                Phone *
              </label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#131921' }}>
                Email
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#131921' }}>
                Shipping Address *
              </label>
              <textarea
                value={customerInfo.shippingAddress}
                onChange={(e) => setCustomerInfo({...customerInfo, shippingAddress: e.target.value})}
                rows="4"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>
            <button 
              type="submit" 
              className="cta-button"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Proceed to Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
