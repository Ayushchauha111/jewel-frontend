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
const isSilverWithWeight = (p) =>
  p && (p.weightGrams != null && parseFloat(p.weightGrams) > 0) && String(p.material || '').toLowerCase().includes('silver');
const needsEstimatedPrice = (p) => {
  if (p.sellingPrice != null && Number(p.sellingPrice) > 0) return false;
  return (isGoldWithWeightCarat(p) || isSilverWithWeight(p));
};

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estimatedPrices, setEstimatedPrices] = useState({});
  const [diamondRatePerCarat, setDiamondRatePerCarat] = useState(null);
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

  // Fetch diamond rate for Silver+Diamond price (public)
  useEffect(() => {
    let cancelled = false;
    axios.get(`${API_URL}/rates/rate?metal=DIAMOND`).then((res) => {
      if (!cancelled && res.data?.ratePerCarat != null) setDiamondRatePerCarat(parseFloat(res.data.ratePerCarat));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Fetch estimated prices for gold and silver items without selling price (public API)
  useEffect(() => {
    if (!products.length) return;
    const toFetch = products.filter(needsEstimatedPrice);
    if (toFetch.length === 0) return;

    const goldItems = toFetch.filter(isGoldWithWeightCarat);
    const silverItems = toFetch.filter(isSilverWithWeight);

    const priceKeyGold = (w, c, mc) => `g_${w}_${c}_${mc ?? 'd'}`;
    const priceKeySilver = (w, cat, mc) => `s_${w}_${cat ?? ''}_${mc ?? 'd'}`;
    const seenGold = new Set();
    const seenSilver = new Set();
    const uniqueGold = goldItems.filter((p) => {
      const k = priceKeyGold(p.weightGrams, p.carat, p.makingChargesPerGram);
      if (seenGold.has(k)) return false;
      seenGold.add(k);
      return true;
    });
    const uniqueSilver = silverItems.filter((p) => {
      const k = priceKeySilver(p.weightGrams, p.category, p.makingChargesPerGram);
      if (seenSilver.has(k)) return false;
      seenSilver.add(k);
      return true;
    });

    const goldPromises = uniqueGold.map(async (p) => {
      try {
        const params = new URLSearchParams({ weightGrams: String(p.weightGrams), carat: String(p.carat) });
        if (p.makingChargesPerGram != null && p.makingChargesPerGram > 0) params.set('makingChargesPerGram', String(p.makingChargesPerGram));
        if (p.category) params.set('category', p.category);
        const res = await axios.get(`${API_URL}/stock/estimate-price?${params}`);
        const total = res.data?.totalPrice != null ? parseFloat(res.data.totalPrice) : null;
        return { key: priceKeyGold(p.weightGrams, p.carat, p.makingChargesPerGram), total };
      } catch (_) {
        return { key: priceKeyGold(p.weightGrams, p.carat, p.makingChargesPerGram), total: null };
      }
    });

    const silverPromises = uniqueSilver.map(async (p) => {
      try {
        const params = new URLSearchParams({ weightGrams: String(p.weightGrams) });
        if (p.makingChargesPerGram != null && p.makingChargesPerGram > 0) params.set('makingChargesPerGram', String(p.makingChargesPerGram));
        if (p.category) params.set('category', p.category);
        const res = await axios.get(`${API_URL}/stock/estimate-price-silver?${params}`);
        const total = res.data?.totalPrice != null ? parseFloat(res.data.totalPrice) : null;
        return { key: priceKeySilver(p.weightGrams, p.category, p.makingChargesPerGram), total };
      } catch (_) {
        return { key: priceKeySilver(p.weightGrams, p.category, p.makingChargesPerGram), total: null };
      }
    });

    Promise.all([...goldPromises, ...silverPromises]).then((results) => {
      const next = {};
      goldItems.forEach((p) => {
        const r = results.find((x) => x.key === priceKeyGold(p.weightGrams, p.carat, p.makingChargesPerGram));
        if (r?.total != null) next[p.id] = r.total;
      });
      silverItems.forEach((p) => {
        const r = results.find((x) => x.key === priceKeySilver(p.weightGrams, p.category, p.makingChargesPerGram));
        let total = r?.total ?? null;
        if (total != null && p.diamondCarat != null && diamondRatePerCarat != null) {
          total = Math.round((total + parseFloat(p.diamondCarat) * diamondRatePerCarat) * 100) / 100;
        }
        if (total != null) next[p.id] = total;
      });
      setEstimatedPrices((prev) => ({ ...prev, ...next }));
    });
  }, [products, diamondRatePerCarat]);

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

  const getProductImages = (product) => {
    const urls = product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : (product.imageUrl ? [product.imageUrl] : []);
    return urls.map(getImageUrl).filter(Boolean);
  };

  const [cardImageIndex, setCardImageIndex] = useState({});
  const setCardImage = (productId, index) => {
    setCardImageIndex((prev) => ({ ...prev, [productId]: index }));
  };

  const [categorySearch, setCategorySearch] = useState('');
  const filteredCategories = categorySearch.trim()
    ? categories.filter((c) => c.toLowerCase().includes(categorySearch.trim().toLowerCase()))
    : categories;

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

            <section className="catalog-filter-block catalog-filter-block--scroll">
              <h4>Category</h4>
              {categories.length > 8 && (
                <input
                  type="search"
                  placeholder="Search categories…"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="catalog-filter-search"
                  aria-label="Search categories"
                />
              )}
              <div className="catalog-filter-list-wrap">
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
                  {filteredCategories.map((cat) => (
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
                {filteredCategories.length === 0 && categorySearch.trim() && (
                  <p className="catalog-filter-no-match">No category matches "{categorySearch.trim()}"</p>
                )}
              </div>
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
                displayProducts.map((product) => {
                  const images = getProductImages(product);
                  const currentIndex = cardImageIndex[product.id] ?? 0;
                  const safeIndex = images.length ? Math.min(currentIndex, images.length - 1) : 0;
                  const showArrows = images.length > 1;
                  return (
                  <div key={product.id} className="catalog-card">
                    <div className="catalog-card-image-wrap catalog-card-carousel-wrap">
                      {images.length > 0 ? (
                        <>
                          <img
                            key={safeIndex}
                            src={images[safeIndex]}
                            alt={`${product.articleName} ${images.length > 1 ? `(${safeIndex + 1} of ${images.length})` : ''}`}
                            className="catalog-card-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const ph = e.target.nextElementSibling;
                              if (ph) ph.style.display = 'flex';
                            }}
                          />
                          {showArrows && (
                            <>
                              <button
                                type="button"
                                className="catalog-carousel-arrow catalog-carousel-arrow--prev"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCardImage(product.id, (safeIndex - 1 + images.length) % images.length); }}
                                aria-label="Previous image"
                              >
                                ‹
                              </button>
                              <button
                                type="button"
                                className="catalog-carousel-arrow catalog-carousel-arrow--next"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCardImage(product.id, (safeIndex + 1) % images.length); }}
                                aria-label="Next image"
                              >
                                ›
                              </button>
                              <div className="catalog-carousel-dots" aria-hidden>
                                {images.map((_, i) => (
                                  <span
                                    key={i}
                                    role="button"
                                    tabIndex={0}
                                    className={`catalog-carousel-dot ${i === safeIndex ? 'catalog-carousel-dot--active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCardImage(product.id, i); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCardImage(product.id, i); } }}
                                    aria-label={`Image ${i + 1}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      ) : null}
                      <div
                        className="catalog-card-placeholder"
                        style={{ display: images.length > 0 ? 'none' : 'flex' }}
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
                          : (!product.sellingPrice || Number(product.sellingPrice) <= 0) && isGoldWithWeightCarat(product)
                            ? 'Price as per current gold rate'
                            : (!product.sellingPrice || Number(product.sellingPrice) <= 0) && isSilverWithWeight(product)
                              ? 'Price as per current silver rate'
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
                  );
                })
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
