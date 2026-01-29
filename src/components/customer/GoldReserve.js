import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerNav from './CustomerNav';
import './GoldReserve.css';

function GoldReserve() {
  const [monthlyAmount, setMonthlyAmount] = useState(2000);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: could call API to enrol in plan
    alert('Thank you for your interest in the Gold Reserve Plan! We will contact you at ' + (email || 'your email') + ' with next steps.');
  };

  return (
    <div className="customer-page customer-gold-reserve">
      <CustomerNav />

      <section className="gold-reserve-hero">
        <div className="gold-reserve-hero-left">
          <h1>It's reigning gold.</h1>
          <p className="gold-reserve-tagline">Take shelter here.</p>
        </div>
        <div className="gold-reserve-hero-right">
          <div className="gold-reserve-plan-card">
            <div className="gold-reserve-logo">
              <span className="gold-reserve-logo-icon">GRP</span>
              <span className="gold-reserve-logo-text">GOLD RESERVE PLAN</span>
            </div>
            <p className="gold-reserve-desc">
              Every month you pay, you receive gold units at live value. Complete 10 installments and receive your special benefit voucher.
            </p>
            <p className="gold-reserve-slogan">The smartest monthly gold indulgence plan.</p>
            <form onSubmit={handleSubmit} className="gold-reserve-form">
              <input
                type="number"
                min={500}
                max={100000}
                step={500}
                placeholder="Enter Monthly Amount"
                value={monthlyAmount || ''}
                onChange={(e) => setMonthlyAmount(Number(e.target.value) || '')}
                className="gold-reserve-input"
              />
              <input
                type="email"
                placeholder="Enter Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="gold-reserve-input"
              />
              <button type="submit" className="gold-reserve-cta">GET STARTED</button>
            </form>
            <p className="gold-reserve-tc">*T&C Apply</p>
          </div>
        </div>
      </section>

      <section className="gold-reserve-why">
        <h2>Why Gold Reserve Plan?</h2>
        <div className="gold-reserve-benefits">
          <div className="gold-reserve-benefit">
            <div className="gold-reserve-benefit-icon">💡</div>
            <h3>Plan Ahead</h3>
            <p>Subscribe to plan for your future high value purchases</p>
          </div>
          <div className="gold-reserve-benefit">
            <div className="gold-reserve-benefit-icon">🎈</div>
            <h3>For Special Moments</h3>
            <p>Plan for gifting on special occasions like Birthdays, Weddings etc</p>
          </div>
          <div className="gold-reserve-benefit">
            <div className="gold-reserve-benefit-icon">🛒</div>
            <h3>Special Discounts</h3>
            <p>Pay 10 installments & get 100% discount on the 11th installment</p>
          </div>
        </div>
      </section>

      <section className="gold-reserve-cta-section">
        <p>Start your Gold Reserve journey today. Pay monthly, build gold value, and redeem when you're ready.</p>
        <Link to="/gold-mine" className="gold-reserve-link">Also explore Gold Mine 10+1 Plan →</Link>
      </section>
    </div>
  );
}

export default GoldReserve;
