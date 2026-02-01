import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CustomerNav from './CustomerNav';
import './LiveRates.css';

// Use backend proxy only (CSP does not allow direct fetch to bcast.gangajewellers.co.in).
const LIVE_RATE_STREAM_PROXY = '/api/live-rates/stream';

/**
 * Parse streaming API response: tab-separated rows
 * Format: ID \t LABEL \t VAL0 \t VAL1 \t VAL2 \t VAL3 ...
 * e.g. 5147	FINE GOLD GST	148000	152547	155374	142793
 * We use the value at index 1 (second numeric column, VAL1) as the main display PRICE for all rows.
 */
function parseLiveRateStreaming(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Try tab-separated or multi-space format
  const lines = trimmed.split(/\r?\n/).filter((line) => line.trim());
  const rows = [];
  for (const line of lines) {
    const cols = line.split(/\t/).length >= 3
      ? line.split(/\t/).map((c) => c.trim()).filter(Boolean)
      : line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
    if (cols.length >= 3) {
      const id = cols[0];
      const label = cols[1];
      const values = cols.slice(2).map((v) => v.replace(/,/g, ''));
      // Main price: value at index 1 (second numeric column) for all, else index 0 or last
      const price = values.length >= 2 ? values[1] : (values.length >= 1 ? values[0] : null);
      if (price != null) rows.push({ id, label, values, price });
    }
  }
  if (rows.length > 0) return { rows, byLabel: Object.fromEntries(rows.map((r) => [r.label, r.price])) };

  // Fallback: try XML
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'text/xml');
    const rates = {};
    doc.querySelectorAll('Rate, rate, Item, item, Row, row').forEach((el) => {
      const name = el.getAttribute('name') || el.getAttribute('Name') || el.querySelector('Name, name')?.textContent?.trim();
      const value = el.getAttribute('value') || el.getAttribute('Value') || el.querySelector('Value, value, Rate, rate')?.textContent?.trim();
      if (name) rates[name] = value;
    });
    doc.querySelectorAll('[Name][Value], [name][value]').forEach((el) => {
      const name = el.getAttribute('Name') || el.getAttribute('name');
      const value = el.getAttribute('Value') || el.getAttribute('value');
      if (name) rates[name] = value;
    });
    if (Object.keys(rates).length > 0) {
      return { rows: Object.entries(rates).map(([label, price]) => ({ id: '', label, values: [price], price })), byLabel: rates };
    }
  } catch (_) {}
  return null;
}

function LiveRates() {
  const [liveRateStreaming, setLiveRateStreaming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const apiHeaders = {
    Accept: 'text/plain, */*; q=0.01',
  };

  const mapBackendRatesToStreaming = (data) => {
    if (!data || !data.mcx) return null;
    const rows = [];
    const byLabel = {};
    if (data.mcx.gold) {
      const ask = data.mcx.gold.ask || data.mcx.gold.bid;
      if (ask) {
        rows.push({ id: 'gold', label: 'GOLD (MCX)', values: [ask], price: ask });
        byLabel['GOLD (MCX)'] = ask;
      }
    }
    if (data.mcx.silver) {
      const ask = data.mcx.silver.ask || data.mcx.silver.bid;
      if (ask) {
        rows.push({ id: 'silver', label: 'SILVER (MCX)', values: [ask], price: ask });
        byLabel['SILVER (MCX)'] = ask;
      }
    }
    if (rows.length === 0) return null;
    return { rows, byLabel };
  };

  const fetchLiveRateStreaming = useCallback(async () => {
    try {
      // 1. Try backend proxy first (same origin – works on prod without CORS)
      const proxyUrl = `${LIVE_RATE_STREAM_PROXY}?_=${Date.now()}`;
      const proxyRes = await fetch(proxyUrl, { method: 'GET', headers: apiHeaders });
      if (proxyRes.ok) {
        const text = await proxyRes.text();
        // If we got HTML (e.g. SPA index.html from wrong proxy/backend), don't use it
        const looksLikeHtml = /^\s*<(!DOCTYPE|html|HTML|\?xml)/i.test(text.trim());
        if (!looksLikeHtml) {
          const parsed = parseLiveRateStreaming(text);
          if (parsed) {
            setLiveRateStreaming(parsed);
            return;
          }
        }
      }
      // 2. Fallback: backend JSON live rates (from DB + currency) so page still shows something
      const jsonRes = await fetch('/api/live-rates', { method: 'GET', headers: apiHeaders });
      if (jsonRes.ok) {
        const json = await jsonRes.json();
        const fallback = mapBackendRatesToStreaming(json);
        if (fallback) setLiveRateStreaming(fallback);
      }
    } catch (e) {
      console.warn('Live rate fetch failed:', e);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setError(null);
    await fetchLiveRateStreaming();
    setLastUpdated(new Date());
    setLoading(false);
  }, [fetchLiveRateStreaming]);

  useEffect(() => {
    if (!loading && !liveRateStreaming) {
      setError('Unable to load live rates. Please try again or check your connection.');
    } else if (liveRateStreaming) {
      setError(null);
    }
  }, [loading, liveRateStreaming]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const formatNumber = (num) => {
    if (num == null || num === '') return '–';
    const n = parseFloat(String(num).replace(/[^0-9.-]/g, ''));
    if (isNaN(n)) return String(num);
    return Math.round(n).toLocaleString('en-IN');
  };

  const hasData = liveRateStreaming != null;
  const streamingRows = liveRateStreaming?.rows || [];
  const highlightRates = liveRateStreaming?.byLabel
    ? {
        'FINE GOLD GST': liveRateStreaming.byLabel['FINE GOLD GST'],
        'GOLD 999': liveRateStreaming.byLabel['GOLD 999'],
        'GOLD 995': liveRateStreaming.byLabel['GOLD 995'],
      }
    : null;

  const isGold = (label) => /gold|gst|995|999|22kt|18kt|14kt|spot/i.test(label || '');
  const isSilver = (label) => /silver/i.test(label || '');

  return (
    <div className="live-rates-page">
      <CustomerNav cartCount={0} />

      <main className="live-rates-main">
        <div className="live-rates-container">
          <div className="live-rates-hero">
            <h1 className="live-rates-hero-title">Live Bullion Rates</h1>
            <p className="live-rates-hero-subtitle">Rates updated every 15 seconds</p>
          </div>

          <div className="live-rates-gst-banner">
            GST AS PER GOVERNMENT NORMS APPLICABLE. WE DO NOT SELL BULLION. RATES CUTS ONLY/-
          </div>

          {loading && !hasData ? (
            <div className="live-rates-loading">
              <div className="live-rates-spinner" />
              <p>Loading live rates…</p>
            </div>
          ) : error ? (
            <div className="live-rates-error">
              <p>{error}</p>
            </div>
          ) : (
            <>
              {streamingRows.length > 0 && (
                <>
                  {highlightRates && (highlightRates['FINE GOLD GST'] || highlightRates['GOLD 999'] || highlightRates['GOLD 995']) && (
                    <div className="live-rates-bullion-bars">
                      {highlightRates['FINE GOLD GST'] != null && (
                        <div className="live-rates-bar live-rates-bar--gold">
                          <span className="live-rates-bar-label">FINE GOLD GST</span>
                          <span className="live-rates-bar-value">{formatNumber(highlightRates['FINE GOLD GST'])}</span>
                          <span className="live-rates-bar-unit">₹/10g</span>
                        </div>
                      )}
                      {highlightRates['GOLD 999'] != null && (
                        <div className="live-rates-bar live-rates-bar--gold">
                          <span className="live-rates-bar-label">GOLD 999</span>
                          <span className="live-rates-bar-value">{formatNumber(highlightRates['GOLD 999'])}</span>
                          <span className="live-rates-bar-unit">₹/10g</span>
                        </div>
                      )}
                      {highlightRates['GOLD 995'] != null && (
                        <div className="live-rates-bar live-rates-bar--gold">
                          <span className="live-rates-bar-label">GOLD 995</span>
                          <span className="live-rates-bar-value">{formatNumber(highlightRates['GOLD 995'])}</span>
                          <span className="live-rates-bar-unit">₹/10g</span>
                        </div>
                      )}
                    </div>
                  )}
                  <section className="live-rates-board">
                    <h2 className="live-rates-board-title">Product & Price</h2>
                    <div className="live-rates-board-body">
                      {streamingRows.map((row) => {
                        const gold = isGold(row.label);
                        const silver = isSilver(row.label);
                        return (
                          <div
                            key={row.id || row.label}
                            className={`live-rates-board-row ${gold ? 'live-rates-board-row--gold' : ''} ${silver ? 'live-rates-board-row--silver' : ''}`}
                          >
                            <span className="live-rates-board-label">{row.label}</span>
                            <span className="live-rates-board-value">{formatNumber(row.price) || row.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {hasData && (
                <div className="live-rates-message-banner">
                  <p className="live-rates-message-hindi">
                    <strong>विशेष ~</strong> आपकी सेवा में, हमने एक नया लिंक जोड़ा है और खुशी से 20k/18K हॉलमार्क ज्वैलरी,
                    सिल्वर ज्वैलरी, पायल, मूर्तियां, बर्तन, सिक्के, एक पूर्ण रेंज और विशाल संग्रह (बहुत उचित कीमतों पर) प्रदान कर रहे हैं।
                  </p>
                  <p className="live-rates-message-english">
                    <strong>Working Hours:</strong> 11:30 AM - 08:00 PM | <strong>We Do Not have Any Other Branch.</strong>
                  </p>
                  <p className="live-rates-contact">
                    <strong>Gold:</strong> 8077256922 &nbsp;|&nbsp; <strong>Silver:</strong> 7451849816
                  </p>
                </div>
              )}
            </>
          )}

          {lastUpdated && (
            <div className="live-rates-ticker">
              <span className="live-rates-ticker-dot" aria-hidden="true" />
              Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
            </div>
          )}
        </div>
      </main>

      <footer className="live-rates-footer">
        <div className="live-rates-footer-inner">
          <div className="live-rates-footer-brand">
            <img src="/logo-gj.png" alt="GangaJewellers" className="live-rates-footer-logo" width="48" height="48" />
            <span className="live-rates-footer-name">GangaJewellers</span>
          </div>
          <div className="live-rates-footer-links">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/live-rates">Live Rate</Link>
            <Link to="/login">Login</Link>
          </div>
          <div className="live-rates-footer-address">
            <span>Ganga Jewellers, Sedwada, Homeganj, Etawah, UP - 206001</span>
            <a href="mailto:info@gangajewellers.in">info@gangajewellers.in</a>
          </div>
        </div>
        <div className="live-rates-footer-copy">©2024 Ganga Jewellers</div>
      </footer>
    </div>
  );
}

export default LiveRates;
