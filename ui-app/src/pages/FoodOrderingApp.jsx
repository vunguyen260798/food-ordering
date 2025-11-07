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
  const [voucherCode, setVoucherCode] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('crypto');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentPolling, setPaymentPolling] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  const handleAddressUpdate = (address) => {
    setDeliveryAddress(address);
  };
  const handleUseCurrentLocation = () => {
    // Integration với Telegram Web App để lấy vị trí hiện tại
    if (window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      webApp.openLocation({
        latitude: webApp.initDataUnsafe.user?.location?.latitude || 0,
        longitude: webApp.initDataUnsafe.user?.location?.longitude || 0,
      }, (location) => {
        if (location) {
          setDeliveryAddress({
            latitude: location.latitude,
            longitude: location.longitude,
            formattedAddress: location.formatted_address,
            landmark: location.landmark,
            notes: location.notes
          });
        }
      });
    } else {
      // Fallback cho trình duyệt thông thường
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setDeliveryAddress({
              latitude,
              longitude,
              formattedAddress: `Current Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            alert('Unable to get your current location. Please enable location services.');
          }
        );
      }
    }
  };

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
    return () => {
      if (paymentPolling) {
        clearTimeout(paymentPolling);
      }
    };
  }, [paymentPolling]);

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
    // Create a unique ID based on product and variant
    const variantId = product.selectedVariant?._id || '';
    const uniqueId = `${product._id}-${variantId}`;
    
    const cartItem = {
      id: uniqueId,
      productId: product._id,
      name: product.selectedVariant ? `${product.name} (${product.selectedVariant.name})` : product.name,
      price: product.selectedVariant ? product.selectedVariant.price : product.price,
      quantity: 1,
      image: product.image,
      description: product.selectedVariant?.description || product.description,
      selectedVariant: product.selectedVariant
    };

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === uniqueId);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === uniqueId
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
    return getTotalPrice() + getDeliveryFee();
  };

  // Accept optional data from OrderForm (child). OrderForm calls onPlaceOrder({...})
  const handlePlaceOrder = async (orderFromForm) => {
    // Prefer delivery address from the form payload (orderFromForm.deliveryAddress)
    const addressToUse = orderFromForm?.deliveryAddress || deliveryAddress;

    if (!addressToUse) {
      alert('Please select a delivery address');
      return;
    }

    try {
      setError('');

      // Collect Telegram info if available
      let telegramInfo = null;
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        const user = tg.initDataUnsafe?.user;
        
        if (user) {
          telegramInfo = {
            userId: user.id?.toString(),
            chatId: user.id?.toString(),
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            languageCode: user.language_code,
            isPremium: user.is_premium || false,
            photoUrl: user.photo_url,
            platform: tg.platform,
            queryId: tg.initDataUnsafe?.query_id,
            authDate: tg.initDataUnsafe?.auth_date ? tg.initDataUnsafe.auth_date * 1000 : Date.now()
          };
        }
      }

      // Chuẩn bị order payload
      // Merge values: use values from form if provided, otherwise fall back to state
      const instructions = orderFromForm?.specialInstructions ?? specialInstructions;
      const voucher = orderFromForm?.voucherCode ?? voucherCode;
      const paymentMethod = orderFromForm?.paymentMethod ?? selectedPaymentMethod;

      // Chuẩn bị order payload với deliveryAddress đúng format
      const orderPayload = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          variantName: item.selectedVariant?.name || null,
          variantSku: item.selectedVariant?.sku || null,
          price: item.selectedVariant ? item.selectedVariant.price : item.price,
          name: item.name
        })),
        specialInstructions: instructions,
        voucherCode: voucher,
        total: getFinalTotal(),
        paymentMethod: selectedPaymentMethod,
        telegramInfo: telegramInfo,// Include Telegram info
        subtotal: getTotalPrice(),
        tax: getTax(),
        deliveryFee: getDeliveryFee(),
        deliveryAddress: addressToUse.formattedAddress || String(addressToUse), // CHỈ GỬI CHUỖI ĐỊA CHỈ
        deliveryLocation: { // THÊM LOCATION COORDINATES (nếu có)
          latitude: addressToUse.latitude,
          longitude: addressToUse.longitude
        },
        status: 'pending'
      };

      console.log('Placing order with address:', orderPayload.deliveryAddress); // Debug log

      // Gọi API tạo order
      const response = await orderAPI.createOrder(orderPayload);
      
      if (response.success) {
        setCurrentOrder(response.data);
        
        if (paymentMethod === 'crypto') {
          setShowQRPayment(true);
          startPaymentPolling(response.data._id);
        } else {
          setOrderSuccess(true);
          setCart([]);
          setShowOrderForm(false);
          setSpecialInstructions('');
          setVoucherCode('');
        }
      } else {
        setError(response.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Order placement error:', err);
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

  // Hàm polling để kiểm tra trạng thái thanh toán
  const startPaymentPolling = (orderId) => {
    const poll = async () => {
      try {
        const response = await orderAPI.checkOrderStatus(orderId);
        
        if (response.data.status === 'paid') {
          // Payment thành công, đóng modal và hiển thị success
          setOrderSuccess(true);
          setCart([]);
          setShowQRPayment(false);
          setShowOrderForm(false);
          setSpecialInstructions('');
          setVoucherCode('');
          setCurrentOrder(null);
          
          // Dừng polling
          if (paymentPolling) {
            clearTimeout(paymentPolling);
            setPaymentPolling(null);
          }
        } else if (response.data.status === 'pending') {
          // Tiếp tục polling sau 3 giây
          const timeoutId = setTimeout(poll, 3000);
          setPaymentPolling(timeoutId);
        } else {
          // Trạng thái khác (cancelled, expired), dừng polling
          if (paymentPolling) {
            clearTimeout(paymentPolling);
            setPaymentPolling(null);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        const timeoutId = setTimeout(poll, 5000);
        setPaymentPolling(timeoutId);
      }
    };

    poll();
  };

  const handleQRPaymentClose = () => {
    setShowQRPayment(false);
    setCurrentOrder(null);
    // Dừng polling khi đóng modal
    if (paymentPolling) {
      clearTimeout(paymentPolling);
      setPaymentPolling(null);
    }
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
          voucherCode={voucherCode}
          selectedPaymentMethod={selectedPaymentMethod}
          tax={getTax()}
          finalTotal={getFinalTotal()}
          deliveryAddress={deliveryAddress}
          onClose={() => setShowOrderForm(false)}
          onSpecialInstructionsChange={setSpecialInstructions}
          onVoucherCodeChange={setVoucherCode}
          onPaymentMethodChange={setSelectedPaymentMethod}
          onPlaceOrder={handlePlaceOrder}
          onUseCurrentLocation={handleUseCurrentLocation}
          onAddressUpdate={handleAddressUpdate}
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
          isPolling={!!paymentPolling}
        />
      )}
    </div>
  );
};

export default FoodOrderingApp;