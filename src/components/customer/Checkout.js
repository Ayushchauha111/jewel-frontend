import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../../service/auth.service';
import PaymentService from '../../service/payment.service';
import CustomerNav from './CustomerNav';
import './CustomerHome.css';
import './Checkout.css';

const API_URL = '/api';
const SHIPPING_CHARGE = 10;
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_Ng4zjvXBo18B7Z';
const CGST_RATE = 0.015;  // 1.5%
const SGST_RATE = 0.015;  // 1.5%
const GST_RATE = 0.03;    // 3%
const FALLBACK_MAKING_PER_GRAM = 1150;

// Item type helpers (cart items have material, weightGrams, carat, diamondCarat from product)
const isGoldItem = (item) =>
  item && (item.weightGrams != null && parseFloat(item.weightGrams) > 0) && (item.carat != null && item.carat > 0) && String(item.material || '').toLowerCase().includes('gold');
const isSilverItem = (item) =>
  item && (item.weightGrams != null && parseFloat(item.weightGrams) > 0) && String(item.material || '').toLowerCase().includes('silver');
const hasDiamond = (item) => item?.diamondCarat != null && parseFloat(item.diamondCarat) > 0;
const hasWeight = (item) => item?.weightGrams != null && parseFloat(item.weightGrams) > 0;

function Checkout() {
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    shippingAddress: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rates, setRates] = useState({
    goldByKarat: {},
    silverPerGram: null,
    diamondPerCarat: null,
    makingPerGram: FALLBACK_MAKING_PER_GRAM
  });
  const [categoryMakingConfigs, setCategoryMakingConfigs] = useState([]);
  const [stockMaxQty, setStockMaxQty] = useState({}); // stock id -> max quantity available
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!AuthService.getCurrentUser());
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const normalized = (Array.isArray(parsed) ? parsed : []).map((item) => ({
          ...item,
          makingCharges: item.makingCharges != null ? Number(item.makingCharges) : 0
        }));
        setCart(normalized);
      } catch (_) {
        setCart([]);
      }
    }
  }, []);

  // Fetch today's rates for breakdown (gold, silver, diamond, making)
  useEffect(() => {
    let cancelled = false;
    const goldCarats = [10, 12, 14, 18, 20, 21, 22, 24];
    axios.get(`${API_URL}/rates/today`).then((res) => {
      if (cancelled || !res.data) return;
      const goldByKarat = {};
      goldCarats.forEach((k) => {
        const v = res.data[`gold${k}K`];
        if (v != null && !isNaN(parseFloat(v))) goldByKarat[k] = parseFloat(v);
      });
      const silverPerGram = res.data.silverPerGram != null && !isNaN(parseFloat(res.data.silverPerGram)) ? parseFloat(res.data.silverPerGram) : null;
      const makingPerGram = res.data.makingChargesPerGram != null && !isNaN(parseFloat(res.data.makingChargesPerGram)) ? parseFloat(res.data.makingChargesPerGram) : FALLBACK_MAKING_PER_GRAM;
      setRates((prev) => ({ ...prev, goldByKarat, silverPerGram, makingPerGram }));
    }).catch(() => {});
    axios.get(`${API_URL}/rates/rate?metal=DIAMOND`).then((res) => {
      if (!cancelled && res.data?.ratePerCarat != null) setRates((prev) => ({ ...prev, diamondPerCarat: parseFloat(res.data.ratePerCarat) }));
    }).catch(() => {});
    axios.get(`${API_URL}/config/category-making`).then((res) => {
      if (!cancelled && Array.isArray(res.data)) setCategoryMakingConfigs(res.data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const cartIdsKey = useMemo(() => cart.map((i) => i.id).sort().join(','), [cart]);

  // Fetch current stock quantity for each cart item so we can cap quantity at available stock
  useEffect(() => {
    if (!cart.length) {
      setStockMaxQty({});
      return;
    }
    let cancelled = false;
    const ids = [...new Set(cart.map((i) => i.id))];
    Promise.all(
      ids.map((id) =>
        axios.get(`${API_URL}/stock/${id}`).then((res) => ({ id, quantity: res.data?.quantity != null ? Math.max(0, parseInt(res.data.quantity, 10)) : 0 })).catch(() => ({ id, quantity: 0 }))
      )
    ).then((results) => {
      if (cancelled) return;
      const next = {};
      results.forEach((r) => { next[r.id] = r.quantity; });
      setStockMaxQty(next);
      // Clamp cart: if any item has quantity > available stock, reduce and persist
      const needsClamp = cart.some((i) => (i.quantity || 1) > (next[i.id] ?? 0));
      if (needsClamp) {
        const clamped = cart.map((i) => {
          const maxQty = next[i.id] ?? 0;
          const qty = i.quantity || 1;
          if (maxQty <= 0) return null;
          if (qty <= maxQty) return i;
          return { ...i, quantity: maxQty };
        }).filter(Boolean);
        setCart(clamped);
        localStorage.setItem('cart', JSON.stringify(clamped));
      }
    });
    return () => { cancelled = true; };
  }, [cartIdsKey]); // re-fetch when set of cart item ids changes

  const getMakingPerGramForItem = (item) => {
    const category = (item.category || '').trim();
    const material = (item.material || '').trim();
    if (!category) return rates.makingPerGram;
    const byCatMat = categoryMakingConfigs.find(
      (c) => c.category && c.category.toLowerCase() === category.toLowerCase()
        && c.material && c.material.toLowerCase() === material.toLowerCase()
    );
    if (byCatMat?.makingChargesPerGram != null) return parseFloat(byCatMat.makingChargesPerGram);
    const byCat = categoryMakingConfigs.find(
      (c) => c.category && c.category.toLowerCase() === category.toLowerCase() && !c.material
    );
    if (byCat?.makingChargesPerGram != null) return parseFloat(byCat.makingChargesPerGram);
    return rates.makingPerGram;
  };

  const persistCart = (nextCart) => {
    setCart(nextCart);
    localStorage.setItem('cart', JSON.stringify(nextCart));
  };

  const getLineTotal = (item) => {
    const qty = item.quantity || 1;
    const unit = parseFloat(item.sellingPrice) || 0;
    return unit * qty;
  };

  // Breakdown from rates (gold/silver/diamond) and config (making by category+material)
  const getItemBreakdown = (item) => {
    const qty = item.quantity || 1;
    const w = parseFloat(item.weightGrams) || 0;
    const carat = item.carat != null ? parseInt(item.carat, 10) : null;
    const diamondCarat = item.diamondCarat != null ? parseFloat(item.diamondCarat) : 0;
    const makingPerGram = getMakingPerGramForItem(item);
    let gold = 0, silver = 0, diamond = 0, making = 0;
    if (isGoldItem(item) && w > 0 && carat != null && rates.goldByKarat[carat] != null) {
      gold = Math.round(rates.goldByKarat[carat] * w * 100) / 100;
    }
    if (isSilverItem(item) && w > 0 && rates.silverPerGram != null) {
      silver = Math.round(rates.silverPerGram * w * 100) / 100;
    }
    if (hasDiamond(item) && rates.diamondPerCarat != null) {
      diamond = Math.round(diamondCarat * rates.diamondPerCarat * 100) / 100;
    }
    if (hasWeight(item) && w > 0 && makingPerGram != null) {
      making = Math.round(makingPerGram * w * 100) / 100;
    }
    return { gold, silver, diamond, making, qty };
  };

  const getBreakdownTotals = () => {
    let totalGold = 0, totalSilver = 0, totalDiamond = 0, totalMaking = 0;
    cart.forEach((item) => {
      const b = getItemBreakdown(item);
      totalGold += b.gold * b.qty;
      totalSilver += b.silver * b.qty;
      totalDiamond += b.diamond * b.qty;
      totalMaking += b.making * b.qty;
    });
    return {
      totalGold: Math.round(totalGold * 100) / 100,
      totalSilver: Math.round(totalSilver * 100) / 100,
      totalDiamond: Math.round(totalDiamond * 100) / 100,
      totalMaking: Math.round(totalMaking * 100) / 100
    };
  };

  const formatRs = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const removeFromCart = (itemId) => {
    const next = cart.filter((i) => i.id !== itemId);
    persistCart(next);
  };

  const updateQuantity = (itemId, delta) => {
    const maxQty = stockMaxQty[itemId] != null ? stockMaxQty[itemId] : 999;
    const next = cart.map((i) => {
      if (i.id !== itemId) return i;
      const newQty = (i.quantity || 1) + delta;
      const qty = Math.max(0, Math.min(maxQty, newQty));
      if (qty <= 0) return null;
      return { ...i, quantity: qty };
    }).filter(Boolean);
    persistCart(next);
  };

  const updateItemField = (itemId, value) => {
    const next = cart.map((i) => {
      if (i.id !== itemId) return i;
      return { ...i, sellingPrice: value === '' ? '' : value };
    });
    persistCart(next);
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    navigate('/');
  };

  const getSubtotal = () => cart.reduce((sum, item) => sum + getLineTotal(item), 0);

  const calculateTotal = () => getSubtotal() + SHIPPING_CHARGE;

  // Tax breakdown from subtotal (prices are inclusive of making + GST)
  const getTaxBreakdown = () => {
    const subtotal = getSubtotal();
    const taxableValue = subtotal / (1 + GST_RATE); // value before 3% GST
    const cgst = taxableValue * CGST_RATE;
    const sgst = taxableValue * SGST_RATE;
    const gstTotal = cgst + sgst;
    return { cgst, sgst, gstTotal };
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create or get customer
      let customer;
      try {
        // URL encode the phone number to handle special characters like +
        const encodedPhone = encodeURIComponent(customerInfo.phone);
        // Use relative URL to ensure proxy works correctly
        const customerRes = await axios.get(`/api/customers/phone/${encodedPhone}`);
        customer = customerRes.data;
      } catch (error) {
        // If customer doesn't exist (404), create new customer
        if (error.response?.status === 404) {
          // Use relative URL to ensure proxy works correctly
          const newCustomerRes = await axios.post(`/api/customers`, {
            name: customerInfo.name,
            phone: customerInfo.phone,
            email: customerInfo.email
          });
          customer = newCustomerRes.data;
        } else {
          throw error; // Re-throw if it's a different error
        }
      }

      // Create order (line total = unitPrice * quantity + makingCharges)
      const orderItems = cart.map(item => ({
        itemName: item.articleName,
        quantity: item.quantity || 1,
        unitPrice: parseFloat(item.sellingPrice) || 0,
        totalPrice: getLineTotal(item)
      }));

      const orderData = {
        customer: { id: customer.id },
        items: orderItems,
        shippingAddress: customerInfo.shippingAddress,
        shippingCharge: SHIPPING_CHARGE
      };

      // Use relative URL to ensure proxy works correctly
      const orderRes = await axios.post(`/api/orders`, orderData);
      const order = orderRes.data;
      const totalAmount = calculateTotal();

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        return;
      }

      // Create Razorpay order
      const paymentOrderRes = await PaymentService.createOrder(totalAmount);
      const razorpayOrder = paymentOrderRes.data; // axios already parses JSON responses

      // Initialize Razorpay checkout
      const options = {
        key: RAZORPAY_KEY,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Jewelry Shop',
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await PaymentService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verifyRes.data === 'Payment successful!') {
                  // Update order payment status - use relative URL
                  await axios.put(`/api/orders/${order.id}/payment`, {
                    status: 'PAID',
                    paymentId: response.razorpay_payment_id
                  });

              // Clear cart
              localStorage.removeItem('cart');
              
              // Redirect to order status
              navigate(`/order/${order.id}`);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Error verifying payment. Please contact support.');
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        theme: {
          color: '#ff9900'
        },
        modal: {
          ondismiss: function() {
            alert('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error creating order:', error);
      let errorMessage = 'An error occurred while creating the order.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(`Error creating order: ${errorMessage}`);
    }
  };

  const cartCount = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);

  if (cart.length === 0) {
    return (
      <div className="customer-home checkout-page">
        <CustomerNav cartCount={0} />
        <div className="checkout-main">
          <div className="checkout-empty">
            <p>Your cart is empty.</p>
            <p><Link to="/products">Continue shopping</Link></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-home checkout-page">
      <CustomerNav cartCount={cartCount} />

      <div className="checkout-main">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-grid">
          <div className="checkout-summary-card">
            <h3>Order Summary</h3>
            <div className="checkout-items">
              {cart.map((item) => {
                const b = getItemBreakdown(item);
                const hasBreakdown = b.gold > 0 || b.silver > 0 || b.diamond > 0 || b.making > 0;
                return (
                  <div key={item.id} className="checkout-item-row">
                    <div className="checkout-item-info">
                      <h4 className="checkout-item-name">{item.articleName}</h4>
                      {item.material && (
                        <p className="checkout-item-meta">{item.weightGrams}g{item.carat != null ? ` · ${item.carat}K` : ''}{item.diamondCarat != null ? ` · ${item.diamondCarat} ct D` : ''} · {item.material}</p>
                      )}
                      <div className="checkout-item-controls">
                        <label className="checkout-qty-wrap">
                          <span className="checkout-qty-label">Qty{stockMaxQty[item.id] != null ? ` (max ${stockMaxQty[item.id]})` : ''}</span>
                          <span className="checkout-qty-btns">
                            <button type="button" className="checkout-qty-btn" onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity">−</button>
                            <span className="checkout-qty-value">{item.quantity || 1}</span>
                            <button type="button" className="checkout-qty-btn" onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity" disabled={(item.quantity || 1) >= (stockMaxQty[item.id] ?? 999)}>+</button>
                          </span>
                        </label>
                        <label className="checkout-price-wrap">
                          <span className="checkout-price-label">Price (₹)</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="checkout-price-input"
                            value={item.sellingPrice === '' || item.sellingPrice == null ? '' : item.sellingPrice}
                            onChange={(e) => updateItemField(item.id, e.target.value)}
                            placeholder="0"
                          />
                        </label>
                      </div>
                      {hasBreakdown && (
                        <div className="checkout-item-breakdown">
                          {b.gold > 0 && <span>Gold: {formatRs(b.gold * b.qty)}</span>}
                          {b.silver > 0 && <span>Silver: {formatRs(b.silver * b.qty)}</span>}
                          {b.diamond > 0 && <span>Diamond: {formatRs(b.diamond * b.qty)}</span>}
                          {b.making > 0 && <span>Making: {formatRs(b.making * b.qty)}</span>}
                        </div>
                      )}
                    </div>
                    <div className="checkout-item-right">
                      <span className="checkout-item-total">₹{getLineTotal(item).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      <button type="button" className="checkout-item-remove" onClick={() => removeFromCart(item.id)} title="Remove from cart" aria-label="Remove from cart">🗑️ Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="checkout-add-more">
              <Link to="/products" className="checkout-add-more-link">+ Add more items</Link>
            </div>

            <div className="checkout-totals">
              <div className="checkout-totals-row">
                <span className="label">Subtotal (incl. GST)</span>
                <span className="value">₹{getSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {(() => {
                const { totalGold, totalSilver, totalDiamond, totalMaking } = getBreakdownTotals();
                const showBreakdown = totalGold > 0 || totalSilver > 0 || totalDiamond > 0 || totalMaking > 0;
                if (!showBreakdown) return null;
                return (
                  <div className="checkout-totals-breakdown">
                    <p className="checkout-totals-breakdown-title">Price breakdown (at current rates)</p>
                    {totalGold > 0 && <div className="row"><span>Gold</span><span>{formatRs(totalGold)}</span></div>}
                    {totalSilver > 0 && <div className="row"><span>Silver</span><span>{formatRs(totalSilver)}</span></div>}
                    {totalDiamond > 0 && <div className="row"><span>Diamond</span><span>{formatRs(totalDiamond)}</span></div>}
                    {totalMaking > 0 && <div className="row"><span>Making charges</span><span>{formatRs(totalMaking)}</span></div>}
                  </div>
                );
              })()}

              {cart.length > 0 && (() => {
                const { cgst, sgst, gstTotal } = getTaxBreakdown();
                return (
                  <div className="checkout-totals-breakdown">
                    <div className="row">
                      <span>CGST (1.5%)</span>
                      <span>₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="row">
                      <span>SGST (1.5%)</span>
                      <span>₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="row">
                      <span>GST (3%)</span>
                      <span>₹{gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="checkout-totals-note">GST is included in the subtotal.</p>
                  </div>
                );
              })()}

              <div className="checkout-totals-row">
                <span className="label">Shipping</span>
                <span className="value">₹{SHIPPING_CHARGE}</span>
              </div>

              <div className="checkout-totals-final">
                <span className="label">Total</span>
                <span className="value">₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="checkout-form-card">
            <h3>Customer Information</h3>
            <div className="checkout-form-group">
              <label>Name *</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                required
                placeholder="Your full name"
              />
            </div>
            <div className="checkout-form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                required
                placeholder="10-digit mobile number"
              />
            </div>
            <div className="checkout-form-group">
              <label>Email</label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="checkout-form-group">
              <label>Shipping Address *</label>
              <textarea
                value={customerInfo.shippingAddress}
                onChange={(e) => setCustomerInfo({ ...customerInfo, shippingAddress: e.target.value })}
                rows={4}
                required
                placeholder="Full address for delivery"
              />
            </div>
            <button type="submit" className="checkout-submit">
              Proceed to Payment — ₹{calculateTotal().toLocaleString('en-IN')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
