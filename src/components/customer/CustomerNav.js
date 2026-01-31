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
      <header className="nav-bar">
        <div className="nav-bar-inner">
          <Link to="/" className="nav-logo" onClick={closeMenu} aria-label="GangaJewellers Home">
            <img src="/logo-gj.png" alt="" className="nav-logo-img" width="40" height="40" />
            <span className="nav-logo-word">GangaJewellers</span>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            {CUSTOMER_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${location.pathname === to ? 'nav-link--active' : ''}`}
                onClick={closeMenu}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <form className="nav-search" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Search jewellery…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nav-search-input"
                aria-label="Search"
              />
              <button type="submit" className="nav-search-btn" aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            </form>

            {isLoggedIn ? (
              <button type="button" onClick={handleLogout} className="nav-btn nav-btn--text">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="nav-btn nav-btn--text" onClick={closeMenu}>Login</Link>
                <Link to="/register" className="nav-btn nav-btn--primary" onClick={closeMenu}>Sign up</Link>
              </>
            )}

            <Link to="/checkout" className="nav-cart" onClick={closeMenu} aria-label={`Cart, ${cartCount} items`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && <span className="nav-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>

            <button
              type="button"
              className={`nav-burger ${menuOpen ? 'nav-burger--open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`nav-drawer ${menuOpen ? 'nav-drawer--open' : ''}`} aria-hidden={!menuOpen}>
        <div className="nav-drawer-panel">
          <div className="nav-drawer-header">
            <div className="nav-drawer-brand">
              <img src="/logo-gj.png" alt="" className="nav-drawer-logo-img" width="36" height="36" />
              <span className="nav-logo-word">GangaJewellers</span>
            </div>
            <button type="button" className="nav-drawer-close" onClick={closeMenu} aria-label="Close menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <nav className="nav-drawer-links">
            {CUSTOMER_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className={`nav-drawer-link ${location.pathname === to ? 'nav-drawer-link--active' : ''}`} onClick={closeMenu}>
                {label}
              </Link>
            ))}
          </nav>
          {!isLoggedIn && (
            <div className="nav-drawer-auth">
              <Link to="/login" className="nav-drawer-btn" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="nav-drawer-btn nav-drawer-btn--primary" onClick={closeMenu}>Sign up</Link>
            </div>
          )}
          <Link to="/checkout" className="nav-drawer-cart" onClick={closeMenu}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Cart {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
          </Link>
        </div>
        <div className="nav-drawer-backdrop" onClick={closeMenu} aria-hidden="true" />
      </div>
    </>
  );
}

export default CustomerNav;
