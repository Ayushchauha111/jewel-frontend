import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../../service/auth.service';
import './CustomerNav.css';

const CUSTOMER_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/gold-mine', label: 'Gold Mine 10+1' },
  { to: '/gold-reserve', label: 'Gold Reserve' },
  { to: '/live-rates', label: 'Live Rates' },
];

function CustomerNav({ cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!AuthService.getCurrentUser();

  const closeMenu = () => setMenuOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    } else {
      navigate('/products');
    }
    closeMenu();
  };

  const handleLogout = () => {
    AuthService.logout();
    closeMenu();
    window.location.href = '/';
  };

  return (
    <>
      <header className="customer-header">
        <div className="customer-header-top">
          <Link to="/" className="customer-logo" onClick={closeMenu}>
            <span className="customer-logo-icon">💎</span>
            <span className="customer-logo-text">Jewell</span>
          </Link>

          <form className="customer-search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search for jewellery"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="customer-search-input"
              aria-label="Search"
            />
            <button type="submit" className="customer-search-btn" aria-label="Search">
              🔍
            </button>
          </form>

          <div className="customer-header-actions">
            {isLoggedIn ? (
              <button type="button" onClick={handleLogout} className="customer-header-link customer-logout">
                Logout
              </button>
            ) : (
              <Link to="/login" className="customer-header-link" onClick={closeMenu}>Login</Link>
            )}
            <Link to="/checkout" className="customer-header-link customer-cart" onClick={closeMenu}>
              🛒 Cart {cartCount > 0 && <span className="cart-count">({cartCount})</span>}
            </Link>
            <button
              type="button"
              className="customer-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        <nav className={`customer-nav-bar ${menuOpen ? 'customer-nav-bar--open' : ''}`}>
          {CUSTOMER_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={location.pathname === to ? 'customer-nav-link customer-nav-link--active' : 'customer-nav-link'}
              onClick={closeMenu}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      {menuOpen && (
        <div
          className="customer-nav-backdrop"
          onClick={closeMenu}
          onKeyDown={(e) => e.key === 'Escape' && closeMenu()}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}
    </>
  );
}

export default CustomerNav;
