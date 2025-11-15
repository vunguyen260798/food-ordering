import React, { useEffect, useState, useRef } from 'react';

const QRPayment = ({ order, finalTotal, onClose, isPolling, customerInfo, deliveryAddress: orderDeliveryAddress }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isExpired, setIsExpired] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      handleTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleTimeExpired = () => {
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  useEffect(() => {
    if (orderDeliveryAddress) {
      console.log('Using delivery address from order:', orderDeliveryAddress);
      setDeliveryAddress(orderDeliveryAddress);
    } else {
      console.log('No delivery address object, using customer info');
      if (customerInfo && customerInfo.deliveryAddress) {
        const fallbackAddress = {
          latitude: 10.762622, 
          longitude: 106.660172,
          formattedAddress: customerInfo.deliveryAddress,
          source: 'customer_info'
        };
        setDeliveryAddress(fallbackAddress);
      }
    }
  }, [orderDeliveryAddress, customerInfo]);

  // Khởi tạo map khi có deliveryAddress và showMap = true
  useEffect(() => {
    if (deliveryAddress && showMap && !mapInitialized && mapRef.current) {
      setTimeout(() => {
        initializeMap();
      }, 300);
    }
  }, [deliveryAddress, showMap, mapInitialized]);

  // Cleanup map khi component unmount
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, []);

  const cleanupMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      setMapInitialized(false);
    }
  };

  const initializeMap = () => {
    if (!deliveryAddress || !mapRef.current || !window.L) {
      console.log('Map initialization skipped - missing requirements');
      return;
    }

    try {
      const { latitude, longitude } = deliveryAddress;
      console.log('Initializing map at:', latitude, longitude);

      // Cleanup map cũ nếu có
      if (mapInstanceRef.current) {
        cleanupMap();
      }

      // Khởi tạo map mới
      mapInstanceRef.current = window.L.map(mapRef.current, {
        zoomControl: false,
        dragging: true
      }).setView([latitude, longitude], 16);

      // Thêm zoom control
      window.L.control.zoom({
        position: 'topright'
      }).addTo(mapInstanceRef.current);
      
      // Thêm tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 10
      }).addTo(mapInstanceRef.current);

      // Tạo marker - KHÔNG cho phép kéo thả vì đây là địa chỉ đã xác định
      markerRef.current = window.L.marker([latitude, longitude], {
        draggable: false
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="text-align: center;">
            <strong>📍 Delivery Location</strong><br>
            ${deliveryAddress.formattedAddress}
          </div>`)
        .openPopup();

      // Force map resize
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);

      setMapInitialized(true);
      console.log('Map initialized with delivery address from order');

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapInitialized(false);
    }
  };

  const toggleMap = () => {
    const newShowMap = !showMap;
    setShowMap(newShowMap);
    
    if (!newShowMap) {
      cleanupMap();
    } else if (newShowMap && deliveryAddress) {
      setMapInitialized(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Tạo QR code URL
  const generateQRCodeUrl = () => {
    const walletAddress = "TQP479nwFZacteJ7Hg6hTz4pCJbi6kVRiR";
    const amount = order?.cryptoValue || finalTotal;
    
    const qrContent = `tron:${walletAddress}?amount=${amount}`;
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrContent)}`;
  };

  const handleCloseClick = () => {
    setShowConfirmClose(true);
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  if (!order) return null;

  return (
    <div className="qr-payment-overlay">
      <div className="qr-payment-modal">
        <div className="qr-payment-header">
          <h2>CRYPTO PAYMENT</h2>
          <button className="close-btn" onClick={handleCloseClick}>✕</button>
        </div>
        
        <div className="qr-payment-content">
          {/* Timer and Status */}
          <div className="payment-status">
            <div className={`timer ${isExpired ? 'expired' : 'active'}`}>
              Time remaining: {formatTime(timeLeft)}
            </div>
          </div>
          
          {/* Delivery Location Map */}
          <div className="delivery-location-section">
            <div className="section-header">
              <h4>Delivery Location</h4>
              <button 
                className="toggle-map-btn"
                onClick={toggleMap}
              >
                {showMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
              </button>
            </div>
            
            {deliveryAddress ? (
              <div className="address-display">
                <div className="address-text">
                  <strong>Delivery Address:</strong> {deliveryAddress.formattedAddress}
                </div>
                
                {showMap && (
                  <div className="map-container">
                    <div 
                      ref={mapRef} 
                      className="delivery-map"
                      style={{ height: '200px', width: '100%', marginTop: '10px' }}
                    />
                    <div className="map-note">
                      📍 This is your selected delivery location
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-address-message">
                <p>Loading delivery location...</p>
              </div>
            )}
          </div>
          
          <div className="payment-container">
            {/* QR Code */}
            <div className="qr-code-container">
              <div className="qr-code-placeholder">
                <div className="real-qr-code">
                  <img 
                    src={generateQRCodeUrl()} 
                    alt="QR Code for USDT Payment"
                    className="qr-code-image"
                  />
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="payment-details">
              <div className="payment-amount">
                <div className="amount-label">Amount to Pay</div>
                <div className="amount-value">{order.cryptoValue} USDT</div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h4>Order Summary:</h4>
            <div className="order-number">Order #: {order.orderNumber}</div>
            {order.orderItems && order.orderItems.map((item, index) => (
              <div key={index} className="order-item-summary">
                {item.productName} × {item.quantity} - ${item.productPrice}
              </div>
            ))}
            <div className="order-total">Total: ${finalTotal}</div>
          </div>
        </div>

        <div className="qr-payment-footer">
          <button 
            className="close-button"
            onClick={handleCloseClick}
          >
            Close Payment
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmClose && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-header">
              <h3>Cancel Payment?</h3>
            </div>
            <div className="confirmation-body">
              <p>Are you sure you want to cancel this payment?</p>
              <p className="warning-text">
                <strong>Warning:</strong> If you cancel, this order will not be processed.
              </p>
            </div>
            <div className="confirmation-footer">
              <button 
                className="btn-secondary"
                onClick={handleCancelClose}
              >
                Continue Payment
              </button>
              <button 
                className="btn-primary"
                onClick={handleConfirmClose}
              >
                Yes, Cancel Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRPayment;