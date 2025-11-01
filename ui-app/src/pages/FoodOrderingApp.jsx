import React, { useState, useEffect } from 'react';
import { productAPI, orderAPI } from '../services/api';
import '../styles/customer.css';

// Import các components
import Header from '../components/Header';
import ProductGrid from '../components/ProductGrid';
import CartButton from '../components/CardButton';
import CartModal from '../components/CartModal';
import OrderForm from '../components/OrderForm';
import QRPayment from '../components/QRPayment';
import OrderSuccess from '../components/OrderSuccess';

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('crypto');
  const [currentOrder, setCurrentOrder] = useState(null);

  // Kiểm tra theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
    }
  }, []);

  // Áp dụng theme
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

  // Cart functions
  const isProductInCart = (productId) => {
    return cart.some(item => item.productId === productId);
  };

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
    return 0;
  };

  const getTax = () => {
    return getTotalPrice() * 0.08;
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getDeliveryFee() + getTax();
  };

  const handlePlaceOrder = async () => {
    try {
      setError('');

      // Chuẩn bị order payload
      const orderPayload = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        specialInstructions,
        total: getFinalTotal(),
        paymentMethod: selectedPaymentMethod
      };

      // Gọi API tạo order
      const response = await orderAPI.createOrder(orderPayload);
      
      if (response.success) {
        setCurrentOrder(response.data);
        
        if (selectedPaymentMethod === 'crypto') {
          setShowQRPayment(true);
        } else {
          setOrderSuccess(true);
          setCart([]);
          setShowOrderForm(false);
          setSpecialInstructions('');
        }
      } else {
        setError(response.message || 'Failed to create order');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    }
  };

  const handleQRPaymentSuccess = async () => {
    try {
      // Polling để kiểm tra trạng thái thanh toán
      const checkPaymentStatus = async () => {
        if (!currentOrder) return;
        
        const response = await orderAPI.checkOrderStatus(currentOrder._id);
        
        if (response.data.status === 'paid') {
          setOrderSuccess(true);
          setCart([]);
          setShowOrderForm(false);
          setShowQRPayment(false);
          setSpecialInstructions('');
          setCurrentOrder(null);
        } else {
          // Tiếp tục polling sau 5 giây
          setTimeout(checkPaymentStatus, 5000);
        }
      };

      // Bắt đầu polling
      checkPaymentStatus();
      
    } catch (err) {
      setError('Error checking payment status');
    }
  };

  const closeOrderSuccess = () => {
    setOrderSuccess(false);
    setCurrentOrder(null);
  };

  if (orderSuccess) {
    return (
      <OrderSuccess onClose={closeOrderSuccess} />
    );
  }

  return (
    <div className="mobile-app">
      <Header darkMode={darkMode} onToggleTheme={toggleTheme} />
      
      <main className="app-main">
        {error && <div className="error-message">{error}</div>}

        <ProductGrid
          products={products}
          loading={loading}
          isProductInCart={isProductInCart}
          getProductQuantity={getProductQuantity}
          onAddToCart={addToCart}
        />
      </main>

      {cart.length > 0 && (
        <CartButton 
          totalItems={getTotalItems()} 
          onShowCart={() => setShowCart(true)} 
        />
      )}

      {showCart && (
        <CartModal
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateCartItem={updateCartItem}
          onRemoveFromCart={removeFromCart}
          totalPrice={getTotalPrice()}
          onProceedToCheckout={() => {
            setShowCart(false);
            setShowOrderForm(true);
          }}
        />
      )}

      {showOrderForm && (
        <OrderForm
          cart={cart}
          specialInstructions={specialInstructions}
          selectedPaymentMethod={selectedPaymentMethod}
          tax={getTax()}
          finalTotal={getFinalTotal()}
          onClose={() => setShowOrderForm(false)}
          onSpecialInstructionsChange={setSpecialInstructions}
          onPaymentMethodChange={setSelectedPaymentMethod}
          onPlaceOrder={handlePlaceOrder}
        />
      )}

      {showQRPayment && currentOrder && (
        <QRPayment
          order={currentOrder}
          finalTotal={getFinalTotal()}
          onClose={() => {
            setShowQRPayment(false);
            setCurrentOrder(null);
          }}
          onPaymentSuccess={handleQRPaymentSuccess}
        />
      )}
    </div>
  );
};

export default FoodOrderingApp;