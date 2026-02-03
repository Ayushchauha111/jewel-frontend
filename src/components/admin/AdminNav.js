import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminDashboard.css';

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/stock', label: 'Stock' },
  { to: '/admin/qr-print', label: 'Print QR' },
  { to: '/admin/billing', label: 'Billing' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/credits', label: 'Udhari' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/income-expense', label: 'Income/Expense' },
  { to: '/admin/rates', label: 'Rates (Gold/Silver/Diamond)' },
  { to: '/admin/config', label: 'Config (Category Making)' },
  { to: '/admin/rate-limit', label: 'Rate Limits' },
  { to: '/', label: 'Home' },
];

function AdminNav({ title = 'Jewelry Shop Admin', onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`admin-nav ${menuOpen ? 'admin-nav--open' : ''}`}>
      <div className="admin-nav-inner">
        <div className="admin-nav-brand">
          <h1 className="admin-nav-title">{title}</h1>
          <button
            type="button"
            className="admin-nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className="admin-nav-hamburger-bar" />
            <span className="admin-nav-hamburger-bar" />
            <span className="admin-nav-hamburger-bar" />
          </button>
        </div>
        <div className="admin-nav-center" onClick={closeMenu}>
          <div className="nav-links-scroll">
            <div className="nav-links">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={location.pathname === to ? 'nav-link-active' : ''}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="admin-nav-logout">
            <button type="button" onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div
          className="admin-nav-backdrop"
          onClick={closeMenu}
          onKeyDown={(e) => e.key === 'Escape' && closeMenu()}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}
    </nav>
  );
}

export default AdminNav;
