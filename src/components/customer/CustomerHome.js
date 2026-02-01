import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import CustomerNav from './CustomerNav';
import './CustomerHome.css';

const API_URL = '/api';

const CATEGORIES = [
  { label: 'Rings', to: '/products?category=Rings', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300' },
  { label: 'Earrings', to: '/products?category=Earrings', img: (process.env.PUBLIC_URL || '') + '/images/category-earrings.svg' },
  { label: 'Necklaces', to: '/products?category=Necklace', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300' },
  { label: 'Bangles', to: '/products?category=Bangle', img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=300' },
];

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const itemFade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const base = process.env.PUBLIC_URL || '';
const showroomMedia = [
  { type: 'image', src: `${base}/showroom-promo.png`, alt: 'Ganga Jewellers – Hallmark Jewellery Showroom' },
  { type: 'image', src: `${base}/showroom-interior.png`, alt: 'Ganga Jewellers showroom interior' },
  { type: 'image', src: `${base}/${encodeURIComponent('WhatsApp Image 2026-02-01 at 7.01.45 PM.jpeg')}`, alt: 'Ganga Jewellers showroom – modern interior' },
  { type: 'video', src: `${base}/${encodeURIComponent('WhatsApp Video 2026-02-01 at 7.01.42 PM.mp4')}`, alt: 'Showroom experience 1' },
  { type: 'video', src: `${base}/${encodeURIComponent('WhatsApp Video 2026-02-01 at 7.01.44 PM.mp4')}`, alt: 'Showroom experience 2' },
];

function CustomerHome() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchFeaturedProducts();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum, i) => sum + (i.quantity || 1), 0));
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/stock?page=0&size=20`);
      const data = response.data?.content ?? (Array.isArray(response.data) ? response.data : []);
      setFeaturedProducts(data.filter(s => s.status === 'AVAILABLE' || !s.status).slice(0, 4));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className="customer-home">
      <CustomerNav cartCount={cartCount} />

      {/* Hero Section */}
      <section className="hero-section" aria-label="Welcome to GangaJewellers">
        <div className="hero-overlay">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="hero-subtitle"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              NEW ARRIVALS 2026
            </motion.span>
            <h1 className="hero-title">
              The Art of <span>Timeless</span> Elegance
            </h1>
            <motion.p
              className="hero-description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Exquisite handcrafted jewelry that tells your unique story.
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link to="/products" className="btn-primary">Explore Collection</Link>
              <Link to="/live-rates" className="btn-outline">Live Gold Rates</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <motion.div
        className="trust-bar"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
      >
        <span>✓ 100% Certified Jewelry</span>
        <span>✓ Lifetime Exchange</span>
        <span>✓ Free Insured Shipping</span>
        <span>✓ 30-Day Money Back</span>
      </motion.div>

      {/* Showroom Photo & Movie Scroller */}
      <section className="showroom-scroller-wrap" aria-label="Showroom">
        <h2 className="showroom-scroller-title">Our Showroom</h2>
        <div className="showroom-scroller">
          <div className="showroom-scroller-inner">
            <div className="showroom-scroller-track">
              {showroomMedia.map((item, i) => (
                <div key={`a-${i}-${item.src}`} className="showroom-scroller-slide">
                  {item.type === 'video' ? (
                    <video src={item.src} controls loop playsInline muted preload="metadata" className="showroom-slide-video" title={item.alt} />
                  ) : (
                    <img src={item.src} alt={item.alt} loading="lazy" />
                  )}
                </div>
              ))}
            </div>
            <div className="showroom-scroller-track" aria-hidden="true">
              {showroomMedia.map((item, i) => (
                <div key={`b-${i}-${item.src}`} className="showroom-scroller-slide">
                  {item.type === 'video' ? (
                    <video src={item.src} controls loop playsInline muted preload="metadata" className="showroom-slide-video" title={item.alt} />
                  ) : (
                    <img src={item.src} alt="" loading="lazy" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="section-container section-categories">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
        >
          <h2>Shop by Category</h2>
          <Link to="/products" className="view-all">View All →</Link>
        </motion.div>
        <motion.div
          className="category-grid-modern"
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-30px' }}
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div key={cat.label} variants={itemFade} transition={{ duration: 0.4 }}>
              <Link to={cat.to} className="cat-card">
                <div className="cat-img-wrapper">
                  <img
                    src={cat.img}
                    alt={cat.label}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      const wrapper = e.target.closest('.cat-img-wrapper');
                      if (wrapper && !wrapper.querySelector('.cat-img-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'cat-img-fallback';
                        fallback.setAttribute('aria-hidden', 'true');
                        fallback.textContent = cat.label;
                        wrapper.appendChild(fallback);
                      }
                    }}
                  />
                </div>
                <div className="cat-info">
                  <span>{cat.label}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Banner Section - Monthly Plans */}
      <section className="promo-banners">
        <motion.div
          className="promo-card gold-mine"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="promo-text">
            <h4>GOLD MINE PLAN</h4>
            <h2>10 + 1 Monthly Savings</h2>
            <p>Pay 10 installments and we pay the last one for you.</p>
            <Link to="/gold-mine" className="promo-btn">Invest Now</Link>
          </div>
        </motion.div>
        <motion.div
          className="promo-card gold-reserve"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="promo-text">
            <h4>GOLD RESERVE</h4>
            <h2>Hedge Against Price Hikes</h2>
            <p>Lock in gold rates monthly and redeem for jewelry.</p>
            <Link to="/gold-reserve" className="promo-btn">Learn More</Link>
          </div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="section-container section-trending">
        <motion.div
          className="section-header section-header-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h2>Trending Now</h2>
            <p className="section-subtitle">Handpicked favorites for the season</p>
          </div>
        </motion.div>
        <motion.div
          className="luxury-products-grid"
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-30px' }}
        >
          {featuredProducts.map((p, i) => (
            <motion.div
              key={p.id}
              variants={itemFade}
              transition={{ duration: 0.4 }}
              className="luxury-card"
              onClick={() => navigate('/products')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/products')}
              aria-label={`View ${p.articleName}`}
            >
              <div className="luxury-img-container">
                <img
                  src={p.imageUrl || 'https://via.placeholder.com/400x500?text=Premium+Jewelry'}
                  alt={p.articleName}
                  loading="lazy"
                />
                <span className="quick-view">Quick View</span>
              </div>
              <div className="luxury-details">
                <p className="brand-tag">Exquisite Collection</p>
                <h3>{p.articleName}</h3>
                <div className="price-tag">₹{p.sellingPrice?.toLocaleString()}</div>
                <div className="specs">{p.weightGrams}g | {p.carat}K Gold</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

export default CustomerHome;
