import React, { useState, useEffect } from 'react';
import { productAPI, orderAPI } from '../services/api';
import '../styles/customer.css';

const FoodOrderingApp = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');

  // Kiểm tra theme từ localStorage và system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
    }
  }, []);

  // Áp dụng theme khi darkMode thay đổi
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      setProducts(response.data || []);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Hàm kiểm tra sản phẩm có trong giỏ hàng không
  const isProductInCart = (productId) => {
    return cart.some(item => item.productId === productId);
  };

  // Hàm lấy số lượng sản phẩm trong giỏ hàng
  const getProductQuantity = (productId) => {
    const item = cart.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const addToCart = (product) => {
    const cartItem = {
      id: product._id,
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      description: product.description
    };

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === cartItem.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === cartItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, cartItem];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
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

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getDeliveryFee = () => {
    return 0; // Free delivery
  };

  const getTax = () => {
    return getTotalPrice() * 0.08; // 8% tax
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getDeliveryFee() + getTax();
  };

  const handlePlaceOrder = async () => {
    try {
      setError('');

      if (selectedPaymentMethod === 'crypto') {
        setShowQRPayment(true);
        return;
      }

      const orderPayload = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        specialInstructions,
        total: getFinalTotal(),
        paymentMethod: selectedPaymentMethod
      };

      await orderAPI.createOrder(orderPayload);
      
      setOrderSuccess(true);
      setCart([]);
      setShowOrderForm(false);
      setShowQRPayment(false);
      setSpecialInstructions('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    }
  };

  const handleQRPaymentSuccess = async () => {
    try {
      const orderPayload = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        specialInstructions,
        total: getFinalTotal(),
        paymentMethod: 'crypto'
      };

      await orderAPI.createOrder(orderPayload);
      
      setOrderSuccess(true);
      setCart([]);
      setShowOrderForm(false);
      setShowQRPayment(false);
      setSpecialInstructions('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    }
  };

  const closeOrderSuccess = () => {
    setOrderSuccess(false);
  };

  // Product Card Component
  const ProductCard = ({ product }) => {
    const inCart = isProductInCart(product._id);
    const quantity = getProductQuantity(product._id);

    return (
      <div 
        className={`product-card ${inCart ? 'selected' : ''}`}
        onClick={() => addToCart(product)}
      >
        <div className="product-image">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
        </div>
        <div className="product-name">{product.name}</div>
        <div className="product-price">${product.price.toFixed(2)}</div>
        
        {inCart && (
          <div className="product-quantity-badge">
            {quantity}
          </div>
        )}
      </div>
    );
  };

  // Cart Modal Component
  const CartModal = () => (
    <div className="cart-modal-overlay">
      <div className="cart-modal">
        <div className="cart-header">
          <h3>Your Cart</h3>
          <button className="close-btn" onClick={() => setShowCart(false)}>✕</button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">Your cart is empty</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                    
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">${item.price.toFixed(2)}</div>
                  </div>
                </div>
                <div className="item-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateCartItem(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateCartItem(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              Total: <strong>${getTotalPrice().toFixed(2)}</strong>
            </div>
            <button 
              className="checkout-btn" 
              onClick={() => {
                setShowCart(false);
                setShowOrderForm(true);
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Order Form Component
  const OrderForm = () => (
    <div className="order-form-overlay">
      <div className="order-form-modal">
        <div className="order-form-header">
          <h2>YOUR ORDER</h2>
          <button className="close-btn" onClick={() => setShowOrderForm(false)}>✕</button>
        </div>
        
        <div className="order-form-content">
          {/* Order Items */}
          <div className="order-items-section">
            <div className="section-header">
              <span className="section-title">Ealt</span>
              <button className="edit-button">Edit</button>
            </div>
            {cart.map(item => (
              <div key={item.id} className="order-item">
                <div className="order-item-main">
                  <div className="order-item-info">
                    <div className="order-item-name">{item.name} {item.quantity}x</div>
                    <div className="order-item-price">${item.price.toFixed(2)}</div>
                  </div>
                  <div className="order-item-description">
                    {item.description || 'Product description'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Special Instructions */}
          <div className="special-instructions-section">
            <div className="section-title">Add comment...</div>
            <textarea
              className="special-instructions-input"
              placeholder="Any special requests, details, final wishes etc."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows="3"
            />
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="summary-row">
              <span>Free Delivery</span>
              <span>$0.00</span>
            </div>
            <div className="summary-row tax-row">
              <span>Tax</span>
              <span>${getTax().toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>${getFinalTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="payment-method-section">
            <div className="section-title">Payment Method</div>
            <div className="payment-methods">
              <div 
                className={`payment-method ${selectedPaymentMethod === 'stripe' ? 'selected' : ''}`}
                onClick={() => setSelectedPaymentMethod('stripe')}
              >
                <div className="payment-method-info">
                  <div className="payment-method-name">Stripe</div>
                  <div className="payment-method-description">Payment provider</div>
                </div>
                <div className="payment-method-icon">💳</div>
              </div>
              
              <div 
                className={`payment-method ${selectedPaymentMethod === 'crypto' ? 'selected' : ''}`}
                onClick={() => setSelectedPaymentMethod('crypto')}
              >
                <div className="payment-method-info">
                  <div className="payment-method-name">Crypto QR</div>
                  <div className="payment-method-description">Blockchain payment</div>
                </div>
                <div className="payment-method-icon">🔗</div>
              </div>
            </div>
          </div>

          {/* Alternative Payment Methods */}
          <div className="alt-payment-methods">
            <div className="section-title">Phương thức thanh toán đa dạng</div>
            <div className="payment-options">
              <div className="payment-option">Visa</div>
              <div className="payment-option">Crypto QR</div>
              <div className="payment-option">Apple Pay</div>
            </div>
          </div>
        </div>

        <div className="order-form-footer">
          <button 
            className="pay-button" 
            onClick={handlePlaceOrder}
          >
            PAY ${getFinalTotal().toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );

  // QR Payment Component
  const QRPayment = () => (
    <div className="qr-payment-overlay">
      <div className="qr-payment-modal">
        <div className="qr-payment-header">
          <h2>CRYPTO PAYMENT</h2>
          <button className="close-btn" onClick={() => setShowQRPayment(false)}>✕</button>
        </div>
        
        <div className="qr-payment-content">
          <div className="qr-code-container">
            <div className="qr-code-placeholder">
              <div className="qr-code">
                <div className="qr-pattern">
                  <div className="qr-corner top-left"></div>
                  <div className="qr-corner top-right"></div>
                  <div className="qr-corner bottom-left"></div>
                  <div className="qr-dots">
                    {[...Array(25)].map((_, i) => (
                      <div key={i} className="qr-dot" style={{
                        animationDelay: `${i * 0.1}s`
                      }}></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="scan-text">Scan QR Code to Pay</div>
            </div>
          </div>

          <div className="payment-details">
            <div className="payment-amount">
              <div className="amount-label">Amount to Pay</div>
              <div className="amount-value">${getFinalTotal().toFixed(2)}</div>
            </div>
            
            <div className="crypto-address">
              <div className="address-label">Wallet Address</div>
              <div className="address-value">
                0x742d35Cc6634C0532925a3b8D
                <button className="copy-button">Copy</button>
              </div>
            </div>

            <div className="payment-instructions">
              <h4>Payment Instructions:</h4>
              <ol>
                <li>Scan QR code with your crypto wallet</li>
                <li>Send exact amount: ${getFinalTotal().toFixed(2)}</li>
                <li>Wait for transaction confirmation</li>
                <li>Order will be processed automatically</li>
              </ol>
            </div>
          </div>

          <div className="supported-cryptos">
            <div className="section-title">Supported Cryptocurrencies</div>
            <div className="crypto-list">
              <div className="crypto-item">BTC</div>
              <div className="crypto-item">ETH</div>
              <div className="crypto-item">USDT</div>
              <div className="crypto-item">BNB</div>
              <div className="crypto-item">SOL</div>
            </div>
          </div>
        </div>

        <div className="qr-payment-footer">
          <button 
            className="back-button"
            onClick={() => setShowQRPayment(false)}
          >
            Back to Payment
          </button>
          <button 
            className="confirm-button"
            onClick={handleQRPaymentSuccess}
          >
            I've Paid
          </button>
        </div>
      </div>
    </div>
  );

  if (orderSuccess) {
    return (
      <div className="mobile-app">
        <div className="order-success-overlay">
          <div className="order-success-modal">
            <h2>🎉 Order Placed Successfully!</h2>
            <p>Thank you for your order. We'll contact you shortly to confirm.</p>
            <p>Estimated delivery: 45 minutes</p>
            <button 
              onClick={closeOrderSuccess}
              className="checkout-btn"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-app">
      <header className="app-header">
        <div className="header-content">
          <h1>🍕 Food Ordering</h1>
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>

      {cart.length > 0 && (
        <button className="cart-button" onClick={() => setShowCart(true)}>
          <span>View Cart</span>
          <span className="cart-badge">{getTotalItems()} items</span>
        </button>
      )}

      {showCart && <CartModal />}
      {showOrderForm && <OrderForm />}
      {showQRPayment && <QRPayment />}
    </div>
  );
};

export default FoodOrderingApp;