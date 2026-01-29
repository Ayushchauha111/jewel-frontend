import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CustomerNav from './CustomerNav';
import './CustomerHome.css';
import './LiveRates.css';

const API_URL = '/api';

function LiveRates() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchRates();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRates = async () => {
    try {
      const response = await axios.get(`${API_URL}/live-rates`);
      setRates(response.data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching live rates:', error);
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    return Math.round(number).toLocaleString('en-IN');
  };

  const formatDecimal = (num, decimals = 2) => {
    if (!num) return '0.00';
    const number = parseFloat(num);
    if (isNaN(number)) return '0.00';
    return number.toFixed(decimals);
  };

  return (
    <div className="live-rates-page">
      <CustomerNav />
      {/* Header */}
      <header className="live-rates-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">
              <svg className="gj-logo" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                {/* Outer ornate decorative white border with 8 outward points */}
                <g stroke="#fff" strokeWidth="3" fill="none">
                  <circle cx="100" cy="100" r="95"/>
                  <circle cx="100" cy="100" r="88"/>
                </g>
                {/* 8 outward-pointing decorative segments */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 45) * Math.PI / 180;
                  const angle1 = (i * 45 - 20) * Math.PI / 180;
                  const angle2 = (i * 45 + 20) * Math.PI / 180;
                  const x1 = 100 + 88 * Math.cos(angle1);
                  const y1 = 100 + 88 * Math.sin(angle1);
                  const x2 = 100 + 100 * Math.cos(angle);
                  const y2 = 100 + 100 * Math.sin(angle);
                  const x3 = 100 + 88 * Math.cos(angle2);
                  const y3 = 100 + 88 * Math.sin(angle2);
                  return (
                    <path key={i} d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`} stroke="#fff" strokeWidth="3" fill="#fff"/>
                  );
                })}
                {/* Inner golden multi-lobed shape (scalloped circle) */}
                <path d="M 100 30 
                         Q 120 35 135 50 
                         Q 150 65 160 80 
                         Q 170 95 160 110 
                         Q 150 125 135 140 
                         Q 120 155 100 170 
                         Q 80 155 65 140 
                         Q 50 125 40 110 
                         Q 30 95 40 80 
                         Q 50 65 65 50 
                         Q 80 35 100 30 Z" 
                      fill="#d4af37" stroke="#c9a227" strokeWidth="2"/>
                {/* GJ Letters in white, serif font */}
                <text x="100" y="110" fontSize="50" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold" fill="#fff" textAnchor="middle" letterSpacing="3">G</text>
                <text x="100" y="140" fontSize="50" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold" fill="#fff" textAnchor="middle" letterSpacing="3">J</text>
              </svg>
            </div>
            <div className="company-name">
              <h1>GANGA JEWELLERS</h1>
            </div>
          </div>
          <div className="contact-section">
            <div className="contact-label">CONTACT NUMBER</div>
            <div className="contact-numbers">
              <div>Gold - 8077256922</div>
              <div>Silver - 7451849816</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="live-rates-nav">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <span className="active">Live Rate</span>
        <Link to="/login">Login</Link>
      </nav>

      {/* GST Banner */}
      <div className="gst-banner">
        GST AS PER GOVERNMENT NORMS APPLICABLE. WE DO NOT SELL BULLION. RATES CUTS ONLY/-
      </div>

      {/* Special Message Banner */}
      <div className="special-message-banner">
        <div className="message-content">
          <div className="hindi-message">
            <strong>विशेष ~</strong> आपकी सेवा में, हमने एक नया लिंक जोड़ा है और खुशी से 20k/18K हॉलमार्क ज्वैलरी, 
            सिल्वर ज्वैलरी, पायल, मूर्तियां, बर्तन, सिक्के, एक पूर्ण रेंज और विशाल संग्रह (बहुत उचित कीमतों पर) प्रदान कर रहे हैं। 
            हम हमेशा आपके समर्थन और सहयोग की कामना करते हैं।
          </div>
          <div className="english-message">
            <strong>Working Hours:</strong> 11:30 AM - 08:00 PM | <strong>We Do Not have Any Other Branch.</strong>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="live-rates-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner">⏳</div>
            <p>Loading live rates...</p>
          </div>
        ) : rates ? (
          <div className="rates-layout">
            {/* Left: Product & Sell Rates */}
            <div className="left-section">
              <div className="product-rates-table">
                <table>
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>SELL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Gold 99.50</td>
                      <td className="price-cell sell-price">{formatNumber(rates.product?.gold9950?.sell)}</td>
                    </tr>
                    <tr>
                      <td>Silver 99.99</td>
                      <td className="price-cell sell-price highlight-green">{formatNumber(rates.product?.silver9999?.sell)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: MCX, SPOT, NEXT Tables */}
            <div className="right-section">
              {/* MCX Table */}
              <div className="market-table">
                <div className="table-header">MCX</div>
                <table>
                  <thead>
                    <tr>
                      <th>MCX</th>
                      <th>BID</th>
                      <th>ASK</th>
                      <th>HIGH/LOW</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>GOLD</td>
                      <td className="price-cell highlight-green">{formatNumber(rates.mcx?.gold?.bid)}</td>
                      <td className="price-cell">{formatNumber(rates.mcx?.gold?.ask)}</td>
                      <td className="high-low">{formatNumber(rates.mcx?.gold?.high)} / {formatNumber(rates.mcx?.gold?.low)}</td>
                    </tr>
                    <tr>
                      <td>SILVER</td>
                      <td className="price-cell highlight-green">{formatNumber(rates.mcx?.silver?.bid)}</td>
                      <td className="price-cell">{formatNumber(rates.mcx?.silver?.ask)}</td>
                      <td className="high-low">{formatNumber(rates.mcx?.silver?.high)} / {formatNumber(rates.mcx?.silver?.low)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SPOT Table */}
              <div className="market-table">
                <div className="table-header">SPOT</div>
                <table>
                  <thead>
                    <tr>
                      <th>SPOT</th>
                      <th>BID</th>
                      <th>ASK</th>
                      <th>HIGH/LOW</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>GOLD $</td>
                      <td className="price-cell highlight-green">{formatDecimal(rates.spot?.gold?.bid, 2)}</td>
                      <td className="price-cell highlight-green">{formatDecimal(rates.spot?.gold?.ask, 2)}</td>
                      <td className="high-low">{formatDecimal(rates.spot?.gold?.high, 2)} / {formatDecimal(rates.spot?.gold?.low, 2)}</td>
                    </tr>
                    <tr>
                      <td>SILVER $</td>
                      <td className="price-cell highlight-green">{formatDecimal(rates.spot?.silver?.bid, 2)}</td>
                      <td className="price-cell highlight-red">{formatDecimal(rates.spot?.silver?.ask, 2)}</td>
                      <td className="high-low">{formatDecimal(rates.spot?.silver?.high, 2)} / {formatDecimal(rates.spot?.silver?.low, 2)}</td>
                    </tr>
                    <tr>
                      <td>INR $</td>
                      <td className="price-cell highlight-green">{formatDecimal(rates.spot?.inr?.bid, 2)}</td>
                      <td className="price-cell highlight-green">{formatDecimal(rates.spot?.inr?.ask, 2)}</td>
                      <td className="high-low">{formatDecimal(rates.spot?.inr?.high, 2)} / {formatDecimal(rates.spot?.inr?.low, 2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* NEXT Table */}
              <div className="market-table">
                <div className="table-header">NEXT</div>
                <table>
                  <thead>
                    <tr>
                      <th>NEXT</th>
                      <th>BID</th>
                      <th>ASK</th>
                      <th>HIGH/LOW</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>GOLD NEXT</td>
                      <td className="price-cell highlight-green">{formatNumber(rates.next?.gold?.bid)}</td>
                      <td className="price-cell highlight-green">{formatNumber(rates.next?.gold?.ask)}</td>
                      <td className="high-low">{formatNumber(rates.next?.gold?.high)} / {formatNumber(rates.next?.gold?.low)}</td>
                    </tr>
                    <tr>
                      <td>SILVER NEXT</td>
                      <td className="price-cell highlight-green">{formatNumber(rates.next?.silver?.bid)}</td>
                      <td className="price-cell highlight-green">{formatNumber(rates.next?.silver?.ask)}</td>
                      <td className="high-low">{formatNumber(rates.next?.silver?.high)} / {formatNumber(rates.next?.silver?.low)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="error-state">
            <p>Failed to load live rates. Please try again later.</p>
          </div>
        )}

        {lastUpdated && (
          <div className="last-updated">
            Last Updated: {lastUpdated.toLocaleTimeString('en-IN')}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="live-rates-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <svg className="gj-logo-footer" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                {/* Outer ornate decorative gold border */}
                <g stroke="#d4af37" strokeWidth="3" fill="none">
                  <circle cx="100" cy="100" r="95"/>
                  <circle cx="100" cy="100" r="88"/>
                </g>
                {/* 8 outward-pointing decorative segments */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 45) * Math.PI / 180;
                  const angle1 = (i * 45 - 20) * Math.PI / 180;
                  const angle2 = (i * 45 + 20) * Math.PI / 180;
                  const x1 = 100 + 88 * Math.cos(angle1);
                  const y1 = 100 + 88 * Math.sin(angle1);
                  const x2 = 100 + 100 * Math.cos(angle);
                  const y2 = 100 + 100 * Math.sin(angle);
                  const x3 = 100 + 88 * Math.cos(angle2);
                  const y3 = 100 + 88 * Math.sin(angle2);
                  return (
                    <path key={i} d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`} stroke="#d4af37" strokeWidth="3" fill="#d4af37"/>
                  );
                })}
                {/* Inner golden multi-lobed shape */}
                <path d="M 100 30 
                         Q 120 35 135 50 
                         Q 150 65 160 80 
                         Q 170 95 160 110 
                         Q 150 125 135 140 
                         Q 120 155 100 170 
                         Q 80 155 65 140 
                         Q 50 125 40 110 
                         Q 30 95 40 80 
                         Q 50 65 65 50 
                         Q 80 35 100 30 Z" 
                      fill="#d4af37" stroke="#c9a227" strokeWidth="2"/>
                {/* GJ Letters */}
                <text x="100" y="110" fontSize="50" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold" fill="#fff" textAnchor="middle" letterSpacing="3">G</text>
                <text x="100" y="140" fontSize="50" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold" fill="#fff" textAnchor="middle" letterSpacing="3">J</text>
              </svg>
              <div className="footer-logo-text">
                <div className="footer-company-name">GANGA</div>
                <div className="footer-company-subtitle">JEWELLERS</div>
              </div>
            </div>
            <div className="footer-about">
              <h4>About Company</h4>
            </div>
          </div>

          <div className="footer-section">
            <h4>MENU</h4>
            <ul>
              <li><Link to="/">About</Link></li>
              <li><Link to="/live-rates">Live Rate</Link></li>
              <li><Link to="/products">Coins Rates</Link></li>
              <li><Link to="/products">Update</Link></li>
              <li><Link to="/">Bank Detail</Link></li>
              <li><Link to="/">Calendar</Link></li>
              <li><Link to="/">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>ADDRESS</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>Ganga Jewellers, Sedwada, Homeganj, Etawah, Uttar Pradesh, India - 206001</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <a href="mailto:info@gangajewellers.in">info@gangajewellers.in</a>
              </div>
              <div className="contact-item">
                <span className="contact-icon">💬</span>
                <a href={`https://wa.me/917451849816`} target="_blank" rel="noopener noreferrer">+91 7451849816</a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          ©2024 Ganga Jewellers
        </div>
      </footer>
    </div>
  );
}

export default LiveRates;
