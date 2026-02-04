import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import './AdminDashboard.css';

const API_URL = '/api';

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

function formatLastActive(lastUsedAt) {
  if (!lastUsedAt) return '';
  const d = new Date(lastUsedAt);
  const now = new Date();
  const diffMs = now - d;
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffM / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffM < 1) return 'just now';
  if (diffM < 60) return `${diffM} min ago`;
  if (diffH < 24) return `${diffH} hr ago`;
  return `${diffD} day(s) ago`;
}

function AdminNav({ title = 'Jewelry Shop Admin', onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionsData, setSessionsData] = useState(null);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [endingId, setEndingId] = useState(null);
  const sessionsRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0, rectTop: 0, openUp: false });

  const fetchSessions = () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return;
    axios.get(`${API_URL}/auth/sessions`, { headers })
      .then((res) => setSessionsData(res.data))
      .catch(() => setSessionsData(null));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!sessionsOpen) return;
    const handleClickOutside = (e) => {
      const inTrigger = sessionsRef.current && sessionsRef.current.contains(e.target);
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!inTrigger && !inDropdown) setSessionsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sessionsOpen]);

  const recalcDropdownPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownMinHeight = 120;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownMinHeight && rect.top > spaceBelow;
    setDropdownPosition({
      top: rect.bottom,
      right: window.innerWidth - rect.right,
      rectTop: rect.top,
      openUp,
    });
  };

  useEffect(() => {
    if (!sessionsOpen || !triggerRef.current) return;
    recalcDropdownPosition();
    window.addEventListener('scroll', recalcDropdownPosition, true);
    window.addEventListener('resize', recalcDropdownPosition);
    return () => {
      window.removeEventListener('scroll', recalcDropdownPosition, true);
      window.removeEventListener('resize', recalcDropdownPosition);
    };
  }, [sessionsOpen]);

  const handleEndSession = (sessionId) => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return;
    setEndingId(sessionId);
    axios.delete(`${API_URL}/auth/sessions/${sessionId}`, { headers })
      .then(() => {
        const currentId = sessionsData?.currentSessionId;
        if (sessionId === currentId) {
          onLogout();
          return;
        }
        fetchSessions();
      })
      .catch(() => {})
      .finally(() => setEndingId(null));
  };

  const closeMenu = () => setMenuOpen(false);
  const activeSessions = sessionsData?.activeSessions ?? 0;
  const sessions = sessionsData?.sessions ?? [];
  const currentSessionId = sessionsData?.currentSessionId;

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
            {sessionsData != null && activeSessions > 0 && (
              <div className="admin-nav-sessions-wrap" ref={sessionsRef}>
                <button
                  ref={triggerRef}
                  type="button"
                  className="admin-nav-sessions-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!sessionsOpen) recalcDropdownPosition();
                    setSessionsOpen((prev) => !prev);
                  }}
                  title="View and manage active sessions"
                  aria-expanded={sessionsOpen}
                  aria-haspopup="dialog"
                >
                  {activeSessions} active session{activeSessions !== 1 ? 's' : ''}
                </button>
                {sessionsOpen &&
                  createPortal(
                    <div
                      ref={dropdownRef}
                      className={`admin-nav-sessions-dropdown admin-nav-sessions-dropdown--fixed ${dropdownPosition.openUp ? 'admin-nav-sessions-dropdown--open-up' : ''}`}
                      style={{
                        position: 'fixed',
                        top: dropdownPosition.openUp ? undefined : dropdownPosition.top + 4,
                        bottom: dropdownPosition.openUp ? window.innerHeight - dropdownPosition.rectTop + 4 : undefined,
                        right: dropdownPosition.right,
                        left: 'auto',
                        minWidth: 260,
                      }}
                    >
                      <div className="admin-nav-sessions-dropdown-title">Active sessions</div>
                      {sessions.map((s) => (
                        <div key={s.id} className="admin-nav-sessions-row">
                          <span className="admin-nav-sessions-label">
                            {s.id === currentSessionId ? 'This device' : 'Session'} — {formatLastActive(s.lastUsedAt)}
                          </span>
                          <button
                            type="button"
                            className="admin-nav-sessions-end-btn"
                            onClick={() => handleEndSession(s.id)}
                            disabled={endingId === s.id}
                            title={s.id === currentSessionId ? 'End this session (you will be logged out)' : 'End that session'}
                          >
                            {endingId === s.id ? '…' : 'End session'}
                          </button>
                        </div>
                      ))}
                    </div>,
                    document.body
                  )}
              </div>
            )}
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
