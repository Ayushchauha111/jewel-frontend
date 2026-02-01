import React from 'react';
import { Link } from 'react-router-dom';
import CustomerNav from './CustomerNav';
import './Account.css';

const BANK_DETAILS = {
  bankName: 'CBI',
  accountNo: '3267544220',
  branch: 'Anaj Mandi Etawah Up (206001)',
  ifsc: 'CBIN0281757',
};

function Account() {
  let cartCount = 0;
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartCount = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  } catch (_) {}

  return (
    <div className="account-page">
      <CustomerNav cartCount={cartCount} />
      <main className="account-main">
        <div className="account-container">
          <h1 className="account-title">Bank Account Details</h1>
          <p className="account-subtitle">For payments / transfers to Ganga Jewellers</p>
          <section className="account-card">
            <div className="account-row">
              <span className="account-label">Bank Name</span>
              <span className="account-value">{BANK_DETAILS.bankName}</span>
            </div>
            <div className="account-row">
              <span className="account-label">Account No.</span>
              <span className="account-value account-value--mono">{BANK_DETAILS.accountNo}</span>
            </div>
            <div className="account-row">
              <span className="account-label">Branch</span>
              <span className="account-value">{BANK_DETAILS.branch}</span>
            </div>
            <div className="account-row">
              <span className="account-label">IFSC</span>
              <span className="account-value account-value--mono">{BANK_DETAILS.ifsc}</span>
            </div>
          </section>
          <p className="account-note">Please use the above account details for NEFT, RTGS or IMPS. Mention your name / bill number in the transfer reference.</p>
          <Link to="/" className="account-back">← Back to Home</Link>
        </div>
      </main>
    </div>
  );
}

export default Account;
