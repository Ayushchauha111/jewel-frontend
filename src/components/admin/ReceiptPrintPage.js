import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import NormalReceipt from './NormalReceipt';
import GSTReceipt from './GSTReceipt';
import './AdminDashboard.css';
import './NormalReceipt.css';
import './GSTReceipt.css';
import './PriceManagement.css';

const API_URL = '/api';

/**
 * Standalone page to render a receipt by bill ID.
 * Used when opening "Open in new tab" from billing – user can then use the browser's
 * native Print or Share (e.g. Save as PDF) on mobile, avoiding blocked auto-print.
 */
function ReceiptPrintPage() {
  const { billId, type } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!billId) {
      setError('Missing bill ID');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/billing/${billId}`, { headers: getAuthHeaders() });
        if (!cancelled) {
          setBill(res.data);
          setError(null);
        }
      } catch (err) {
        if (cancelled) return;
        if (err?.response?.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        setError(err?.response?.data?.message || 'Failed to load bill');
        setBill(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [billId, navigate]);

  const closePage = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      window.close();
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading receipt…</p>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#c00' }}>{error || 'Bill not found'}</p>
        <button type="button" onClick={closePage}>Close</button>
      </div>
    );
  }

  const isGst = String(type || '').toLowerCase() === 'gst';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '1rem', boxSizing: 'border-box' }}>
      {isGst ? (
        <GSTReceipt
          bill={bill}
          onClose={closePage}
          showPrintButton
        />
      ) : (
        <NormalReceipt
          bill={bill}
          onClose={closePage}
          showPrintButton
        />
      )}
    </div>
  );
}

export default ReceiptPrintPage;
