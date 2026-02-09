import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoltIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { BoltIcon as BoltIconSolid } from '@heroicons/react/24/solid';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import GSTReceipt from './GSTReceipt';
import NormalReceipt from './NormalReceipt';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

// Fallback making charges per gram (₹/g) when Rates (admin/rates) not loaded
const FALLBACK_MAKING_PER_GRAM = 1150;

// Standard gold purity (%) for buy-back (customer selling gold). API uses carat: carat = (purity/100)*24
const GOLD_PURITY_OPTIONS = [
  { purity: 41.7, label: '41.7% (10K)' },
  { purity: 50, label: '50% (12K)' },
  { purity: 58.3, label: '58.3% (14K)' },
  { purity: 62.5, label: '62.5% (15K)' },
  { purity: 75, label: '75% (18K)' },
  { purity: 83.3, label: '83.3% (20K)' },
  { purity: 87.5, label: '87.5% (21K)' },
  { purity: 91.6, label: '91.6% (22K)' },
  { purity: 99.9, label: '99.9% (24K)' }
];

function BillingManagement() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stock, setStock] = useState([]);
  /** Full stock list (incl. SOLD) for QR lookup only; used to show "already sold" when scanning */
  const [stockAllForLookup, setStockAllForLookup] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ stockId: '', quantity: 1, makingChargesPerGram: '', hallmark: false }],
    discountAmount: 0,
    payments: [{ method: 'CASH', amount: '' }],  // split payment: e.g. cash + UPI
    notes: ''
  });
  // Cache of calculated price from today's gold rate (stockId -> price); used for Gold items when weight+carat present
  const [itemPrices, setItemPrices] = useState({});
  // Per-unit making charges from calculate-price API (stockId -> amount); used so invoice shows Making line and we don't double-count
  const [itemMakingCharges, setItemMakingCharges] = useState({});
  const [pricesLoading, setPricesLoading] = useState(false);
  // Cache of calculated buy-back value (index -> price) when customer sells gold
  const [buyBackPrices, setBuyBackPrices] = useState({});
  // Cache of calculated silver buy-back value (index -> price) when customer sells silver
  const [silverBuyBackPrices, setSilverBuyBackPrices] = useState({});
  // Diamond rate per carat (from Rates) for Gold + Diamond item calculation
  const [diamondRatePerCarat, setDiamondRatePerCarat] = useState(null);
  // Default making charges per gram (₹/g) – used for making = rate × gm (incl. external items with weight)
  const [defaultMakingPerGram, setDefaultMakingPerGram] = useState(null);
  // Today's gold rate per gram by karat (from Admin → Rates), for dropdown display – gold only, no GST
  const [todayGoldRatesByKarat, setTodayGoldRatesByKarat] = useState({});
  // Gold rate per gram per stock (from calculate-price goldRatePerGram), for dropdown – gold only, no GST
  const [itemGoldRatePerGram, setItemGoldRatePerGram] = useState({});
  // Today's silver rate per gram (from Admin → Rates), for dropdown
  const [todaySilverPerGram, setTodaySilverPerGram] = useState(null);
  // Silver rate per gram per stock (from calculate-price-silver), for dropdown
  const [itemSilverRatePerGram, setItemSilverRatePerGram] = useState({});
  const [selectedBill, setSelectedBill] = useState(null);
  const [loadingBill, setLoadingBill] = useState(false);
  const [showGstReceipt, setShowGstReceipt] = useState(false);
  const [showNormalReceipt, setShowNormalReceipt] = useState(false);
  const [showQRAddModal, setShowQRAddModal] = useState(false);
  const [qrAddInput, setQrAddInput] = useState('');
  const [qrScanning, setQrScanning] = useState(false);
  const [qrZoom, setQrZoom] = useState(1);
  const [qrTorchOn, setQrTorchOn] = useState(false);
  const [qrZoomSupported, setQrZoomSupported] = useState(false);
  const [qrTorchSupported, setQrTorchSupported] = useState(false);
  const [pendingScannedCode, setPendingScannedCode] = useState(null);
  const [qrScanFeedback, setQrScanFeedback] = useState(null);
  /** Shown in QR modal when scan fails: { type: 'error', text } e.g. "Item already sold" / "Already in bill" */
  const [qrScanResultMessage, setQrScanResultMessage] = useState(null);
  const qrScannerRef = useRef(null);
  const qrGalleryInputRef = useRef(null);
  const scanGunInputRef = useRef(null);
  const QR_ZOOM_OPTIONS = [1, 2, 5];
  const externalCodeRef = useRef(1);

  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', email: '', address: '', visible: false });
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const isGoldItem = (s) => s && String(s.material || '').toLowerCase() === 'gold' && s.weightGrams && s.carat;
  // Gold + Diamond / Silver + Diamond etc.: has metal weight + carat, can use rate for metal part when sellingPrice not set
  const hasMetalWeightAndCarat = (s) => s && (s.weightGrams != null && s.weightGrams > 0) && (s.carat != null && s.carat > 0);
  const isGoldMetalItem = (s) => s && String(s.material || '').toLowerCase().includes('gold') && hasMetalWeightAndCarat(s);
  const hasMetalWeight = (s) => s && (s.weightGrams != null && parseFloat(s.weightGrams) > 0);
  const isSilverMetalItem = (s) => s && String(s.material || '').toLowerCase().includes('silver') && hasMetalWeight(s);
  const isDiamondItem = (s) => s && String(s.material || '').toLowerCase().includes('diamond');

  const openBillDetail = async (billId) => {
    setLoadingBill(true);
    setSelectedBill(null);
    try {
      const res = await axios.get(`${API_URL}/billing/${billId}`, { headers: getAuthHeaders() });
      setSelectedBill(res.data);
    } catch (err) {
      setError('Failed to load bill details');
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoadingBill(false);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchCustomers();
    fetchStock();
  }, [currentPage, pageSize, searchQuery]);

  // Fetch diamond rate for Gold + Diamond item calculation
  useEffect(() => {
    if (!showForm) return;
    let cancelled = false;
    axios.get(`${API_URL}/rates/rate?metal=DIAMOND`, { headers: getAuthHeaders() })
      .then((res) => {
        if (!cancelled && res.data?.ratePerCarat != null) setDiamondRatePerCarat(parseFloat(res.data.ratePerCarat));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [showForm]);

  // Fetch default making charges per gram (₹/g) from Admin → Rates (same source as /admin/rates)
  useEffect(() => {
    if (!showForm) return;
    let cancelled = false;
    axios.get(`${API_URL}/rates/today`, { headers: getAuthHeaders() })
      .then((res) => {
        if (cancelled || !res.data) return;
        if (res.data.makingChargesPerGram != null) setDefaultMakingPerGram(parseFloat(res.data.makingChargesPerGram));
        if (res.data.silverPerGram != null && !isNaN(parseFloat(res.data.silverPerGram))) setTodaySilverPerGram(parseFloat(res.data.silverPerGram));
        const rates = {};
        [10, 12, 14, 18, 20, 21, 22, 24].forEach(k => {
          const v = res.data[`gold${k}K`];
          if (v != null && !isNaN(parseFloat(v))) rates[k] = parseFloat(v);
        });
        setTodayGoldRatesByKarat(rates);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [showForm]);

  // Pre-fetch calculated prices for Gold, Silver, and Gold+Diamond (metal part) when Create Bill form is opened
  useEffect(() => {
    if (!showForm || !stock.length) return;
    const goldMetalItems = stock.filter(isGoldMetalItem);
    const silverMetalItems = stock.filter(isSilverMetalItem);
    if (goldMetalItems.length === 0 && silverMetalItems.length === 0) return;
    let cancelled = false;
    setPricesLoading(true);
    const goldPromises = goldMetalItems.map(async (s) => {
      const params = new URLSearchParams({ weightGrams: String(s.weightGrams), carat: String(s.carat) });
      if (s.makingChargesPerGram != null && s.makingChargesPerGram > 0) params.set('makingChargesPerGram', String(s.makingChargesPerGram));
      if (s.category) params.set('category', s.category);
      const res = await axios.get(`${API_URL}/stock/calculate-price?${params.toString()}`, { headers: getAuthHeaders() });
      return {
        id: s.id,
        price: res.data?.calculatedPrice,
        makingCharges: res.data?.makingCharges != null ? parseFloat(res.data.makingCharges) : 0,
        goldRatePerGram: res.data?.goldRatePerGram != null ? parseFloat(res.data.goldRatePerGram) : null,
        silverRatePerGram: null
      };
    });
    const silverPromises = silverMetalItems.map(async (s) => {
      const params = new URLSearchParams({ weightGrams: String(s.weightGrams) });
      if (s.makingChargesPerGram != null && s.makingChargesPerGram > 0) params.set('makingChargesPerGram', String(s.makingChargesPerGram));
      if (s.category) params.set('category', s.category);
      const res = await axios.get(`${API_URL}/stock/calculate-price-silver?${params.toString()}`, { headers: getAuthHeaders() });
      return {
        id: s.id,
        price: res.data?.calculatedPrice,
        makingCharges: res.data?.makingCharges != null ? parseFloat(res.data.makingCharges) : 0,
        goldRatePerGram: null,
        silverRatePerGram: res.data?.silverRatePerGram != null ? parseFloat(res.data.silverRatePerGram) : null
      };
    });
    Promise.allSettled([...goldPromises, ...silverPromises]).then((results) => {
      if (cancelled) return;
      const nextPrices = {};
      const nextMaking = {};
      const nextGoldRate = {};
      const nextSilverRate = {};
      let anyFail = false;
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value?.price != null) {
          nextPrices[r.value.id] = parseFloat(r.value.price);
          if (r.value.makingCharges != null) nextMaking[r.value.id] = r.value.makingCharges;
          if (r.value.goldRatePerGram != null) nextGoldRate[r.value.id] = r.value.goldRatePerGram;
          if (r.value.silverRatePerGram != null) nextSilverRate[r.value.id] = r.value.silverRatePerGram;
        } else {
          anyFail = true;
        }
      });
      setItemPrices(prev => ({ ...prev, ...nextPrices }));
      setItemMakingCharges(prev => ({ ...prev, ...nextMaking }));
      setItemGoldRatePerGram(prev => ({ ...prev, ...nextGoldRate }));
      setItemSilverRatePerGram(prev => ({ ...prev, ...nextSilverRate }));
      if (anyFail && Object.keys(nextPrices).length === 0) {
        setError('Set today\'s gold rate in Price Management to calculate item amounts.');
        setTimeout(() => setError(null), 8000);
      }
      setPricesLoading(false);
    });
    return () => { cancelled = true; };
  }, [showForm, stock]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredBills(bills);
    } else {
      filterBills();
    }
  }, [bills, searchQuery]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const fetchBills = async () => {
    try {
      let url = `${API_URL}/billing`;
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('size', pageSize);
      if (searchQuery) params.append('search', searchQuery);
      url += '?' + params.toString();
      const response = await axios.get(url, {
        headers: getAuthHeaders()
      });
      if (response.data.content) {
        const sortedBills = response.data.content.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBills(sortedBills);
        setFilteredBills(sortedBills);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } else {
        const data = Array.isArray(response.data) ? response.data : [];
        const sortedBills = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBills(sortedBills);
        setFilteredBills(sortedBills);
        setTotalPages(0);
        setTotalElements(sortedBills.length);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      setError('Failed to load bills');
    }
  };

  const filterBills = () => {
    if (!searchQuery) {
      setFilteredBills(bills);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = bills.filter(bill => 
      bill.billNumber?.toLowerCase().includes(query) ||
      bill.customer?.name?.toLowerCase().includes(query) ||
      bill.customer?.phone?.toLowerCase().includes(query)
    );
    setFilteredBills(filtered);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(0);
    await fetchBills();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers?page=0&size=500`, {
        headers: getAuthHeaders()
      });
      const data = response.data?.content ?? response.data;
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const createCustomerAndSelect = async () => {
    const name = (newCustomerForm.name || '').trim();
    const phone = (newCustomerForm.phone || '').trim();
    if (!name || !phone) {
      setError('Name and phone are required for new customer.');
      setTimeout(() => setError(null), 4000);
      return;
    }
    setCreatingCustomer(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/customers`, {
        name,
        phone,
        email: (newCustomerForm.email || '').trim() || undefined,
        address: (newCustomerForm.address || '').trim() || undefined
      }, { headers: getAuthHeaders() });
      const saved = res.data;
      await fetchCustomers();
      setFormData(prev => ({ ...prev, customerId: String(saved.id) }));
      setNewCustomerForm({ name: '', phone: '', email: '', address: '', visible: false });
      setSuccess('Customer added and selected.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to add customer.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleScanGunKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const el = e.target;
      const v = (el?.value || '').trim();
      if (v) {
        const added = addItemFromScannedData(v);
        if (el) el.value = '';
        if (added) {
          setSuccess('Item added from scan.');
          setTimeout(() => setSuccess(null), 2000);
        }
      }
    }
  };

  const fetchStock = async () => {
    try {
      const response = await axios.get(`${API_URL}/stock?page=0&size=500`);
      const data = response.data?.content ?? response.data;
      const list = Array.isArray(data) ? data : [];
      setStock(list.filter(s => s.status === 'AVAILABLE'));
      setStockAllForLookup(list); // full list for QR lookup (to detect "already sold")
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newCustomerForm.visible) {
      setError('Please save the new customer first (click "Save & use") or Cancel.');
      setTimeout(() => setError(null), 4000);
      return;
    }
    if (!formData.customerId) {
      setError('Please select a customer.');
      setTimeout(() => setError(null), 4000);
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Validate stock quantity: total ordered per stock must not exceed available
      const qtyByStockId = {};
      for (const item of formData.items) {
        if (item.isBuyBack || !item.stockId) continue;
        const sid = parseInt(item.stockId, 10);
        qtyByStockId[sid] = (qtyByStockId[sid] || 0) + parseInt(item.quantity || 1, 10);
      }
      for (const sid of Object.keys(qtyByStockId)) {
        const s = stock.find(x => x.id === parseInt(sid, 10));
        const available = s?.quantity != null ? parseInt(s.quantity, 10) : 0;
        if (qtyByStockId[sid] > available) {
          setError(`${s?.articleName || 'Item'} (${s?.articleCode || sid}): only ${available} available, but ${qtyByStockId[sid]} requested.`);
          setLoading(false);
          return;
        }
      }

      for (let i = 0; i < formData.items.length; i++) {
        const item = formData.items[i];
        if (item.isExternalItem) {
          const name = (item.itemName || '').trim();
          const up = parseFloat(item.unitPrice);
          if (!name) {
            setError('External item: enter item name.');
            setLoading(false);
            return;
          }
          if (isNaN(up) || up < 0) {
            setError('External item: enter a valid unit price (₹).');
            setLoading(false);
            return;
          }
        }
      }

      const billingItems = formData.items.map((item, index) => {
        if (item.isBuyBack && item.isSilverBuyBack) {
          const price = getBuyBackUnitPrice(item, index);
          const w = parseFloat(item.weightGrams);
          if (!item.weightGrams || w <= 0 || price == null || price <= 0) return null;
          const qty = parseInt(item.quantity || 1, 10);
          return {
            stock: null,
            itemName: `Silver buy-back (${w}g)`,
            weightGrams: w,
            carat: null,
            quantity: qty,
            unitPrice: -price,
            totalPrice: -(price * qty)
          };
        }
        if (item.isBuyBack) {
          const price = getBuyBackUnitPrice(item, index);
          const p = item.purity;
          const purity = (p != null && p !== '' && p !== 'OTHER' && !isNaN(parseFloat(p))) ? parseFloat(p) : null;
          if (!item.weightGrams || purity == null || price == null || price <= 0) return null;
          const qty = parseInt(item.quantity || 1, 10);
          const carat = purityToCarat(purity);
          return {
            stock: null,
            itemName: `Gold buy-back (${purity}%)`,
            weightGrams: parseFloat(item.weightGrams),
            carat: parseFloat(carat.toFixed(2)),
            quantity: qty,
            unitPrice: -price,
            totalPrice: -(price * qty)
          };
        }
        if (item.isExternalItem) {
          const name = (item.itemName || '').trim() || 'External item';
          const qty = parseInt(item.quantity, 10) || 1;
          const up = parseFloat(item.unitPrice) || 0;
          const total = Math.round(qty * up * 100) / 100;
          return {
            stock: null,
            itemName: name,
            articleCode: (item.articleCode || '').trim() || null,
            weightGrams: item.weightGrams != null && item.weightGrams !== '' ? parseFloat(item.weightGrams) : null,
            carat: item.carat != null && item.carat !== '' ? parseFloat(item.carat) : null,
            quantity: qty,
            unitPrice: up,
            totalPrice: total,
            hallmark: !!item.hallmark
          };
        }
        if (!item.stockId) return null;
        const selectedStock = stock.find(s => s.id === parseInt(item.stockId, 10));
        const qty = parseInt(item.quantity, 10);
        const w = selectedStock?.weightGrams;
        const c = selectedStock?.carat;
        const diamondAmt = getDiamondValue(selectedStock) * qty;
        // Use override rate (₹/g) when set; otherwise full price minus making (so invoice shows Making line)
        const unitPrice = getSubtotalUnitValue(item, selectedStock);
        return {
          stock: { id: parseInt(item.stockId, 10) },
          itemName: selectedStock?.articleName || '',
          articleCode: selectedStock?.articleCode || null,
          weightGrams: w != null && w !== '' ? Number(w) : null,
          carat: c != null && c !== '' ? Number(c) : null,
          diamondCarat: selectedStock?.diamondCarat != null ? Number(selectedStock.diamondCarat) : null,
          diamondAmount: diamondAmt > 0 ? Math.round(diamondAmt * 100) / 100 : null,
          quantity: qty,
          unitPrice,
          totalPrice: Math.round(unitPrice * qty * 100) / 100,
          hallmark: !!item.hallmark
        };
      }).filter(Boolean);

      if (billingItems.length === 0) {
        setError('Add at least one item: from stock, external (sold from friend), gold buy-back, or silver buy-back.');
        setLoading(false);
        return;
      }

      const totalDiamondAmount = formData.items.reduce((sum, item, index) => {
        if (item.isBuyBack || !item.stockId) return sum;
        const selectedStock = stock.find(s => s.id === parseInt(item.stockId, 10));
        const qty = parseInt(item.quantity, 10) || 1;
        return sum + (getDiamondValue(selectedStock) * qty);
      }, 0);

      const effectiveMakingChargesSubmit = formData.items.reduce((sum, item, index) => sum + getMakingForItem(item, index), 0);

      const payRows = (formData.payments || []).filter(p => p.amount !== '' && p.amount != null && !isNaN(parseFloat(p.amount)) && parseFloat(p.amount) > 0);
      const totalPaid = payRows.reduce((s, p) => s + parseFloat(p.amount), 0);
      const primaryMethod = payRows.length === 1 ? payRows[0].method : (payRows.length > 1 ? 'MIXED' : (formData.payments?.[0]?.method || 'CASH'));
      const billingData = {
        customer: { id: parseInt(formData.customerId) },
        items: billingItems,
        totalDiamondAmount: totalDiamondAmount > 0 ? Math.round(totalDiamondAmount * 100) / 100 : undefined,
        discountAmount: parseFloat(formData.discountAmount) || 0,
        makingCharges: effectiveMakingChargesSubmit,
        paymentMethod: primaryMethod,
        paidAmount: Math.round(totalPaid * 100) / 100,
        notes: formData.notes
      };
      if (payRows.length > 0) {
        billingData.paymentBreakdown = JSON.stringify(payRows.map(p => ({ method: p.method, amount: parseFloat(p.amount) })));
      }

      await axios.post(`${API_URL}/billing`, billingData, {
        headers: getAuthHeaders()
      });

      setSuccess('Bill created successfully!');
      fetchBills();
      fetchStock();
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error creating bill:', error);
      setError(error.response?.data?.message || 'Failed to create bill');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (billId, receiptType = 'NORMAL') => {
    try {
      const params = new URLSearchParams({ receiptType: receiptType.toUpperCase() });
      await axios.post(`${API_URL}/billing/${billId}/send-email?${params.toString()}`, {}, {
        headers: getAuthHeaders()
      });
      setSuccess(`Bill sent via email (${receiptType === 'GST' ? 'GST invoice' : 'Normal receipt'})!`);
      fetchBills();
      if (selectedBill?.id === billId) openBillDetail(billId);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send email');
      setTimeout(() => setError(null), 5000);
    }
  };

  const sendWhatsApp = async (billId, receiptType = 'NORMAL') => {
    try {
      const params = new URLSearchParams({ receiptType: receiptType.toUpperCase() });
      await axios.post(`${API_URL}/billing/${billId}/send-whatsapp?${params.toString()}`, {}, {
        headers: getAuthHeaders()
      });
      setSuccess(`Bill sent via WhatsApp (${receiptType === 'GST' ? 'GST invoice' : 'Normal receipt'})!`);
      fetchBills();
      if (selectedBill?.id === billId) openBillDetail(billId);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      setError('Failed to send WhatsApp');
      setTimeout(() => setError(null), 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      items: [{ stockId: '', quantity: 1, makingChargesPerGram: '', hallmark: false }],
      discountAmount: 0,
      payments: [{ method: 'CASH', amount: '' }],
      notes: ''
    });
    setItemPrices({});
    setItemMakingCharges({});
    setItemGoldRatePerGram({});
    setBuyBackPrices({});
    setSilverBuyBackPrices({});
    externalCodeRef.current = 1;
    setShowForm(false);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { stockId: '', quantity: 1, overrideRatePerGram: '', makingChargesPerGram: '', hallmark: false }]
    });
  };

  const handleItemRateOverride = (index, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], overrideRatePerGram: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleItemMakingChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], makingChargesPerGram: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleItemHallmarkChange = (index, checked) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], hallmark: !!checked };
    setFormData({ ...formData, items: newItems });
  };

  const addBuyBackItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { isBuyBack: true, isSilverBuyBack: false, weightGrams: '', purity: '', quantity: 1, buyBackRatePerGram: '' }]
    });
  };

  const addSilverBuyBackItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { isBuyBack: true, isSilverBuyBack: true, weightGrams: '', quantity: 1, buyBackRatePerGram: '' }]
    });
  };

  const addPaymentRow = () => {
    setFormData({
      ...formData,
      payments: [...(formData.payments || [{ method: 'CASH', amount: '' }]), { method: 'UPI', amount: '' }]
    });
  };

  const removePaymentRow = (index) => {
    const next = (formData.payments || []).filter((_, i) => i !== index);
    if (next.length === 0) next.push({ method: 'CASH', amount: '' });
    setFormData({ ...formData, payments: next });
  };

  const updatePaymentRow = (index, field, value) => {
    const next = [...(formData.payments || [])];
    if (!next[index]) return;
    next[index] = { ...next[index], [field]: value };
    setFormData({ ...formData, payments: next });
  };

  const addExternalItem = () => {
    const code = `EXT-${externalCodeRef.current}`;
    externalCodeRef.current += 1;
    setFormData({
      ...formData,
      items: [...formData.items, { isExternalItem: true, itemName: '', articleCode: code, quantity: 1, unitPrice: '', weightGrams: '', carat: '', makingChargesPerGram: '', hallmark: false }]
    });
  };

  const handleExternalItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  // Normalize decoded value from camera (decodedText, decodedResult) or manual input (string or object)
  const getDecodedString = (decodedText, decodedResult) => {
    if (typeof decodedText === 'string' && decodedText.trim()) return decodedText.trim();
    if (decodedText && typeof decodedText === 'object' && decodedText !== null) {
      const s = decodedText.decodedText ?? decodedText.rawValue ?? decodedText.text ?? '';
      if (typeof s === 'string' && s.trim()) return s.trim();
    }
    if (decodedResult && typeof decodedResult === 'object') {
      const s = decodedResult.decodedText ?? decodedResult.rawValue ?? decodedResult.text ?? '';
      if (typeof s === 'string' && s.trim()) return s.trim();
    }
    return '';
  };

  // Shared logic: resolve raw string (manual input or scanned QR JSON) to stock and add to bill.
  // Uses stockAllForLookup so we can show "already sold" when the item is SOLD.
  const addItemFromScannedData = (raw) => {
    const trimmed = (raw || '').trim();
    if (!trimmed) {
      setQrScanResultMessage({ type: 'error', text: 'Enter article code or stock ID.' });
      setError('Enter article code or stock ID');
      setTimeout(() => { setError(null); setQrScanResultMessage(null); }, 4000);
      return false;
    }
    const lookupList = stockAllForLookup.length > 0 ? stockAllForLookup : stock;
    let found = null;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed != null && (parsed.id != null || parsed.articleCode)) {
        if (parsed.id != null) found = lookupList.find(s => s.id === parsed.id);
        if (!found && parsed.articleCode) found = lookupList.find(s => (s.articleCode || '').toLowerCase() === String(parsed.articleCode).toLowerCase());
      }
    } catch (_) {
      // Not JSON: treat as article code or numeric ID
    }
    if (!found) {
      const idNum = parseInt(trimmed, 10);
      if (!isNaN(idNum)) found = lookupList.find(s => s.id === idNum);
    }
    if (!found) {
      found = lookupList.find(s => (s.articleCode || '').toLowerCase() === trimmed.toLowerCase());
    }
    if (!found) {
      setQrScanResultMessage({ type: 'error', text: 'No stock found for this QR code.' });
      setError('No stock found for: ' + (trimmed.length > 30 ? trimmed.slice(0, 30) + '…' : trimmed));
      setTimeout(() => { setError(null); setQrScanResultMessage(null); }, 4000);
      return false;
    }
    if (found.status === 'SOLD') {
      const label = (found.articleCode || found.articleName || 'Item') + ' — already sold';
      setQrScanResultMessage({ type: 'error', text: 'This item is already sold. Cannot add to bill.' });
      setError(label);
      setTimeout(() => { setError(null); setQrScanResultMessage(null); }, 4000);
      return false;
    }
    const alreadyInBill = formData.items.some(
      (item) => item.stockId != null && String(item.stockId) === String(found.id)
    );
    if (alreadyInBill) {
      const label = (found.articleCode || found.articleName || 'Item') + ' — already in bill';
      setQrScanResultMessage({ type: 'error', text: 'This item is already in the bill.' });
      setError(label);
      setTimeout(() => { setError(null); setQrScanResultMessage(null); }, 4000);
      return false;
    }
    setQrScanResultMessage(null);
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { stockId: String(found.id), quantity: 1, overrideRatePerGram: '', makingChargesPerGram: '', hallmark: false }]
    }));
    if ((isGoldMetalItem(found) || isSilverMetalItem(found)) && itemPrices[found.id] == null) {
      fetchCalculatedPriceForStock(found);
    }
    setQrAddInput('');
    setShowQRAddModal(false);
    setQrScanning(false);
    return true;
  };

  const addItemByQR = () => addItemFromScannedData(qrAddInput);

  // Process pending scanned code with current stock/formData (avoids stale closure in camera callback)
  useEffect(() => {
    if (pendingScannedCode == null || pendingScannedCode === '') return;
    const code = String(pendingScannedCode).trim();
    setPendingScannedCode('');
    setQrScanFeedback(null);
    if (!code) return;
    const added = addItemFromScannedData(code);
    if (added && qrScannerRef.current) {
      qrScannerRef.current.stop().catch(() => {}).finally(() => {
        qrScannerRef.current = null;
      });
    } else {
      setTimeout(() => setQrScanFeedback(null), 2500);
    }
  }, [pendingScannedCode]);

  // Start/stop camera scanner when "Scan with camera" is active (delay so DOM element is mounted)
  useEffect(() => {
    if (!showQRAddModal || !qrScanning) return;
    setPendingScannedCode(null);
    setQrScanFeedback(null);
    setQrScanResultMessage(null);
    setQrZoomSupported(false);
    setQrTorchSupported(false);
    setQrTorchOn(false);
    let cancelled = false;
    const timer = setTimeout(() => {
      const el = document.getElementById('billing-qr-reader');
      if (cancelled || !el) return;
      const scanner = new Html5Qrcode('billing-qr-reader', { useBarCodeDetectorIfSupported: false });
      qrScannerRef.current = scanner;
      const scanConfig = {
        fps: 20,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minDim = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.floor(minDim * 0.85);
          return { width: Math.max(200, size), height: Math.max(200, size) };
        },
        aspectRatio: 1,
        disableFlip: false
      };
      scanner.start(
        { facingMode: 'environment' },
        scanConfig,
        (decodedText, decodedResult) => {
          const trimmed = getDecodedString(decodedText, decodedResult);
          if (!trimmed) return;
          setQrScanFeedback(trimmed);
          setPendingScannedCode(trimmed);
        },
        () => {}
      ).then(() => {
        if (cancelled || !qrScannerRef.current) return;
        try {
          const caps = scanner.getRunningTrackCameraCapabilities?.();
          if (caps?.zoomFeature?.()?.isSupported?.()) setQrZoomSupported(true);
          if (caps?.torchFeature?.()?.isSupported?.()) setQrTorchSupported(true);
        } catch (_) {}
      }).catch((err) => {
        if (cancelled) return;
        const msg = err?.message || '';
        const isPolicy = /permissions?\s*policy|feature\s*policy|not\s*allowed|blocked/i.test(msg) || /camera/i.test(msg);
        const hint = isPolicy
          ? ' Open this app in a new browser tab (same URL), use HTTPS, and ensure the server sends Permissions-Policy: camera=(self).'
          : ' Use HTTPS or localhost and allow camera when prompted.';
        setError('Camera access failed: ' + (msg || 'Permission denied') + hint);
        setTimeout(() => setError(null), 8000);
        setQrScanning(false);
        qrScannerRef.current = null;
      });
    }, 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (qrScannerRef.current) {
        qrScannerRef.current.stop().catch(() => {}).finally(() => {
          qrScannerRef.current = null;
        });
      }
    };
  }, [showQRAddModal, qrScanning]);

  const applyQrZoom = (factor) => {
    const sc = qrScannerRef.current;
    if (!sc) return;
    try {
      const caps = sc.getRunningTrackCameraCapabilities?.();
      const zoomF = caps?.zoomFeature?.();
      if (!zoomF?.isSupported?.()) return;
      const minV = zoomF.min?.() ?? 1;
      const maxV = zoomF.max?.() ?? 10;
      const clamped = Math.max(minV, Math.min(maxV, factor));
      zoomF.apply(clamped).then(() => setQrZoom(clamped)).catch(() => {});
    } catch (_) {}
  };

  const toggleQrTorch = () => {
    const sc = qrScannerRef.current;
    if (!sc) return;
    try {
      const caps = sc.getRunningTrackCameraCapabilities?.();
      const torchF = caps?.torchFeature?.();
      if (!torchF?.isSupported?.()) return;
      const next = !qrTorchOn;
      torchF.apply(next).then(() => setQrTorchOn(next)).catch(() => {});
    } catch (_) {}
  };

  const cycleQrZoom = () => {
    const idx = QR_ZOOM_OPTIONS.indexOf(qrZoom);
    const next = QR_ZOOM_OPTIONS[(idx + 1) % QR_ZOOM_OPTIONS.length];
    setQrZoom(next);
    applyQrZoom(next);
  };

  const scanQrFromGallery = (e) => {
    const file = e.target?.files?.[0];
    e.target.value = '';
    if (!file) return;
    const runFileScan = () => {
      const elementId = 'billing-qr-reader';
      const el = document.getElementById(elementId);
      if (!el) {
        setQrScanResultMessage({ type: 'error', text: 'Scan area not ready. Try "Scan with camera" first, then choose an image.' });
        setTimeout(() => setQrScanResultMessage(null), 4000);
        return;
      }
      const fileScanner = new Html5Qrcode(elementId, { useBarCodeDetectorIfSupported: false });
      fileScanner.scanFile(file, false)
        .then((decodedText) => {
          const text = getDecodedString(decodedText, null);
          if (text && addItemFromScannedData(text)) {
            setShowQRAddModal(false);
            setQrAddInput('');
            setQrScanning(false);
            qrScannerRef.current = null;
          } else if (text) {
            setQrScanResultMessage({ type: 'error', text: 'No stock found for this QR code.' });
            setTimeout(() => setQrScanResultMessage(null), 4000);
          }
        })
        .catch((err) => {
          const msg = err?.message || '';
          setQrScanResultMessage({
            type: 'error',
            text: msg.includes('detect') || msg.includes('NotFoundException')
              ? 'No QR code found in this image. Use a clear photo with the full QR code visible.'
              : 'Could not read QR from image.'
          });
          setTimeout(() => setQrScanResultMessage(null), 5000);
        });
    };
    const sc = qrScannerRef.current;
    if (sc) {
      sc.stop().catch(() => {}).then(() => {
        qrScannerRef.current = null;
        runFileScan();
      });
    } else {
      runFileScan();
    }
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    setBuyBackPrices(prev => {
      const next = {};
      newItems.forEach((item, i) => {
        if (!item.isBuyBack || item.isSilverBuyBack) return;
        const oldIdx = formData.items.findIndex(x => x === item);
        if (oldIdx >= 0 && prev[oldIdx] != null) next[i] = prev[oldIdx];
      });
      return next;
    });
    setSilverBuyBackPrices(prev => {
      const next = {};
      newItems.forEach((item, i) => {
        if (!item.isBuyBack || !item.isSilverBuyBack) return;
        const oldIdx = formData.items.findIndex(x => x === item);
        if (oldIdx >= 0 && prev[oldIdx] != null) next[i] = prev[oldIdx];
      });
      return next;
    });
  };

  // Diamond value from rate (diamondCarat × rate per carat). Only for metal+diamond items; diamond-only uses sellingPrice.
  const getDiamondValue = (s) => {
    if (!s?.diamondCarat || !diamondRatePerCarat) return 0;
    return parseFloat(s.diamondCarat) * diamondRatePerCarat;
  };

  const isDiamondOnly = (s) => s && String(s.material || '').toLowerCase() === 'diamond';

  // Per-unit making charges from API (default/prop or item-level). Used so invoice shows Making line.
  const getMakingCharges = (s) => (s?.id != null && itemMakingCharges[s.id] != null) ? itemMakingCharges[s.id] : 0;

  // Rate per gram for display – gold or silver (from calculate-price / calculate-price-silver or today's rates). Used in item dropdown.
  const getDisplayRatePerGram = (s) => {
    if (!s) return null;
    if (isGoldMetalItem(s)) {
      if (itemGoldRatePerGram[s.id] != null) return itemGoldRatePerGram[s.id];
      const carat = s.carat != null ? parseInt(s.carat, 10) : null;
      if (carat != null && todayGoldRatesByKarat[carat] != null) return todayGoldRatesByKarat[carat];
      return null;
    }
    if (isSilverMetalItem(s)) {
      if (itemSilverRatePerGram[s.id] != null) return itemSilverRatePerGram[s.id];
      return todaySilverPerGram;
    }
    return null;
  };

  // Effective unit price for a line item: uses override rate, else gold/silver rate × weight + diamond (for Gold+Diamond or Silver+Diamond), else getUnitPrice(s)
  const getEffectiveUnitPriceForItem = (item, s) => {
    if (!s) return 0;
    const w = parseFloat(s.weightGrams);
    let rate = 0;
    const override = item?.overrideRatePerGram != null && item.overrideRatePerGram !== '' && !isNaN(parseFloat(item.overrideRatePerGram));
    if (override) rate = parseFloat(item.overrideRatePerGram);
    else if ((isGoldMetalItem(s) || isSilverMetalItem(s)) && w > 0) rate = getDisplayRatePerGram(s) ?? 0;
    if (rate > 0 && w > 0) {
      const metalPart = rate * w;
      const diamondPart = (isGoldMetalItem(s) || isSilverMetalItem(s)) ? getDiamondValue(s) : 0;
      return Math.round((metalPart + diamondPart) * 100) / 100;
    }
    return getUnitPrice(s);
  };

  // Unit value for subtotal (items): gold/silver rate × weight + diamond (for Gold+Diamond or Silver+Diamond) (no making, no GST). Uses override or display rate.
  const getSubtotalUnitValue = (item, s) => {
    if (!s) return 0;
    const w = parseFloat(s.weightGrams);
    let rate = 0;
    const override = item?.overrideRatePerGram != null && item.overrideRatePerGram !== '' && !isNaN(parseFloat(item.overrideRatePerGram));
    if (override) rate = parseFloat(item.overrideRatePerGram);
    else if ((isGoldMetalItem(s) || isSilverMetalItem(s)) && w > 0) rate = getDisplayRatePerGram(s) ?? 0;
    if (rate > 0 && w > 0 && (isGoldMetalItem(s) || isSilverMetalItem(s))) {
      const metalPart = rate * w;
      const diamondPart = getDiamondValue(s); // include diamond for both Gold+Diamond and Silver+Diamond
      return Math.round((metalPart + diamondPart) * 100) / 100;
    }
    const fullUp = getUnitPrice(s);
    const makingPerUnit = getMakingCharges(s);
    return (isGoldMetalItem(s) || isSilverMetalItem(s)) ? fullUp - makingPerUnit : fullUp;
  };

  // Unit price: metal part + diamond part (for Gold+Diamond); Diamond-only = sellingPrice only
  const getUnitPrice = (s) => {
    if (!s) return 0;
    let metalPart = 0;
    if (isDiamondItem(s)) {
      if (isDiamondOnly(s)) {
        const sp = s.sellingPrice;
        return (sp != null && sp > 0) ? parseFloat(sp) : 0;
      }
      // Gold + Diamond etc.: metal part + diamond part
      const sp = s.sellingPrice;
      if (sp != null && sp > 0) metalPart = parseFloat(sp);
      else if ((isGoldMetalItem(s) || isSilverMetalItem(s)) && itemPrices[s.id] != null) metalPart = itemPrices[s.id];
      const diamondPart = getDiamondValue(s);
      return Math.round((metalPart + diamondPart) * 100) / 100;
    }
    if (itemPrices[s.id] != null) metalPart = itemPrices[s.id];
    else {
      const sp = s.sellingPrice;
      metalPart = (sp != null && sp > 0) ? parseFloat(sp) : 0;
    }
    const diamondPart = isGoldMetalItem(s) ? getDiamondValue(s) : 0;
    return Math.round((metalPart + diamondPart) * 100) / 100;
  };

  const fetchCalculatedPriceForStock = async (stockItem) => {
    if (isGoldMetalItem(stockItem)) {
      try {
        const params = new URLSearchParams({ weightGrams: String(stockItem.weightGrams), carat: String(stockItem.carat) });
        if (stockItem.makingChargesPerGram != null && stockItem.makingChargesPerGram > 0) params.set('makingChargesPerGram', String(stockItem.makingChargesPerGram));
        if (stockItem.category) params.set('category', stockItem.category);
        const response = await axios.get(`${API_URL}/stock/calculate-price?${params.toString()}`, { headers: getAuthHeaders() });
        const price = response.data?.calculatedPrice;
        const makingCharges = response.data?.makingCharges != null ? parseFloat(response.data.makingCharges) : 0;
        const goldRatePerGram = response.data?.goldRatePerGram != null ? parseFloat(response.data.goldRatePerGram) : null;
        if (price != null) {
          setItemPrices(prev => ({ ...prev, [stockItem.id]: parseFloat(price) }));
          setItemMakingCharges(prev => ({ ...prev, [stockItem.id]: makingCharges }));
          if (goldRatePerGram != null) setItemGoldRatePerGram(prev => ({ ...prev, [stockItem.id]: goldRatePerGram }));
        }
      } catch (err) {
        if (err.response?.status === 400 && !itemPrices[stockItem.id]) {
          setError(err.response?.data?.error || 'Set today\'s gold rate in Price Management to calculate amounts.');
          setTimeout(() => setError(null), 6000);
        }
        console.error('Error fetching calculated price for stock:', err);
      }
      return;
    }
    if (isSilverMetalItem(stockItem)) {
      try {
        const params = new URLSearchParams({ weightGrams: String(stockItem.weightGrams) });
        if (stockItem.makingChargesPerGram != null && stockItem.makingChargesPerGram > 0) params.set('makingChargesPerGram', String(stockItem.makingChargesPerGram));
        if (stockItem.category) params.set('category', stockItem.category);
        const response = await axios.get(`${API_URL}/stock/calculate-price-silver?${params.toString()}`, { headers: getAuthHeaders() });
        const price = response.data?.calculatedPrice;
        const makingCharges = response.data?.makingCharges != null ? parseFloat(response.data.makingCharges) : 0;
        const silverRatePerGram = response.data?.silverRatePerGram != null ? parseFloat(response.data.silverRatePerGram) : null;
        if (price != null) {
          setItemPrices(prev => ({ ...prev, [stockItem.id]: parseFloat(price) }));
          setItemMakingCharges(prev => ({ ...prev, [stockItem.id]: makingCharges }));
          if (silverRatePerGram != null) setItemSilverRatePerGram(prev => ({ ...prev, [stockItem.id]: silverRatePerGram }));
        }
      } catch (err) {
        if (err.response?.status === 400 && !itemPrices[stockItem.id]) {
          setError(err.response?.data?.error || 'Set today\'s silver rate in Rates to calculate amounts.');
          setTimeout(() => setError(null), 6000);
        }
        console.error('Error fetching calculated price for silver stock:', err);
      }
    }
  };

  const handleItemSelect = (index, stockId) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], stockId, isBuyBack: false, overrideRatePerGram: '', makingChargesPerGram: '', hallmark: newItems[index].hallmark === true };
    setFormData({ ...formData, items: newItems });
    if (stockId) {
      const s = stock.find(x => x.id === parseInt(stockId, 10));
      if ((isGoldMetalItem(s) || isSilverMetalItem(s)) && itemPrices[s.id] == null) {
        fetchCalculatedPriceForStock(s);
      }
    }
  };

  const purityToCarat = (purity) => (parseFloat(purity) / 100) * 24;

  const fetchBuyBackPrice = async (index, weightGrams, purity) => {
    if (!weightGrams || !purity) return;
    const carat = purityToCarat(purity);
    if (isNaN(carat) || carat <= 0) return;
    try {
      const params = new URLSearchParams({ weightGrams: String(weightGrams), carat: String(carat.toFixed(2)) });
      const response = await axios.get(`${API_URL}/stock/calculate-price?${params.toString()}`, { headers: getAuthHeaders() });
      // Buy-back uses gold value only (no making charges or GST)
      const price = response.data?.goldValue ?? response.data?.calculatedPrice;
      if (price != null) {
        setBuyBackPrices(prev => ({ ...prev, [index]: parseFloat(price) }));
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response?.data?.error || 'Set today\'s gold rate to calculate buy-back value.');
        setTimeout(() => setError(null), 5000);
      }
      console.error('Error fetching buy-back price:', err);
    }
  };

  const fetchSilverBuyBackPrice = async (index, weightGrams) => {
    if (!weightGrams || parseFloat(weightGrams) <= 0) return;
    try {
      const params = new URLSearchParams({ weightGrams: String(weightGrams) });
      const response = await axios.get(`${API_URL}/stock/calculate-price-silver?${params.toString()}`, { headers: getAuthHeaders() });
      // Buy-back uses silver value only (no making charges or GST)
      const price = response.data?.silverValue ?? response.data?.calculatedPrice;
      if (price != null) {
        setSilverBuyBackPrices(prev => ({ ...prev, [index]: parseFloat(price) }));
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response?.data?.error || 'Set today\'s silver rate to calculate buy-back value.');
        setTimeout(() => setError(null), 5000);
      }
      console.error('Error fetching silver buy-back price:', err);
    }
  };

  const handleBuyBackChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
    if (newItems[index].isSilverBuyBack) {
      if (field === 'weightGrams' && value && parseFloat(value) > 0) {
        fetchSilverBuyBackPrice(index, value);
      }
    } else {
      if (field === 'weightGrams' || field === 'purity') {
        if (field !== 'buyBackRatePerGram') {
          const w = field === 'weightGrams' ? value : newItems[index].weightGrams;
          const p = field === 'purity' ? value : newItems[index].purity;
          if (w && p) fetchBuyBackPrice(index, w, p);
        }
      }
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calculateSubtotalSales = () => {
    return formData.items.reduce((sum, item) => {
      if (item.isBuyBack) return sum;
      const selectedStock = stock.find(s => s.id === parseInt(item.stockId, 10));
      const unitPrice = getEffectiveUnitPriceForItem(item, selectedStock);
      return sum + (unitPrice * parseInt(item.quantity || 1, 10));
    }, 0);
  };

  const getBuyBackUnitPrice = (item, index) => {
    const rateOverride = item.buyBackRatePerGram != null && item.buyBackRatePerGram !== '' ? parseFloat(item.buyBackRatePerGram) : null;
    const weight = parseFloat(item.weightGrams);
    if (rateOverride != null && !isNaN(rateOverride) && rateOverride > 0 && weight > 0) {
      return rateOverride * weight;
    }
    if (item.isSilverBuyBack) {
      return silverBuyBackPrices[index] != null ? silverBuyBackPrices[index] : 0;
    }
    return buyBackPrices[index] != null ? buyBackPrices[index] : 0;
  };

  const calculateBuyBackTotal = () => {
    return formData.items.reduce((sum, item, index) => {
      if (!item.isBuyBack) return sum;
      const unitPrice = getBuyBackUnitPrice(item, index);
      const qty = parseInt(item.quantity || 1, 10);
      return sum + (unitPrice * qty);
    }, 0);
  };

  const calculateGoldBuyBackTotal = () => {
    return formData.items.reduce((sum, item, index) => {
      if (!item.isBuyBack || item.isSilverBuyBack) return sum;
      const unitPrice = getBuyBackUnitPrice(item, index);
      const qty = parseInt(item.quantity || 1, 10);
      return sum + (unitPrice * qty);
    }, 0);
  };

  const calculateSilverBuyBackTotal = () => {
    return formData.items.reduce((sum, item, index) => {
      if (!item.isBuyBack || !item.isSilverBuyBack) return sum;
      const unitPrice = getBuyBackUnitPrice(item, index);
      const qty = parseInt(item.quantity || 1, 10);
      return sum + (unitPrice * qty);
    }, 0);
  };

  const calculateTotalDiamondAmount = () => {
    return formData.items.reduce((sum, item) => {
      if (item.isBuyBack || !item.stockId) return sum;
      const selectedStock = stock.find(s => s.id === parseInt(item.stockId, 10));
      const qty = parseInt(item.quantity, 10) || 1;
      return sum + (getDiamondValue(selectedStock) * qty);
    }, 0);
  };

  // Metal-only amount for gold items (rate × weight × qty), for summary breakdown
  const calculateTotalGoldMetalAmount = () => {
    return formData.items.reduce((sum, item) => {
      if (item.isBuyBack || !item.stockId) return sum;
      const s = stock.find(x => x.id === parseInt(item.stockId, 10));
      if (!isGoldMetalItem(s)) return sum;
      const w = parseFloat(s.weightGrams);
      let rate = 0;
      const override = item?.overrideRatePerGram != null && item.overrideRatePerGram !== '' && !isNaN(parseFloat(item.overrideRatePerGram));
      if (override) rate = parseFloat(item.overrideRatePerGram);
      else rate = getDisplayRatePerGram(s) ?? 0;
      const qty = parseInt(item.quantity, 10) || 1;
      return sum + (rate > 0 && w > 0 ? Math.round(rate * w * qty * 100) / 100 : 0);
    }, 0);
  };

  // Metal-only amount for silver items (rate × weight × qty), for summary breakdown
  const calculateTotalSilverMetalAmount = () => {
    return formData.items.reduce((sum, item) => {
      if (item.isBuyBack || !item.stockId) return sum;
      const s = stock.find(x => x.id === parseInt(item.stockId, 10));
      if (!isSilverMetalItem(s)) return sum;
      const w = parseFloat(s.weightGrams);
      let rate = 0;
      const override = item?.overrideRatePerGram != null && item.overrideRatePerGram !== '' && !isNaN(parseFloat(item.overrideRatePerGram));
      if (override) rate = parseFloat(item.overrideRatePerGram);
      else rate = getDisplayRatePerGram(s) ?? 0;
      const qty = parseInt(item.quantity, 10) || 1;
      return sum + (rate > 0 && w > 0 ? Math.round(rate * w * qty * 100) / 100 : 0);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotalSales() - calculateBuyBackTotal();
  };

  // Subtotal sent to backend: item totals excluding making (so Making can be a separate line on invoice)
  const calculateSubtotalExcludingMaking = () => {
    return formData.items.reduce((sum, item) => {
      if (item.isBuyBack) return sum;
      if (item.isExternalItem) {
        const qty = parseInt(item.quantity, 10) || 1;
        const up = parseFloat(item.unitPrice) || 0;
        return sum + qty * up;
      }
      if (!item.stockId) return sum;
      const s = stock.find(x => x.id === parseInt(item.stockId, 10));
      const qty = parseInt(item.quantity, 10) || 1;
      const unitExcludingMaking = getSubtotalUnitValue(item, s);
      return sum + unitExcludingMaking * qty;
    }, 0);
  };
  // Grams for a single item (weight × qty). 0 for buy-back or no weight.
  const getGramsForItem = (item, index) => {
    if (item.isBuyBack) return 0;
    if (item.isExternalItem) {
      const w = parseFloat(item.weightGrams);
      const qty = parseInt(item.quantity, 10) || 1;
      return w > 0 ? w * qty : 0;
    }
    if (!item.stockId) return 0;
    const s = stock.find(x => x.id === parseInt(item.stockId, 10));
    const w = parseFloat(s?.weightGrams);
    const qty = parseInt(item.quantity, 10) || 1;
    return (w > 0) ? w * qty : 0;
  };

  const totalGramsForMaking = formData.items.reduce((sum, item, idx) => sum + getGramsForItem(item, idx), 0);

  // Effective making rate (₹/g) for this item: item override, else stock's, else default from Rates.
  const getEffectiveMakingRatePerGram = (item, index) => {
    const def = defaultMakingPerGram ?? FALLBACK_MAKING_PER_GRAM;
    if (item.isBuyBack) return 0;
    if (item.isExternalItem) {
      const v = item.makingChargesPerGram;
      return (v !== '' && v != null && !isNaN(parseFloat(v))) ? parseFloat(v) : def;
    }
    if (!item.stockId) return def;
    const s = stock.find(x => x.id === parseInt(item.stockId, 10));
    const v = item.makingChargesPerGram;
    if (v !== '' && v != null && !isNaN(parseFloat(v))) return parseFloat(v);
    return (s?.makingChargesPerGram != null && s.makingChargesPerGram > 0) ? parseFloat(s.makingChargesPerGram) : def;
  };

  // Making amount for this item: (₹/g) × g. Sum over items = total making.
  const getMakingForItem = (item, index) => {
    const grams = getGramsForItem(item, index);
    if (grams <= 0) return 0;
    const rate = getEffectiveMakingRatePerGram(item, index);
    return Math.round(rate * grams * 100) / 100;
  };

  const effectiveMakingCharges = formData.items.reduce((sum, item, index) => sum + getMakingForItem(item, index), 0);

  const finalAmount = calculateSubtotalExcludingMaking() - calculateBuyBackTotal() - (parseFloat(formData.discountAmount) || 0) + effectiveMakingCharges;
  // Paid amount from payment rows (split payment: cash + UPI etc.)
  const paymentsWithAmount = (formData.payments || []).filter(p => p.amount !== '' && p.amount != null && !isNaN(parseFloat(p.amount)) && parseFloat(p.amount) > 0);
  const paidAmount = paymentsWithAmount.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const remainingAmount = finalAmount - paidAmount;
  const displayPaymentMethod = paymentsWithAmount.length > 1 ? 'MIXED' : (paymentsWithAmount.length === 1 ? paymentsWithAmount[0].method : (formData.payments?.[0]?.method || 'CASH'));

  return (
    <div className="admin-dashboard">
      <AdminNav title="🧾 Billing" onLogout={handleLogout} />

      <div className="price-management">
        <div className="price-header">
          <h1>🧾 Billing Management</h1>
          <p>Create and manage invoices</p>
        </div>

        {error && (
          <div style={{ margin: '0 2rem 1rem 2rem', padding: '1rem', background: '#fee', color: '#c33', borderRadius: '8px', border: '1px solid #fcc' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ margin: '0 2rem 1rem 2rem', padding: '1rem', background: '#efe', color: '#3c3', borderRadius: '8px', border: '1px solid #cfc' }}>
            {success}
          </div>
        )}

        {/* Search Section – dark card to match stock page */}
        <div className="price-search-card">
          <div className="price-search-row">
            <form onSubmit={handleSearch} className="billing-search-form" style={{ flex: 1, minWidth: 0, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by bill number, customer name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="price-action-btn" style={{ padding: '0.75rem 1.5rem' }}>
                🔍 Search
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(0);
                    fetchBills();
                  }}
                  className="price-action-btn secondary"
                  style={{ padding: '0.75rem 1rem' }}
                >
                  ✕ Clear
                </button>
              )}
            </form>
            <button
              onClick={() => setShowForm(!showForm)}
              className="price-action-btn"
            >
              {showForm ? '✕ Cancel' : '+ Create New Bill'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="price-form-card">
            <div className="price-form-header">
              <span style={{ fontSize: '2rem' }}>✨</span>
              <h3>Create New Bill</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="price-form-grid">
                <div className="price-form-group">
                  <label>Customer *</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    required={!newCustomerForm.visible}
                    disabled={!!newCustomerForm.visible}
                    style={newCustomerForm.visible ? { opacity: 0.8 } : {}}
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                    ))}
                  </select>
                  {!newCustomerForm.visible ? (
                    <button
                      type="button"
                      onClick={() => setNewCustomerForm(prev => ({ ...prev, visible: true }))}
                      className="price-action-btn secondary"
                      style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}
                    >
                      ➕ Add new customer (not in list)
                    </button>
                  ) : (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--adm-bg-elevated)', border: '1px solid var(--adm-border-gold)', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>New customer</p>
                      <input
                        type="text"
                        placeholder="Name *"
                        value={newCustomerForm.name}
                        onChange={(e) => setNewCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                        style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--adm-border-gold)' }}
                      />
                      <input
                        type="text"
                        placeholder="Phone *"
                        value={newCustomerForm.phone}
                        onChange={(e) => setNewCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                        style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--adm-border-gold)' }}
                      />
                      <input
                        type="text"
                        placeholder="Email (optional)"
                        value={newCustomerForm.email}
                        onChange={(e) => setNewCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                        style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--adm-border-gold)' }}
                      />
                      <input
                        type="text"
                        placeholder="Address (optional)"
                        value={newCustomerForm.address}
                        onChange={(e) => setNewCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                        style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--adm-border-gold)' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button type="button" onClick={createCustomerAndSelect} disabled={creatingCustomer} className="stock-btn-edit" style={{ fontSize: '0.875rem' }}>
                          {creatingCustomer ? '⏳ Saving...' : '✓ Save & use'}
                        </button>
                        <button type="button" onClick={() => setNewCustomerForm({ name: '', phone: '', email: '', address: '', visible: false })} className="price-action-btn secondary" style={{ fontSize: '0.875rem' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="price-form-group">
                  <label>Payment *</label>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>
                    Add multiple rows for split payment (e.g. some cash + some UPI).
                  </p>
                  {(formData.payments || [{ method: 'CASH', amount: '' }]).map((row, idx) => (
                    <div key={idx} className="billing-payment-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <div className="billing-payment-method" style={{ flex: '1 1 120px', minWidth: 0 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginBottom: '0.25rem', display: 'block' }}>Method</label>
                        <select
                          value={row.method || 'CASH'}
                          onChange={(e) => updatePaymentRow(idx, 'method', e.target.value)}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--adm-border-gold)', background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }}
                        >
                          <option value="CASH">Cash</option>
                          <option value="CARD">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="CREDIT">Udhari</option>
                        </select>
                      </div>
                      <div className="billing-payment-amount" style={{ flex: '1 1 100px', minWidth: 0, maxWidth: '100%' }}>
                        <label className="billing-payment-amount-label" style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginBottom: '0.25rem', display: 'block' }}>
                          Amount (₹) {row.method === 'CASH' && idx === 0 && <span style={{ color: 'var(--adm-text-muted)' }}>— empty = full</span>}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.amount ?? ''}
                          onChange={(e) => updatePaymentRow(idx, 'amount', e.target.value)}
                          placeholder={row.method === 'CREDIT' ? 'Full udhari' : '0'}
                          className="billing-payment-amount-input"
                          style={{ width: '100%', maxWidth: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--adm-border-gold)', background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)', boxSizing: 'border-box' }}
                        />
                      </div>
                      {(formData.payments || []).length > 1 && (
                        <button type="button" onClick={() => removePaymentRow(idx)} className="stock-btn-delete" style={{ padding: '0.75rem', flexShrink: 0 }} title="Remove payment row">🗑️</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addPaymentRow} className="price-action-btn secondary" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    + Add payment (e.g. cash + UPI)
                  </button>
                </div>
                <div className="price-form-group">
                  <label>Discount Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({...formData, discountAmount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                {paymentsWithAmount.length > 0 && paidAmount < finalAmount && (
                  <div className="price-form-group" style={{ marginTop: '-0.5rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(255, 243, 205, 0.3)', borderRadius: '8px', fontSize: '0.9rem', color: '#856404', border: '1px solid rgba(133, 100, 4, 0.3)' }}>
                      ⚠️ Remaining amount (₹{remainingAmount.toFixed(2)}) will be added to udhari
                    </div>
                  </div>
                )}
              </div>

              <div className="price-form-group">
                <label>Items *</label>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginBottom: '0.25rem', display: 'block' }}>Scan with barcode/QR gun (focus here, then scan — item adds automatically)</label>
                  <input
                    ref={scanGunInputRef}
                    type="text"
                    placeholder="Click here, then scan with gun"
                    onKeyDown={handleScanGunKeyDown}
                    autoComplete="off"
                    style={{ width: '100%', maxWidth: '100%', padding: '0.6rem 0.75rem', border: '2px solid var(--adm-border-gold)', borderRadius: '8px', background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)', boxSizing: 'border-box', fontSize: '0.9rem' }}
                  />
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} style={{ marginBottom: '1rem' }}>
                    {item.isBuyBack && item.isSilverBuyBack ? (
                      <div className="price-buyback-item">
                        <span className="price-buyback-item-label">🥈 Customer selling silver (buy-back)</span>
                        <div style={{ flex: '1 1 100px' }}>
                          <label>Weight (g)</label>
                          <input
                            type="number"
                            step="0.001"
                            value={item.weightGrams || ''}
                            onChange={(e) => handleBuyBackChange(index, 'weightGrams', e.target.value)}
                            placeholder="e.g. 100"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                          />
                        </div>
                        <div style={{ flex: '1 1 100px' }}>
                          <label>Rate (₹/g) – optional</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.buyBackRatePerGram ?? ''}
                            onChange={(e) => handleBuyBackChange(index, 'buyBackRatePerGram', e.target.value)}
                            placeholder="Override rate"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                          />
                        </div>
                        <div style={{ flex: '0 0 70px' }}>
                          <label>Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity || 1}
                            onChange={(e) => handleBuyBackChange(index, 'quantity', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                          />
                        </div>
                        <div style={{ flex: '0 0 100px' }}>
                          <label>Value</label>
                          <div className="price-buyback-value">
                            {getBuyBackUnitPrice(item, index) > 0 ? formatCurrency(getBuyBackUnitPrice(item, index) * parseInt(item.quantity || 1, 10)) : '—'}
                          </div>
                        </div>
                        <button type="button" onClick={() => removeItem(index)} className="stock-btn-delete" style={{ padding: '0.75rem 1rem' }}>🗑️</button>
                      </div>
                    ) : item.isBuyBack ? (
                      <div className="price-buyback-item">
                        <span className="price-buyback-item-label">🪙 Customer selling gold (buy-back)</span>
                        <div style={{ flex: '1 1 100px' }}>
                          <label>Weight (g)</label>
                          <input
                            type="number"
                            step="0.001"
                            value={item.weightGrams || ''}
                            onChange={(e) => handleBuyBackChange(index, 'weightGrams', e.target.value)}
                            placeholder="e.g. 10"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                          />
                        </div>
                        <div style={{ flex: '1 1 120px' }}>
                          <label>Purity (%)</label>
                          <select
                            value={item.purity === '' || item.purity === undefined ? '' : (item.purity === 'OTHER' || !GOLD_PURITY_OPTIONS.some(o => Number(item.purity) === o.purity) ? '__OTHER__' : String(item.purity))}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === '__OTHER__') {
                                handleBuyBackChange(index, 'purity', 'OTHER');
                                return;
                              }
                              handleBuyBackChange(index, 'purity', v);
                            }}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', marginBottom: (item.purity === 'OTHER' || (item.purity !== '' && item.purity !== undefined && item.purity !== 'OTHER' && !GOLD_PURITY_OPTIONS.some(o => Number(item.purity) === o.purity))) ? '0.5rem' : 0 }}
                          >
                            <option value="">Select</option>
                            {GOLD_PURITY_OPTIONS.map(({ purity, label }) => (
                              <option key={purity} value={purity}>{label}</option>
                            ))}
                            <option value="__OTHER__">Other (enter %)</option>
                          </select>
                          {(item.purity === 'OTHER' || (item.purity !== '' && item.purity !== undefined && item.purity !== 'OTHER' && !GOLD_PURITY_OPTIONS.some(o => Number(item.purity) === o.purity))) && (
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={item.purity === 'OTHER' ? '' : (item.purity ?? '')}
                              onChange={(e) => handleBuyBackChange(index, 'purity', e.target.value)}
                              placeholder="e.g. 70"
                              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', marginTop: '0.25rem', boxSizing: 'border-box' }}
                            />
                          )}
                        </div>
                        <div style={{ flex: '1 1 100px' }}>
                          <label>Rate (₹/g) – optional</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.buyBackRatePerGram ?? ''}
                            onChange={(e) => handleBuyBackChange(index, 'buyBackRatePerGram', e.target.value)}
                            placeholder="Override rate"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                          />
                        </div>
                        <div style={{ flex: '0 0 70px' }}>
                          <label>Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity || 1}
                            onChange={(e) => handleBuyBackChange(index, 'quantity', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                          />
                        </div>
                        <div style={{ flex: '0 0 100px' }}>
                          <label>Value</label>
                          <div className="price-buyback-value">
                            {getBuyBackUnitPrice(item, index) > 0 ? formatCurrency(getBuyBackUnitPrice(item, index) * parseInt(item.quantity || 1, 10)) : '—'}
                          </div>
                        </div>
                        <button type="button" onClick={() => removeItem(index)} className="stock-btn-delete" style={{ padding: '0.75rem 1rem' }}>🗑️</button>
                      </div>
                    ) : item.isExternalItem ? (
                      <div className="price-external-item">
                        <span className="price-external-item-label">🤝 Sold from friend (external)</span>
                        <div style={{ flex: '1 1 120px', minWidth: '100px' }}>
                          <label className="price-external-field-label">Item *</label>
                          <input
                            type="text"
                            placeholder="Item name"
                            value={item.itemName || ''}
                            onChange={(e) => handleExternalItemChange(index, 'itemName', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #ecf0f1', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ flex: '0 1 80px' }}>
                          <label className="price-external-field-label">Code</label>
                          <input
                            type="text"
                            placeholder="Code"
                            value={item.articleCode || ''}
                            onChange={(e) => handleExternalItemChange(index, 'articleCode', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #ecf0f1', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ flex: '0 1 70px' }}>
                          <label className="price-external-field-label">Carat</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="—"
                            value={item.carat ?? ''}
                            onChange={(e) => handleExternalItemChange(index, 'carat', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #ecf0f1', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ flex: '0 1 70px' }}>
                          <label className="price-external-field-label">Wt (g)</label>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="—"
                            value={item.weightGrams ?? ''}
                            onChange={(e) => handleExternalItemChange(index, 'weightGrams', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #ecf0f1', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ flex: '0 1 60px' }}>
                          <label className="price-external-field-label">Qty</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={item.quantity ?? ''}
                            onChange={(e) => handleExternalItemChange(index, 'quantity', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #ecf0f1', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ flex: '0 1 90px' }}>
                          <label className="price-external-field-label">Unit price (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0"
                            value={item.unitPrice ?? ''}
                            onChange={(e) => handleExternalItemChange(index, 'unitPrice', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #ecf0f1', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ flex: '0 1 80px' }}>
                          <label className="price-external-field-label">Rate (₹/g)</label>
                          <div className="price-external-rate">
                            {item.weightGrams && parseFloat(item.weightGrams) > 0 && item.unitPrice && !isNaN(parseFloat(item.unitPrice))
                              ? formatCurrency(parseFloat(item.unitPrice) / parseFloat(item.weightGrams))
                              : '—'}
                          </div>
                        </div>
                        {item.weightGrams && parseFloat(item.weightGrams) > 0 && (
                          <div style={{ flex: '0 1 90px' }}>
                            <label className="price-external-field-label">Making (₹/g)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder={defaultMakingPerGram != null ? String(defaultMakingPerGram) : 'e.g. 1150'}
                              value={item.makingChargesPerGram ?? ''}
                              onChange={(e) => handleExternalItemChange(index, 'makingChargesPerGram', e.target.value)}
                              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #ecf0f1', boxSizing: 'border-box' }}
                            />
                          </div>
                        )}
                        <div style={{ flex: '0 1 100px', display: 'flex', alignItems: 'flex-end', paddingBottom: '0.25rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', cursor: 'pointer', margin: 0 }}>
                            <input
                              type="checkbox"
                              checked={!!item.hallmark}
                              onChange={(e) => handleExternalItemChange(index, 'hallmark', e.target.checked)}
                              style={{ width: '0.9rem', height: '0.9rem' }}
                            />
                            <span>Hallmark (₹100)</span>
                          </label>
                        </div>
                        <div style={{ flex: '0 1 95px' }}>
                          <label className="price-external-field-label">Total</label>
                          <div className="price-external-total" style={{ fontWeight: 600 }}>
                            {item.quantity && item.unitPrice && !isNaN(parseFloat(item.unitPrice))
                              ? formatCurrency((parseInt(item.quantity, 10) || 1) * parseFloat(item.unitPrice))
                              : '—'}
                          </div>
                        </div>
                        <button type="button" onClick={() => removeItem(index)} className="stock-btn-delete" style={{ padding: '0.75rem 1rem', alignSelf: 'flex-end' }}>🗑️</button>
                      </div>
                    ) : (
                      <div className="billing-item-row" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div className="billing-item-select-wrap" style={{ flex: '2 1 200px', minWidth: 0 }}>
                          <select
                            value={item.stockId || ''}
                            onChange={(e) => handleItemSelect(index, e.target.value)}
                            required={!item.isBuyBack}
                            style={{ width: '100%', padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px' }}
                          >
                            <option value="">Select Item</option>
                            {stock.map(s => {
                              const mat = String(s.material || '').toLowerCase();
                              const diamondOnly = mat === 'diamond';
                              const diamondWithMetal = isDiamondItem(s) && !diamondOnly;
                              const parts = [s.articleCode || `#${s.id}`, s.articleName];
                              const ratePerGram = getDisplayRatePerGram(s);
                              const rateStr = ratePerGram != null ? `₹${Number(ratePerGram).toLocaleString('en-IN', { maximumFractionDigits: 0 })}/g` : null;
                              if (diamondOnly) {
                                parts.push('Diamond', s.carat != null ? `${s.carat} ct` : null, formatCurrency(getUnitPrice(s)));
                              } else if (diamondWithMetal) {
                                parts.push(s.material, s.weightGrams != null ? `${s.weightGrams}g` : null, s.carat != null ? (mat.includes('gold') ? `${s.carat}K` : `${s.carat}`) : null, s.diamondCarat != null ? `${s.diamondCarat} ct D` : null, rateStr || '—');
                              } else if (isSilverMetalItem(s)) {
                                parts.push(s.weightGrams != null ? `${s.weightGrams}g` : null, s.carat != null ? `${s.carat}K` : null, rateStr || '—');
                              } else {
                                parts.push(`${s.weightGrams}g`, `${s.carat}K`, rateStr || '—');
                              }
                              return (
                                <option key={s.id} value={s.id}>
                                  {parts.filter(Boolean).join(' · ')}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="billing-item-qty-wrap" style={{ flex: '0 1 100px', minWidth: 0 }}>
                          {(() => {
                            const sel = stock.find(s => s.id === parseInt(item.stockId, 10));
                            const available = sel?.quantity != null ? parseInt(sel.quantity, 10) : 999;
                            const qtyNum = parseInt(item.quantity, 10) || 0;
                            const over = qtyNum > available;
                            return (
                              <>
                                <input
                                  type="number"
                                  placeholder="Qty"
                                  value={item.quantity ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const num = parseInt(val, 10);
                                    const capped = (available < 999 && !isNaN(num) && num > available) ? String(available) : val;
                                    const newItems = [...formData.items];
                                    newItems[index] = { ...newItems[index], quantity: capped };
                                    setFormData({...formData, items: newItems});
                                  }}
                                  min={1}
                                  max={available}
                                  required
                                  style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: `2px solid ${over ? '#e74c3c' : '#ecf0f1'}`,
                                    borderRadius: '8px',
                                    boxSizing: 'border-box'
                                  }}
                                />
                                {item.stockId && (
                                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: over ? '#e74c3c' : '#64748b' }}>
                                    Available: {available}{over ? ` — max ${available}` : ''}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        {(() => {
                          const sel = stock.find(s => s.id === parseInt(item.stockId, 10));
                          const hasWeight = sel?.weightGrams != null && parseFloat(sel.weightGrams) > 0 && (isGoldMetalItem(sel) || isSilverMetalItem(sel));
                          const effUnit = sel ? getEffectiveUnitPriceForItem(item, sel) : 0;
                          const qty = parseInt(item.quantity, 10) || 1;
                          const makingPlaceholder = (sel?.makingChargesPerGram != null && sel.makingChargesPerGram > 0) ? String(sel.makingChargesPerGram) : (defaultMakingPerGram != null ? String(defaultMakingPerGram) : 'e.g. 1150');
                          return (
                            <div className="billing-item-rate-block" style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {hasWeight && (
                                <>
                                  <label className="price-external-field-label" style={{ fontSize: '0.75rem' }}>Rate (₹/g) – optional</label>
                                  <input
                                    type="number"
                                    placeholder="e.g. 20000"
                                    value={item.overrideRatePerGram ?? ''}
                                    onChange={(e) => handleItemRateOverride(index, e.target.value)}
                                    min={0}
                                    step={1}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px', boxSizing: 'border-box' }}
                                  />
                                  <label className="price-external-field-label" style={{ fontSize: '0.75rem' }}>Making (₹/g) – optional</label>
                                  <input
                                    type="number"
                                    placeholder={makingPlaceholder}
                                    value={item.makingChargesPerGram ?? ''}
                                    onChange={(e) => handleItemMakingChange(index, e.target.value)}
                                    min={0}
                                    step="0.01"
                                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px', boxSizing: 'border-box' }}
                                  />
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                                    <input
                                      type="checkbox"
                                      checked={!!item.hallmark}
                                      onChange={(e) => handleItemHallmarkChange(index, e.target.checked)}
                                      style={{ width: '1rem', height: '1rem' }}
                                    />
                                    <span>Hallmark (₹100/item)</span>
                                  </label>
                                </>
                              )}
                              {!hasWeight && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={!!item.hallmark}
                                    onChange={(e) => handleItemHallmarkChange(index, e.target.checked)}
                                    style={{ width: '1rem', height: '1rem' }}
                                  />
                                  <span>Hallmark (₹100/item)</span>
                                </label>
                              )}
                              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                                {sel && (hasWeight ? `₹${effUnit > 0 ? (effUnit / parseFloat(sel.weightGrams)).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '—'}/g × ${parseFloat(sel.weightGrams)}g × ${qty} = ${formatCurrency(effUnit * qty)}` : formatCurrency(effUnit * qty))}
                              </div>
                            </div>
                          );
                        })()}
                        <button type="button" onClick={() => removeItem(index)} className="stock-btn-delete" style={{ padding: '0.75rem 1rem', flexShrink: 0 }}>🗑️</button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="billing-add-buttons" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={addItem} className="price-action-btn secondary">+ Add Item</button>
                  <button type="button" onClick={() => { setShowQRAddModal(true); setQrScanResultMessage(null); }} className="price-action-btn secondary">📱 Add item using QR code</button>
                  <button type="button" onClick={addExternalItem} className="price-action-btn secondary">🤝 Sell item from friend (external)</button>
                  <button type="button" onClick={addBuyBackItem} className="price-action-btn secondary buyback">🪙 Customer selling gold (buy-back)</button>
                  <button type="button" onClick={addSilverBuyBackItem} className="price-action-btn secondary buyback">🥈 Customer selling silver (buy-back)</button>
                </div>
              </div>

              {showQRAddModal && (
                <div className="stock-modal-overlay" style={{ zIndex: 10002 }} onClick={() => { setShowQRAddModal(false); setQrAddInput(''); setQrScanning(false); setQrScanResultMessage(null); }}>
                  <div className="stock-modal-content billing-qr-modal-content" style={{ maxWidth: qrScanning ? '360px' : '400px' }} onClick={(e) => e.stopPropagation()}>
                    <div className="stock-form-card">
                      <div className="stock-form-header" style={{ marginBottom: '1rem' }}>
                        <h3>Add item by QR</h3>
                        <button type="button" className="stock-modal-close" onClick={() => { setShowQRAddModal(false); setQrAddInput(''); setQrScanning(false); setQrScanResultMessage(null); }} aria-label="Close">✕</button>
                      </div>
                      {qrScanning ? (
                        <>
                          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>Point the camera at the article&apos;s QR code.</p>
                          <div className="billing-qr-reader-wrap">
                            <div id="billing-qr-reader" className="billing-qr-reader" />
                            <div className="billing-qr-scan-line" aria-hidden="true" />
                          </div>
                          {qrScanResultMessage && (
                            <div role="alert" style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(201, 92, 74, 0.15)', border: '1px solid rgba(201, 92, 74, 0.5)', color: '#e07c6e', fontSize: '0.9rem', fontWeight: 600 }}>
                              ⚠ {qrScanResultMessage.text}
                            </div>
                          )}
                          {qrScanFeedback && !qrScanResultMessage && (
                            <p style={{ fontSize: '0.9rem', color: 'var(--adm-gold)', marginTop: '0.5rem', marginBottom: 0, fontWeight: 600 }}>
                              ✓ Detected: {qrScanFeedback.length > 24 ? qrScanFeedback.slice(0, 24) + '…' : qrScanFeedback} — Adding…
                            </p>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            ref={qrGalleryInputRef}
                            onChange={scanQrFromGallery}
                            style={{ display: 'none' }}
                            aria-hidden="true"
                          />
                          <div className="billing-qr-controls">
                            {qrTorchSupported && (
                              <button
                                type="button"
                                className={`billing-qr-control-btn ${qrTorchOn ? 'on' : ''}`}
                                onClick={toggleQrTorch}
                                title={qrTorchOn ? 'Turn off flash' : 'Turn on flash'}
                                aria-label={qrTorchOn ? 'Flash on' : 'Flash off'}
                              >
                                {qrTorchOn ? <BoltIconSolid className="billing-qr-icon" /> : <BoltIcon className="billing-qr-icon" />}
                              </button>
                            )}
                            <button
                              type="button"
                              className="billing-qr-control-btn"
                              onClick={() => qrGalleryInputRef.current?.click()}
                              title="Upload image to scan QR"
                              aria-label="Upload image"
                            >
                              <PhotoIcon className="billing-qr-icon" />
                            </button>
                            {qrZoomSupported && (
                              <button
                                type="button"
                                className="billing-qr-control-btn zoom"
                                onClick={cycleQrZoom}
                                title="Zoom"
                                aria-label={`Zoom ${qrZoom}x`}
                              >
                                {qrZoom}x
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button type="button" onClick={() => setQrScanning(false)} className="price-action-btn secondary">Cancel scan</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                            <strong>Scan with camera</strong> or enter <strong>Article code</strong> / <strong>Stock ID</strong> below.
                          </p>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <button type="button" onClick={() => setQrScanning(true)} className="price-action-btn" style={{ flex: 1, minWidth: 120 }}>📷 Scan with camera</button>
                          </div>
                          <input
                            type="text"
                            value={qrAddInput}
                            onChange={(e) => { setQrAddInput(e.target.value); setQrScanResultMessage(null); }}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItemByQR())}
                            placeholder="e.g. RIN-911940 or 123"
                            style={{ width: '100%', padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px', marginBottom: '1rem', boxSizing: 'border-box' }}
                            autoFocus
                          />
                          {qrScanResultMessage && (
                            <div role="alert" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(201, 92, 74, 0.15)', border: '1px solid rgba(201, 92, 74, 0.5)', color: '#e07c6e', fontSize: '0.9rem', fontWeight: 600 }}>
                              ⚠ {qrScanResultMessage.text}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => { setShowQRAddModal(false); setQrAddInput(''); setQrScanResultMessage(null); }} className="price-action-btn secondary">Cancel</button>
                            <button type="button" onClick={addItemByQR} className="price-action-btn">Add to bill</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="price-bill-summary">
                <div>
                  <span>Subtotal (items, excl. making):</span>
                  <strong>{formatCurrency(calculateSubtotalExcludingMaking() - calculateBuyBackTotal())}</strong>
                </div>
                {(() => {
                  const totalGold = calculateTotalGoldMetalAmount();
                  const totalSilver = calculateTotalSilverMetalAmount();
                  const totalDiamond = calculateTotalDiamondAmount();
                  const showBreakdown = totalGold > 0 || totalSilver > 0 || totalDiamond > 0;
                  if (!showBreakdown) return null;
                  return (
                    <>
                      {totalGold > 0 && <div><span>Gold:</span><strong>{formatCurrency(totalGold)}</strong></div>}
                      {totalSilver > 0 && <div><span>Silver:</span><strong>{formatCurrency(totalSilver)}</strong></div>}
                      {totalDiamond > 0 && <div><span>Diamond:</span><strong>{formatCurrency(totalDiamond)}</strong></div>}
                    </>
                  );
                })()}
                {calculateGoldBuyBackTotal() > 0 && (
                  <div className="price-bill-buyback">
                    <span>Gold buy-back:</span>
                    <strong>-{formatCurrency(calculateGoldBuyBackTotal())}</strong>
                  </div>
                )}
                {calculateSilverBuyBackTotal() > 0 && (
                  <div className="price-bill-buyback">
                    <span>Silver buy-back:</span>
                    <strong>-{formatCurrency(calculateSilverBuyBackTotal())}</strong>
                  </div>
                )}
                <div>
                  <span>Discount:</span>
                  <strong>-{formatCurrency(formData.discountAmount || 0)}</strong>
                </div>
                <div>
                  <span>Making Charges (per item ₹/g × g):</span>
                  <strong>{formatCurrency(effectiveMakingCharges)}</strong>
                </div>
                <div className="price-bill-total-row">
                  <span>Total:</span>
                  <span className="price-bill-total-value">{formatCurrency(finalAmount)}</span>
                </div>
                {paidAmount > 0 && (
                  <>
                    <div className="price-bill-divider">
                      <span>Paid Amount:</span>
                      <strong className="price-bill-paid">{formatCurrency(paidAmount)}</strong>
                    </div>
                    {remainingAmount > 0 && (
                      <div className="price-bill-divider">
                        <span>Remaining (Udhari):</span>
                        <strong className="price-bill-remaining">{formatCurrency(remainingAmount)}</strong>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="price-form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              <button type="submit" className="price-action-btn" disabled={loading}>
                {loading ? '⏳ Creating...' : '💾 Create Bill'}
              </button>
            </form>
          </div>
        )}

        <div className="price-table-container">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📋 Bills</h3>
          {filteredBills.length > 0 ? (
            <>
              <div className="price-table-scroll">
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Bill Number</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => (
                      <tr
                        key={bill.id}
                        onClick={() => openBillDetail(bill.id)}
                        style={{ cursor: 'pointer' }}
                        title="Click to view bill details"
                      >
                        <td style={{ fontWeight: 'bold', color: '#667eea' }}>{bill.billNumber}</td>
                        <td>{bill.customer?.name || '-'}</td>
                        <td style={{ fontWeight: 'bold' }}>{formatCurrency(bill.finalAmount)}</td>
                        <td>{bill.paymentMethod || '-'}</td>
                        <td>
                          <span className={`status-badge status-${bill.paymentStatus?.toLowerCase()}`}>
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td>{formatDate(bill.createdAt)}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); sendEmail(bill.id); }}
                              disabled={bill.emailSent}
                              className="stock-btn-edit"
                              style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                            >
                              {bill.emailSent ? '✅ Email' : '📧 Email'}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); sendWhatsApp(bill.id); }}
                              disabled={bill.whatsappSent}
                              className="stock-btn-edit"
                              style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                            >
                              {bill.whatsappSent ? '✅ WhatsApp' : '💬 WhatsApp'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-list-cards">
                {filteredBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="admin-list-card"
                    onClick={() => openBillDetail(bill.id)}
                    style={{ cursor: 'pointer' }}
                    title="Tap to view bill details"
                  >
                    <div className="admin-list-card-main">
                      <div className="admin-list-card-title" style={{ color: '#667eea' }}>#{bill.billNumber}</div>
                      <div className="admin-list-card-meta">
                        {bill.customer?.name || '-'} · {formatCurrency(bill.finalAmount)} · {bill.paymentMethod || '-'} · {formatDate(bill.createdAt)}
                      </div>
                      <span className={`status-badge status-${bill.paymentStatus?.toLowerCase()}`}>{bill.paymentStatus}</span>
                    </div>
                    <div className="admin-list-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); sendEmail(bill.id); }} disabled={bill.emailSent} className="stock-btn-edit" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                        {bill.emailSent ? '✅ Email' : '📧 Email'}
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); sendWhatsApp(bill.id); }} disabled={bill.whatsappSent} className="stock-btn-edit" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                        {bill.whatsappSent ? '✅ WhatsApp' : '💬 WhatsApp'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="price-empty-state">
              <div className="price-empty-state-icon">🧾</div>
              <h3>No Bills Yet</h3>
              <p>Start by creating your first bill</p>
            </div>
          )}

          {/* Pagination bar - Showing X-Y of Z, per page, First/Prev/Page X of Y/Next/Last */}
          {totalElements > 0 && (
            <div className="price-pagination-bar">
              <div className="price-pagination-info">
                Showing {filteredBills.length > 0 ? (currentPage * pageSize + 1) : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} bills
              </div>
              <div className="price-pagination-controls">
                <select
                  className="price-pagination-select"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(0);
                  }}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <button
                  type="button"
                  className="price-pagination-btn"
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(0)}
                >
                  First
                </button>
                <button
                  type="button"
                  className="price-pagination-btn"
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                <span style={{ color: '#2c3e50', padding: '0 0.5rem', fontWeight: 600 }}>
                  Page {currentPage + 1} of {totalPages || 1}
                </span>
                <button
                  type="button"
                  className="price-pagination-btn"
                  disabled={currentPage >= (totalPages || 1) - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
                <button
                  type="button"
                  className="price-pagination-btn"
                  disabled={currentPage >= (totalPages || 1) - 1}
                  onClick={() => handlePageChange((totalPages || 1) - 1)}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals rendered outside price-management so they stack above admin nav (z-index 10001) */}
      {(loadingBill || selectedBill) && (
            <div
              className="stock-modal-overlay"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}
              onClick={() => !loadingBill && setSelectedBill(null)}
            >
              <div
                className="stock-modal-content bill-detail-modal-content"
                style={{ position: 'relative', maxWidth: '90vw', width: '95%', maxHeight: '90vh', overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button type="button" className="receipt-modal-close" onClick={() => setSelectedBill(null)} aria-label="Close">✕</button>
                {loadingBill ? (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>⏳ Loading bill...</div>
                ) : selectedBill ? (
                  <div className="price-form-card" style={{ margin: 0 }}>
                    <div className="price-form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>Bill #{selectedBill.billNumber}</h3>
                    </div>
                    <div style={{ padding: '0 1rem 1rem' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <strong>Customer:</strong> {selectedBill.customer?.name || '-'}<br />
                        {selectedBill.customer?.phone && <><strong>Phone:</strong> {selectedBill.customer.phone}<br /></>}
                        <strong>Date:</strong> {formatDate(selectedBill.createdAt)}<br />
                        <strong>Payment:</strong>{' '}
                        {selectedBill.paymentBreakdown ? (() => {
                          try {
                            const arr = JSON.parse(selectedBill.paymentBreakdown);
                            if (Array.isArray(arr) && arr.length > 0) {
                              return arr.map((p, i) => (
                                <span key={i}>{i > 0 ? ', ' : ''}{p.method || '?'}: {formatCurrency(p.amount)}</span>
                              ));
                            }
                          } catch (_) {}
                          return selectedBill.paymentMethod || '-';
                        })() : (selectedBill.paymentMethod || '-')}
                        {' · '}<span className={`status-badge status-${selectedBill.paymentStatus?.toLowerCase()}`}>{selectedBill.paymentStatus}</span>
                      </div>
                      <div className="bill-detail-table-wrap">
                        <table className="price-table bill-detail-table" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Article Code</th>
                              <th>Carat</th>
                              <th>Diamond Ct</th>
                              <th>Qty</th>
                              <th>Rate (₹/g)</th>
                              {selectedBill.totalDiamondAmount != null && parseFloat(selectedBill.totalDiamondAmount) > 0 && (
                                <>
                                  <th>Gold/Metal</th>
                                  <th>Diamond</th>
                                </>
                              )}
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(selectedBill.items || []).map((item, i) => {
                              const diamondAmt = item.diamondAmount != null ? parseFloat(item.diamondAmount) : 0;
                              const metalAmt = (parseFloat(item.totalPrice) || 0) - diamondAmt;
                              const showBreakdown = selectedBill.totalDiamondAmount != null && parseFloat(selectedBill.totalDiamondAmount) > 0;
                              const w = parseFloat(item.weightGrams) || parseFloat(item.stock?.weightGrams) || 0;
                              const ratePerGram = w > 0 && item.unitPrice != null ? parseFloat(item.unitPrice) / w : null;
                              return (
                                <tr key={i}>
                                  <td>{item.itemName || '-'}</td>
                                  <td>{item.articleCode || (item.stock?.articleCode) || '–'}</td>
                                  <td>{item.carat != null ? String(item.carat) : (item.stock?.carat != null ? String(item.stock.carat) : '–')}</td>
                                  <td>{item.diamondCarat != null ? String(item.diamondCarat) : (item.stock?.diamondCarat != null ? String(item.stock.diamondCarat) : '–')}</td>
                                  <td>{item.quantity ?? 1}</td>
                                  <td>{ratePerGram != null ? formatCurrency(ratePerGram) : '—'}</td>
                                  {showBreakdown && (
                                    <>
                                      <td>{formatCurrency(metalAmt)}</td>
                                      <td>{formatCurrency(diamondAmt)}</td>
                                    </>
                                  )}
                                  <td>{formatCurrency(item.totalPrice)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="price-bill-summary bill-detail-summary" style={{ borderTop: '2px solid var(--adm-border-gold, rgba(201,162,39,0.35))', paddingTop: '0.75rem' }}>
                        <div><span>Subtotal (items)</span><strong>{formatCurrency(selectedBill.totalAmount)}</strong></div>
                        {selectedBill.totalDiamondAmount != null && parseFloat(selectedBill.totalDiamondAmount) > 0 && (
                          <>
                            <div><span>Gold / Metal</span><strong>{formatCurrency((parseFloat(selectedBill.totalAmount) || 0) - parseFloat(selectedBill.totalDiamondAmount))}</strong></div>
                            <div><span>Diamond</span><strong>{formatCurrency(selectedBill.totalDiamondAmount)}</strong></div>
                          </>
                        )}
                        <div><span>Discount</span><strong>-{formatCurrency(selectedBill.discountAmount || 0)}</strong></div>
                        <div><span>Making Charges</span><strong>{formatCurrency(selectedBill.makingCharges || 0)}</strong></div>
                        <div className="price-bill-total-row">
                          <span>Total</span>
                          <span className="price-bill-total-value">{formatCurrency(selectedBill.finalAmount)}</span>
                        </div>
                        {selectedBill.paidAmount != null && selectedBill.paidAmount > 0 && (
                          <div className="price-bill-divider">
                            <span>Paid</span>
                            <strong className="price-bill-paid">{formatCurrency(selectedBill.paidAmount)}</strong>
                          </div>
                        )}
                        {selectedBill.paidAmount != null && selectedBill.finalAmount != null && (parseFloat(selectedBill.paidAmount) || 0) < parseFloat(selectedBill.finalAmount) && (
                          <div className="price-bill-divider">
                            <span>Remaining (Udhari)</span>
                            <strong className="price-bill-remaining">{formatCurrency(parseFloat(selectedBill.finalAmount) - parseFloat(selectedBill.paidAmount))}</strong>
                          </div>
                        )}
                      </div>
                      {selectedBill.notes && (
                        <div className="bill-detail-notes">
                          <strong>Notes:</strong> {selectedBill.notes}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button type="button" onClick={() => setShowNormalReceipt(true)} className="stock-btn-edit">🧾 Print Normal Receipt</button>
                        <a href={`${window.location.origin}/admin/print-receipt/${selectedBill.id}/normal`} target="_blank" rel="noopener noreferrer" className="stock-btn-edit" style={{ textDecoration: 'none', color: 'inherit' }}>📱 Open Normal in new tab</a>
                        <button type="button" onClick={() => setShowGstReceipt(true)} className="stock-btn-edit">📄 Print GST Receipt</button>
                        <a href={`${window.location.origin}/admin/print-receipt/${selectedBill.id}/gst`} target="_blank" rel="noopener noreferrer" className="stock-btn-edit" style={{ textDecoration: 'none', color: 'inherit' }}>📱 Open GST in new tab</a>
                        {selectedBill.emailSent && <span className="status-badge status-paid" style={{ marginRight: '0.25rem' }}>✅ Email sent</span>}
                        <button type="button" onClick={() => sendEmail(selectedBill.id, 'NORMAL')} className="stock-btn-edit">📧 Email (Normal)</button>
                        <button type="button" onClick={() => sendEmail(selectedBill.id, 'GST')} className="stock-btn-edit">📧 Email (GST)</button>
                        {selectedBill.whatsappSent && <span className="status-badge status-paid" style={{ marginRight: '0.25rem' }}>✅ WhatsApp sent</span>}
                        <button type="button" onClick={() => sendWhatsApp(selectedBill.id, 'NORMAL')} className="stock-btn-edit">💬 WhatsApp (Normal)</button>
                        <button type="button" onClick={() => sendWhatsApp(selectedBill.id, 'GST')} className="stock-btn-edit">💬 WhatsApp (GST)</button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

      {showNormalReceipt && selectedBill && (
            <div
              className="stock-modal-overlay"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 10001, overflow: 'auto', padding: '1rem' }}
              onClick={() => setShowNormalReceipt(false)}
            >
              <div
                style={{ position: 'relative', maxWidth: '560px', width: '100%', margin: '0 auto', background: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button type="button" className="receipt-modal-close no-print" onClick={() => setShowNormalReceipt(false)} aria-label="Close">✕</button>
                <div className="no-print" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <a href={`${window.location.origin}/admin/print-receipt/${selectedBill.id}/normal`} target="_blank" rel="noopener noreferrer" className="stock-btn-edit" style={{ textDecoration: 'none', color: 'inherit' }}>📱 Open in new tab (for Print/PDF)</a>
                </div>
                <NormalReceipt bill={selectedBill} onClose={() => setShowNormalReceipt(false)} showPrintButton />
              </div>
            </div>
          )}

      {showGstReceipt && selectedBill && (
            <div
              className="stock-modal-overlay"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 10001, overflow: 'auto', padding: '1rem' }}
              onClick={() => setShowGstReceipt(false)}
            >
              <div
                style={{ position: 'relative', maxWidth: '920px', width: '100%', margin: '0 auto', background: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button type="button" className="receipt-modal-close no-print" onClick={() => setShowGstReceipt(false)} aria-label="Close">✕</button>
                <div className="no-print" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <a href={`${window.location.origin}/admin/print-receipt/${selectedBill.id}/gst`} target="_blank" rel="noopener noreferrer" className="stock-btn-edit" style={{ textDecoration: 'none', color: 'inherit' }}>📱 Open in new tab (for Print/PDF)</a>
                </div>
                <GSTReceipt bill={selectedBill} onClose={() => setShowGstReceipt(false)} showPrintButton />
              </div>
            </div>
          )}
    </div>
  );
}

export default BillingManagement;
