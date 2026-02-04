import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../admin/AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const navigate = useNavigate();

  const getOrCreateDeviceId = () => {
    try {
      let id = sessionStorage.getItem('adminDeviceId');
      if (!id) {
        id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
        sessionStorage.setItem('adminDeviceId', id);
      }
      return id;
    } catch (_) {
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const deviceId = getOrCreateDeviceId();
      const headers = deviceId ? { 'X-Device-Id': deviceId } : {};
      const response = await axios.post(`${API_URL}/auth/signin`, formData, { headers });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-content" style={{ maxWidth: '400px', margin: '5rem auto' }}>
        <form onSubmit={handleSubmit} className="form-card">
          <h2>Admin Login</h2>
          <div>
            <label>Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="action-btn" style={{ width: '100%' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
