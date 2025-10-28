import React, { useState, useEffect } from 'react';
import { productAPI, orderAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import OrderForm from '../components/OrderForm';
import '../styles/customer.css';

const FoodOrderingApp = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (search = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await productAPI.getAllProducts(search);
      setProducts(response.data || []);
    } catch (err) {
      setError('Failed to load products');
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product, variant = null, quantity = 1) => {
    const price = variant ? variant.price : product.price;
    const itemName = variant ? `${product.name} (${variant.name})` : product.name;
    
    const cartItem = {
      id: `${product._id}-${variant?.name || 'default'}`,
      productId: product._id,
      name: itemName,
      price: price,
      quantity: quantity,
      variant: variant
    };

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === cartItem.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === cartItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, cartItem];
    });
  };

  const updateCartItem = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchTerm);
  };

  const handlePlaceOrder = async (orderData) => {
    try {
      setError('');
      
      // Convert cart items to order format
      const items = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const orderPayload = {
        items,
        ...orderData
      };

      await orderAPI.createOrder(orderPayload);
      setOrderSuccess(true);
      setCart([]);
      setShowOrderForm(false);
      setShowCart(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    }
  };

  const closeOrderSuccess = () => {
    setOrderSuccess(false);
  };

  if (orderSuccess) {
    return (
      <div className="customer-app">
        <div className="order-success-overlay">
          <div className="order-success-modal">
            <h2>🎉 Order Placed Successfully!</h2>
            <p>Thank you for your order. You will receive a confirmation email shortly.</p>
            <p>Your food will be delivered within 45 minutes.</p>
            <button 
              onClick={closeOrderSuccess}
              className="btn-primary"
            >
              Continue Shopping
            </button>
            <a href="/admin" className="admin-link">
              Admin Panel
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-app">
      {/* Header */}
      <header className="customer-header">
        <div className="container">
          <h1 className="logo">🍕 Delicious Eats</h1>
          <nav className="header-nav">
            <a href="/admin" className="admin-link">Admin Panel</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h2>Delicious Food Delivered to Your Door</h2>
            <p>Order from our amazing selection of fresh, tasty meals</p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search for your favorite food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">Search</button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container main-content">
        {error && <div className="error-message">{error}</div>}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="cart-summary">
            <span>🛒 {getTotalItems()} items - ${getTotalPrice().toFixed(2)}</span>
            <button 
              onClick={() => setShowCart(true)}
              className="btn-primary"
            >
              View Cart
            </button>
          </div>
        )}

        {/* Products Grid */}
        <section className="products-section">
          <div className="section-header">
            <h3>Our Menu</h3>
            {searchTerm && (
              <div className="search-results">
                Search results for "{searchTerm}" ({products.length} items)
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    fetchProducts('');
                  }}
                  className="clear-search"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="loading-spinner">Loading delicious food...</div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try searching for something else or check back later.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Cart Modal */}
      {showCart && (
        <Cart
          cart={cart}
          onUpdateItem={updateCartItem}
          onRemoveItem={removeFromCart}
          onClose={() => setShowCart(false)}
          onCheckout={() => {
            setShowCart(false);
            setShowOrderForm(true);
          }}
          totalPrice={getTotalPrice()}
        />
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <OrderForm
          cart={cart}
          totalPrice={getTotalPrice()}
          onSubmit={handlePlaceOrder}
          onClose={() => setShowOrderForm(false)}
        />
      )}

      {/* Footer */}
      <footer className="customer-footer">
        <div className="container">
          <p>&copy; 2025 Delicious Eats. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default FoodOrderingApp;
