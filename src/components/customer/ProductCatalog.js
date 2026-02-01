import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CustomerNav from './CustomerNav';
import './CustomerHome.css';
import './ProductCatalog.css';

const API_URL = '/api';
const MATERIAL_OPTIONS = ['Gold', 'Silver', 'Diamond', 'Gemstone', 'Other'];
const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
];

const isGoldWithWeightCarat = (p) =>
  p && (p.weightGrams != null && p.weightGrams > 0) && (p.carat != null && p.carat > 0) && String(p.material || '').toLowerCase().includes('gold');
const needsEstimatedPrice = (p) => isGoldWithWeightCarat(p) && (!p.sellingPrice || Number(p.sellingPrice) <= 0);

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estimatedPrices, setEstimatedPrices] = useState({});
  const [addFeedback, setAddFeedback] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const category = searchParams.get('category') || '';
  const material = searchParams.get('material') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/stock/categories`);
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (_) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [category, material, search, sort]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(saved);
    } catch (_) {}
  }, []);

  // Fetch estimated prices for gold items without selling price (public API)
  useEffect(() => {
    if (!products.length) return;
    const toFetch = products.filter(needsEstimatedPrice);
    if (toFetch.length === 0) return;
    const priceKey = (w, c, mc) => `${w}_${c}_${mc ?? 'd'}`;
    const seen = new Set();
    const unique = toFetch.filter((p) => {
      const k = priceKey(p.weightGrams, p.carat, p.makingChargesPerGram);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    Promise.all(
      unique.map(async (p) => {
        try {
          const params = new URLSearchParams({ weightGrams: String(p.weightGrams), carat: String(p.carat) });
          if (p.makingChargesPerGram != null && p.makingChargesPerGram > 0) params.set('makingChargesPerGram', String(p.makingChargesPerGram));
          const res = await axios.get(`${API_URL}/stock/estimate-price?${params}`);
          const total = res.data?.totalPrice != null ? parseFloat(res.data.totalPrice) : null;
          return { key: priceKey(p.weightGrams, p.carat, p.makingChargesPerGram), total };
        } catch (_) {
          return { key: priceKey(p.weightGrams, p.carat, p.makingChargesPerGram), total: null };
        }
      })
    ).then((results) => {
      const next = {};
      toFetch.forEach((p) => {
        const r = results.find((x) => x.key === priceKey(p.weightGrams, p.carat, p.makingChargesPerGram));
        if (r?.total != null) next[p.id] = r.total;
      });
      setEstimatedPrices((prev) => ({ ...prev, ...next }));
    });
  }, [products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: 0, size: 200 });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (material) params.set('material', material);
      const response = await axios.get(`${API_URL}/stock?${params}`);
      const data = response.data?.content ?? (Array.isArray(response.data) ? response.data : []);
      const available = data.filter(s => s.status === 'AVAILABLE' || s.status === null);
      setProducts(available);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const applySort = (sorted) => {
    if (sort === sorted) return;
    const next = new URLSearchParams(searchParams);
    if (sorted) next.set('sort', sorted);
    else next.delete('sort');
    setSearchParams(next);
  };

  const getSortPrice = (p) => estimatedPrices[p.id] != null ? estimatedPrices[p.id] : (Number(p.sellingPrice) || 0);
  let displayProducts = [...products];
  if (sort === 'price_asc') displayProducts.sort((a, b) => getSortPrice(a) - getSortPrice(b));
  else if (sort === 'price_desc') displayProducts.sort((a, b) => getSortPrice(b) - getSortPrice(a));
  else if (sort === 'name_asc') displayProducts.sort((a, b) => (a.articleName || '').localeCompare(b.articleName || ''));
  else if (sort === 'name_desc') displayProducts.sort((a, b) => (b.articleName || '').localeCompare(a.articleName || ''));

  const addToCart = (product) => {
    const unitPrice = estimatedPrices[product.id] != null ? estimatedPrices[product.id] : (Number(product.sellingPrice) || 0);
    const existingItem = cart.find(item => item.id === product.id);
    let nextCart;
    if (existingItem) {
      nextCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1, sellingPrice: item.sellingPrice ?? unitPrice } : item
      );
    } else {
      nextCart = [...cart, { ...product, quantity: 1, sellingPrice: product.sellingPrice ?? unitPrice }];
    }
    setCart(nextCart);
    localStorage.setItem('cart', JSON.stringify(nextCart));
    setAddFeedback(product.id);
    setTimeout(() => setAddFeedback(null), 2000);
  };

  const goToCheckout = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/checkout');
  };

  const cartCount = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${window.location.protocol}//${window.location.hostname}:8000${url}`;
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = category || material || sort;

  return (
    <div className="customer-home catalog-page">
      <CustomerNav cartCount={cartCount} />

      <div className="catalog-layout">
        {/* Left sidebar - Amazon-like filters */}
        <aside className="catalog-sidebar">
          <div className="catalog-sidebar-inner">
            <div className="catalog-sidebar-header">
              <h3>Filters</h3>
              {hasActiveFilters && (
                <button type="button" className="catalog-clear-filters" onClick={clearFilters}>
                  Clear all
                </button>
              )}
            </div>

            <section className="catalog-filter-block">
              <h4>Category</h4>
              <ul className="catalog-filter-list">
                <li>
                  <button
                    type="button"
                    className={!category ? 'catalog-filter-item catalog-filter-item--active' : 'catalog-filter-item'}
                    onClick={() => applyFilter('category', '')}
                  >
                    All
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      className={category === cat ? 'catalog-filter-item catalog-filter-item--active' : 'catalog-filter-item'}
                      onClick={() => applyFilter('category', cat)}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="catalog-filter-block">
              <h4>Material</h4>
              <ul className="catalog-filter-list">
                <li>
                  <button
                    type="button"
                    className={!material ? 'catalog-filter-item catalog-filter-item--active' : 'catalog-filter-item'}
                    onClick={() => applyFilter('material', '')}
                  >
                    All
                  </button>
                </li>
                {MATERIAL_OPTIONS.map((mat) => (
                  <li key={mat}>
                    <button
                      type="button"
                      className={material === mat ? 'catalog-filter-item catalog-filter-item--active' : 'catalog-filter-item'}
                      onClick={() => applyFilter('material', mat)}
                    >
                      {mat}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>

        {/* Main content */}
        <main className="catalog-main">
          <div className="catalog-toolbar">
            <h1 className="catalog-title">
              {search ? `Search: "${search}"` : category || material ? 'Products' : 'All Products'}
            </h1>
            <div className="catalog-toolbar-right">
              <span className="catalog-count">{displayProducts.length} items</span>
              <label className="catalog-sort-label">
                <span>Sort by</span>
                <select
                  className="catalog-sort-select"
                  value={sort}
                  onChange={(e) => applySort(e.target.value)}
                  aria-label="Sort products"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value || 'featured'} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="catalog-loading">
              <div className="catalog-spinner" />
              <p>Loading products…</p>
            </div>
          ) : (
            <div className="catalog-grid">
              {displayProducts.length > 0 ? (
                displayProducts.map((product) => (
                  <div key={product.id} className="catalog-card">
                    <div className="catalog-card-image-wrap">
                      {product.imageUrl ? (
                        <img
                          src={getImageUrl(product.imageUrl)}
                          alt={product.articleName}
                          className="catalog-card-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const ph = e.target.nextElementSibling;
                            if (ph) ph.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="catalog-card-placeholder"
                        style={{ display: product.imageUrl ? 'none' : 'flex' }}
                      >
                        <span>No Image</span>
                      </div>
                    </div>
                    <div className="catalog-card-body">
                      <h3 className="catalog-card-title">{product.articleName}</h3>
                      <div className="catalog-card-specs">
                        <span>{product.weightGrams}g</span>
                        <span>•</span>
                        <span>{product.carat}K</span>
                        {product.material && (
                          <>
                            <span>•</span>
                            <span>{product.material}</span>
                          </>
                        )}
                      </div>
                      <p className="catalog-card-price">
                        {estimatedPrices[product.id] != null
                          ? `₹${Number(estimatedPrices[product.id]).toLocaleString('en-IN')}`
                          : product.weightGrams && product.carat && (!product.sellingPrice || Number(product.sellingPrice) <= 0) && String(product.material || '').toLowerCase().includes('gold')
                            ? 'Price as per current gold rate'
                            : `₹${Number(product.sellingPrice || 0).toLocaleString('en-IN')}`}
                      </p>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="catalog-card-btn"
                      >
                        Add to Cart
                      </button>
                      {addFeedback === product.id && (
                        <p className="catalog-card-added" role="status">Added to cart</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="catalog-empty">
                  <p>No products match your filters. Try adjusting or clear filters.</p>
                  <button type="button" className="catalog-clear-filters" onClick={clearFilters}>
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ProductCatalog;
