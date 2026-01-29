import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CustomerNav from './CustomerNav';
import './GoldMine.css';

const MONTHS = 10;
const DISCOUNT_MONTH = 11;

function GoldMine() {
  const [monthlyAmount, setMonthlyAmount] = useState(2000);

  const calc = useMemo(() => {
    const totalPayment = monthlyAmount * MONTHS;
    const discountAmount = monthlyAmount;
    const jewelleryValue = totalPayment + discountAmount;
    const effectiveDiscountPct = ((discountAmount / jewelleryValue) * 100).toFixed(2);
    return {
      totalPayment,
      discountAmount,
      jewelleryValue,
      effectiveDiscountPct,
      early6: Math.round(monthlyAmount * 6 * 0.875),
      early8: Math.round(monthlyAmount * 8 * 0.9375),
    };
  }, [monthlyAmount]);

  const formatCurrency = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div className="customer-page customer-gold-mine">
      <CustomerNav />

      <section className="gold-mine-hero">
        <div className="gold-mine-hero-content">
          <h1>Gold Mine</h1>
          <p className="gold-mine-tagline">10+1 MONTHLY INSTALLMENT PLAN</p>
          <p className="gold-mine-benefit">Pay 10 installments, get 100% off on 11th installment!</p>
          <p className="gold-mine-note">*Redeemable from 6th month.</p>
          <Link to="/gold-mine#calculator" className="gold-mine-cta">CHECK CALCULATOR</Link>
        </div>
      </section>

      <section className="gold-mine-how">
        <h2>How does it work?</h2>
        <p className="gold-mine-subtitle">3 easy steps to purchase the jewellery your heart desires</p>
        <div className="gold-mine-steps">
          <div className="gold-mine-step">
            <div className="gold-mine-step-icon">📅</div>
            <h3>Pay Monthly</h3>
            <p>10 monthly installments with easy payment options</p>
          </div>
          <div className="gold-mine-step">
            <div className="gold-mine-step-icon">🛒</div>
            <h3>Get Special Discounts</h3>
            <p>Pay for 10 months and get 100% off on the 11th!</p>
          </div>
          <div className="gold-mine-step">
            <div className="gold-mine-step-icon">🛍️</div>
            <h3>Happy Shopping!</h3>
            <p>Use the auto-redeemed voucher on the 11th installment and buy at any of our stores or online.</p>
          </div>
        </div>
        <p className="gold-mine-refer">Refer to the calculator below for details.</p>
      </section>

      <section id="calculator" className="gold-mine-calculator">
        <h2>Gold Mine Calculator</h2>
        <p className="gold-mine-calc-subtitle">Slide or enter monthly installment amount</p>
        <div className="gold-mine-calc-input-row">
          <div className="gold-mine-calc-input-wrap">
            <span className="gold-mine-currency">₹</span>
            <input
              type="number"
              min={500}
              max={100000}
              step={500}
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Math.max(500, Math.min(100000, Number(e.target.value) || 500)))}
              className="gold-mine-input"
            />
          </div>
          <button type="button" className="gold-mine-check-btn" onClick={() => {}}>
            CHECK
          </button>
        </div>
        <input
          type="range"
          min={500}
          max={10000}
          step={500}
          value={Math.min(monthlyAmount, 10000)}
          onChange={(e) => setMonthlyAmount(Number(e.target.value))}
          className="gold-mine-slider"
        />

        <div className="gold-mine-calc-results">
          <div className="gold-mine-calc-left">
            <div className="gold-mine-pie-legend">
              <div className="gold-mine-pie-slice gold-mine-pie-pay" style={{ flex: calc.totalPayment }} />
              <div className="gold-mine-pie-slice gold-mine-pie-discount" style={{ flex: calc.discountAmount }} />
            </div>
            <div className="gold-mine-pie-labels">
              <span>You Pay {formatCurrency(calc.totalPayment)}</span>
              <span>100% Discount* {formatCurrency(calc.discountAmount)}</span>
            </div>
          </div>
          <div className="gold-mine-calc-right">
            <div className="gold-mine-result-row gold-mine-result-pay">
              <span>Your total payment</span>
              <strong>{formatCurrency(calc.totalPayment)}</strong>
              <small>Period of {MONTHS} months</small>
            </div>
            <div className="gold-mine-result-row gold-mine-result-discount">
              <span>100% Discount on 11th installment</span>
              <strong>{formatCurrency(calc.discountAmount)}</strong>
              <small>(100% of 1 month installment value)</small>
            </div>
            <div className="gold-mine-result-row gold-mine-result-value">
              <span>Buy any jewellery worth:</span>
              <strong>{formatCurrency(calc.jewelleryValue)}</strong>
              <small>(after 11th month)</small>
            </div>
            <div className="gold-mine-result-row gold-mine-result-effective">
              <span>You effectively pay</span>
              <strong>{formatCurrency(calc.totalPayment)}</strong>
              <span className="gold-mine-effective-badge">{calc.effectiveDiscountPct}% discount!</span>
            </div>
          </div>
        </div>

        <div className="gold-mine-early">
          <h3>Early Redemption</h3>
          <div className="gold-mine-early-options">
            <div className="gold-mine-early-option">
              <span>6th Month</span>
              <strong>{formatCurrency(calc.early6)}</strong>
              <span className="gold-mine-info" title="Approx. value after 6 installments">ⓘ</span>
            </div>
            <div className="gold-mine-early-option">
              <span>8th Month</span>
              <strong>{formatCurrency(calc.early8)}</strong>
              <span className="gold-mine-info" title="Approx. value after 8 installments">ⓘ</span>
            </div>
          </div>
        </div>

        <p className="gold-mine-disclaimer">
          If jewellery is more than {formatCurrency(calc.jewelleryValue)}, you just need to pay the difference amount at the time of purchase.
        </p>
        <p className="gold-mine-note-block">
          <strong>NOTE:</strong> The subscription amount and benefits can be used towards the purchase of either diamond/gemstone studded jewellery or plain gold jewellery.
        </p>
      </section>

      <section className="gold-mine-cta-section">
        <p>Ready to start? Enrol in the Gold Mine 10+1 plan and enjoy 100% savings on your 11th installment.</p>
        <Link to="/" className="gold-mine-enroll-btn">Enroll Now</Link>
      </section>
    </div>
  );
}

export default GoldMine;
