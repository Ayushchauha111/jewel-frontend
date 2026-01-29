import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../../service/auth.service';
import './CustomerHome.css';

const API_URL = '/api';

function OrderStatus() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!AuthService.getCurrentUser());
    
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API_URL}/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };
    
    fetchOrder();
  }, [orderId]);

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    navigate('/');
  };

  if (!order) {
    return <div>Loading...</div>;
  }

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

      <div className="featured-section">
        <div className="form-card">
          <h2>Order #{order.orderNumber}</h2>
          <p><strong>Status:</strong> {order.orderStatus}</p>
          <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
          <p><strong>Total Amount:</strong> ₹{order.finalAmount}</p>
          <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
          
          <h3>Order Items</h3>
          {order.items?.map((item, index) => (
            <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
              <p><strong>{item.itemName}</strong></p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ₹{item.totalPrice}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderStatus;
