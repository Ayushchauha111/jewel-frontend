import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CustomerNav from './CustomerNav';
import './CustomerHome.css';

const API_URL = '/api';

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    fetchProducts();
  }, [category, search]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(saved);
    } catch (_) {}
  }, []);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({ page: 0, size: 100 });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const response = await axios.get(`${API_URL}/stock?${params}`);
      const data = response.data?.content ?? (Array.isArray(response.data) ? response.data : []);
      const available = data.filter(s => s.status === 'AVAILABLE' || s.status === null);
      setProducts(available);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
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

  return (
    <div className="customer-home">
      <CustomerNav cartCount={cartCount} />

      <div className="featured-section">
        <h2>All Products</h2>
        <div className="products-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="product-card">
                {product.imageUrl ? (
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.articleName}
                    className="product-image"
                    onError={(e) => {
                      console.error('Image load error for:', product.imageUrl);
                      e.target.style.display = 'none';
                      // Show placeholder if image fails
                      const placeholder = e.target.parentElement.querySelector('.product-image-placeholder');
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div 
                  className="product-image-placeholder" 
                  style={{ display: product.imageUrl ? 'none' : 'flex' }}
                >
                  No Image
                </div>
                <div className="product-info">
                  <h3>{product.articleName}</h3>
                  <p className="product-specs">Weight: {product.weightGrams}g</p>
                  <p className="product-specs">Carat: {product.carat}</p>
                  {product.purityPercentage && Number(product.purityPercentage) <= 100 && (
                    <p className="product-specs">Purity: {Number(product.purityPercentage).toFixed(1)}%</p>
                  )}
                  <p className="price">₹{product.sellingPrice}</p>
                  <button onClick={() => addToCart(product)} className="add-to-cart-button">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="home-no-products">No products available. Please check back later.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCatalog;
