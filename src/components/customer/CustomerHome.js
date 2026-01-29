import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../../service/auth.service';
import CustomerNav from './CustomerNav';
import './CustomerHome.css';

const API_URL = '/api';

const CATEGORIES = [
  { label: 'Rings', to: '/products?category=Rings', icon: '💍' },
  { label: 'Earrings', to: '/products?category=Earrings', icon: '👂' },
  { label: 'Necklaces', to: '/products?category=Necklace', icon: '📿' },
  { label: 'Bangles', to: '/products?category=Bangle', icon: '⭕' },
  { label: 'Bracelets', to: '/products?category=Bracelet', icon: '⌚' },
  { label: 'Pendants', to: '/products?category=Pendant', icon: '🔮' },
  { label: 'Chains', to: '/products?category=Chain', icon: '⛓️' },
  { label: 'Mangalsutras', to: '/products?category=Mangalsutra', icon: '💫' },
  { label: 'Gold Coins', to: '/products?category=Gold', icon: '🪙' },
  { label: 'All Jewellery', to: '/products', icon: '💎' },
];

function CustomerHome() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchFeaturedProducts();
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.reduce((sum, i) => sum + (i.quantity || 1), 0));
    } catch (_) {}
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/stock?page=0&size=20`);
      const data = response.data?.content ?? (Array.isArray(response.data) ? response.data : []);
      const available = data.filter(s => s.status === 'AVAILABLE' || s.status === null);
      setFeaturedProducts(available.slice(0, 6));
    } catch (error) {
      console.error('Error fetching products:', error);
      setFeaturedProducts([]);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${window.location.protocol}//${window.location.hostname}:8000${url}`;
  };

  return (
    <div className="customer-home">
      <CustomerNav cartCount={cartCount} />

      <section className="hero-section">
        <div className="hero-content">
          <h2>Premium Gold & Silver Jewelry</h2>
          <p>Discover our exquisite collection of handcrafted jewellery</p>
          <div className="hero-buttons">
            <Link to="/live-rates" className="cta-button-secondary">View Live Rates</Link>
            <Link to="/products" className="cta-button">Shop Now</Link>
          </div>
        </div>
      </section>

      <section className="home-categories">
        <h2>Shop by Category</h2>
        <div className="home-categories-grid">
          {CATEGORIES.map(({ label, to, icon }) => (
            <Link key={label} to={to} className="home-category-card">
              <span className="home-category-icon">{icon}</span>
              <span className="home-category-label">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-plan-banners">
        <Link to="/gold-mine" className="home-plan-banner home-plan-gold-mine">
          <div className="home-plan-content">
            <h3>Gold Mine 10+1 Monthly Plan</h3>
            <p>Pay 10 installments & enjoy 100% savings on the 11th month!</p>
            <span className="home-plan-cta">Enroll Now</span>
          </div>
        </Link>
        <Link to="/gold-reserve" className="home-plan-banner home-plan-gold-reserve">
          <div className="home-plan-content">
            <h3>Gold Reserve Plan</h3>
            <p>Pay monthly, receive gold units at live value. Complete 10 installments & get your special benefit voucher.</p>
            <span className="home-plan-cta">Get Started</span>
          </div>
        </Link>
      </section>

      <section className="featured-section">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <div key={product.id} className="product-card" onClick={() => navigate('/products')}>
                {product.imageUrl ? (
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.articleName}
                    className="product-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const ph = e.target.parentElement.querySelector('.product-image-placeholder');
                      if (ph) ph.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="product-image-placeholder"
                  style={{ display: product.imageUrl ? 'none' : 'flex' }}
                >
                  No Image
                </div>
                <div className="product-info">
                  <h3>{product.articleName}</h3>
                  <p className="product-specs">Weight: {product.weightGrams}g | Carat: {product.carat}</p>
                  {product.purityPercentage && <p className="product-specs">Purity: {product.purityPercentage}%</p>}
                  <p className="price">₹{product.sellingPrice}</p>
                  <button className="view-button" onClick={(e) => { e.stopPropagation(); navigate('/products'); }}>
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="home-no-products">No products available at the moment.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default CustomerHome;
