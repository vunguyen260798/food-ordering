import React, { useState, useEffect, useRef } from 'react';

const OrderForm = ({
  cart,
  specialInstructions,
  voucherCode,
  selectedPaymentMethod,
  tax,
  finalTotal,
  onClose,
  onSpecialInstructionsChange,
  onVoucherCodeChange,
  onPaymentMethodChange,
  onPlaceOrder
}) => {
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    streetNumber: '',
    streetName: '',
    ward: '',
    district: '',
    city: ''
  });
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Tự động lấy địa chỉ khi component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Khởi tạo map khi có deliveryAddress và showMap = true
  useEffect(() => {
    if (deliveryAddress && showMap && !mapInitialized && mapRef.current) {
      setTimeout(() => {
        initializeMap();
      }, 300);
    }
  }, [deliveryAddress, showMap, mapInitialized]);

  // Cập nhật address details khi deliveryAddress thay đổi
  useEffect(() => {
    if (deliveryAddress && deliveryAddress.addressDetails) {
      setAddressDetails(deliveryAddress.addressDetails);
    }
  }, [deliveryAddress]);

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

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      const position = await getBrowserLocation();
      console.log('Location obtained:', position);
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const getBrowserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error('Geolocation is not supported');
        console.error(error);
        reject(error);
        return;
      }

      console.log('Requesting geolocation...');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Geolocation success:', latitude, longitude);
          
          try {
            const address = await getDetailedAddress(latitude, longitude);
            setDeliveryAddress(address);
            resolve(address);
          } catch (error) {
            console.error('Detailed address lookup failed:', error);
            const address = {
              latitude,
              longitude,
              formattedAddress: `Current Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
              source: 'browser_geolocation',
              addressDetails: {
                streetNumber: '',
                streetName: '',
                ward: '',
                district: '',
                city: ''
              }
            };
            setDeliveryAddress(address);
            resolve(address);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Unknown error';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  };

  // Hàm lấy địa chỉ chi tiết từ tọa độ
  const getDetailedAddress = async (lat, lng) => {
    try {
      console.log('Getting detailed address for:', lat, lng);
      
      // Sử dụng Nominatim (OpenStreetMap) để lấy địa chỉ chi tiết
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=vi`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding API failed');
      }
      
      const data = await response.json();
      console.log('Detailed geocoding result:', data);
      
      if (data && data.address) {
        const address = data.address;
        
        // Trích xuất thông tin địa chỉ chi tiết
        const addressDetails = {
          streetNumber: address.house_number || address.house_name || '',
          streetName: address.road || address.street || address.pedestrian || '',
          ward: address.suburb || address.village || address.neighbourhood || '',
          district: address.city_district || address.district || '',
          city: address.city || address.town || address.county || '',
          state: address.state || '',
          country: address.country || '',
          postcode: address.postcode || ''
        };

        // Tạo formatted address
        const addressParts = [];
        if (addressDetails.streetNumber && addressDetails.streetName) {
          addressParts.push(`${addressDetails.streetNumber} ${addressDetails.streetName}`);
        } else if (addressDetails.streetName) {
          addressParts.push(addressDetails.streetName);
        }
        if (addressDetails.ward) addressParts.push(addressDetails.ward);
        if (addressDetails.district) addressParts.push(addressDetails.district);
        if (addressDetails.city) addressParts.push(addressDetails.city);
        if (addressDetails.country) addressParts.push(addressDetails.country);

        const formattedAddress = addressParts.join(', ') || data.display_name || `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`;

        return {
          latitude: lat,
          longitude: lng,
          formattedAddress,
          source: 'detailed_geocoding',
          addressDetails,
          rawAddress: data
        };
      }
      
      // Fallback nếu không có dữ liệu địa chỉ chi tiết
      return {
        latitude: lat,
        longitude: lng,
        formattedAddress: `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
        source: 'basic_geocoding',
        addressDetails: {
          streetNumber: '',
          streetName: '',
          ward: '',
          district: '',
          city: '',
          state: '',
          country: '',
          postcode: ''
        }
      };
      
    } catch (error) {
      console.error('Detailed address lookup error:', error);
      throw error;
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

      // Tạo draggable marker
      markerRef.current = window.L.marker([latitude, longitude], {
        draggable: true
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="text-align: center;">
            <strong>📍 Delivery Location</strong><br>
            ${deliveryAddress.formattedAddress}
          </div>
        `)
        .openPopup();

      // Sự kiện khi kéo thả marker
      markerRef.current.on('dragend', async function(event) {
        const marker = event.target;
        const position = marker.getLatLng();
        
        console.log('Marker dragged to:', position.lat, position.lng);
        
        // Hiển thị loading
        marker.bindPopup(`
          <div style="text-align: center;">
            <strong>📍 Updating Address...</strong><br>
            Please wait...
          </div>
        `).openPopup();

        try {
          // Lấy địa chỉ chi tiết cho vị trí mới
          const newAddress = await getDetailedAddress(position.lat, position.lng);
          
          // Cập nhật delivery address
          setDeliveryAddress(newAddress);
          
          // Cập nhật popup với thông tin mới
          marker.bindPopup(`
            <div style="text-align: center;">
              <strong>📍 Delivery Location</strong><br>
              ${newAddress.formattedAddress}
            </div>
          `).openPopup();

          console.log('Address updated after drag:', newAddress);

        } catch (error) {
          console.error('Error updating address after drag:', error);
          marker.bindPopup(`
            <div style="text-align: center;">
              <strong>📍 Delivery Location</strong><br>
              Error updating address<br>
              Lat: ${position.lat.toFixed(6)}, Lng: ${position.lng.toFixed(6)}
            </div>
          `).openPopup();
        }
      });

      // Sự kiện click trên map để di chuyển marker
      mapInstanceRef.current.on('click', async function(event) {
        const { lat, lng } = event.latlng;
        
        // Di chuyển marker đến vị trí click
        markerRef.current.setLatLng([lat, lng]);
        
        // Hiển thị loading
        markerRef.current.bindPopup(`
          <div style="text-align: center;">
            <strong>📍 Updating Address...</strong><br>
            Please wait...
          </div>
        `).openPopup();

        try {
          // Lấy địa chỉ chi tiết cho vị trí mới
          const newAddress = await getDetailedAddress(lat, lng);
          
          // Cập nhật delivery address
          setDeliveryAddress(newAddress);
          
          // Cập nhật popup với thông tin mới
          markerRef.current.bindPopup(`
            <div style="text-align: center;">
              <strong>📍 Delivery Location</strong><br>
              ${newAddress.formattedAddress}
            </div>
          `).openPopup();

          console.log('Address updated after click:', newAddress);

        } catch (error) {
          console.error('Error updating address after click:', error);
          markerRef.current.bindPopup(`
            <div style="text-align: center;">
              <strong>📍 Delivery Location</strong><br>
              Error updating address<br>
              Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}
            </div>
          `).openPopup();
        }
      });

      // Force map resize
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);

      setMapInitialized(true);
      console.log('Map initialized successfully with draggable marker');

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapInitialized(false);
    }
  };

  const toggleMap = () => {
    const newShowMap = !showMap;
    setShowMap(newShowMap);
    
    if (newShowMap && deliveryAddress && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  };

  const handleRetryLocation = async () => {
    setIsGettingLocation(true);
    try {
      await getBrowserLocation();
    } catch (error) {
      console.error('Error retrying location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleAddressDetailChange = (field, value) => {
    setAddressDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAddressDetails = () => {
    if (deliveryAddress) {
      const updatedAddress = {
        ...deliveryAddress,
        addressDetails: addressDetails,
        formattedAddress: formatAddressFromDetails(addressDetails)
      };
      setDeliveryAddress(updatedAddress);
      alert('Address details updated successfully!');
    }
  };

  const formatAddressFromDetails = (details) => {
    const parts = [];
    if (details.streetNumber && details.streetName) {
      parts.push(`${details.streetNumber} ${details.streetName}`);
    } else if (details.streetName) {
      parts.push(details.streetName);
    }
    if (details.ward) parts.push(details.ward);
    if (details.district) parts.push(details.district);
    if (details.city) parts.push(details.city);
    if (details.country) parts.push(details.country);
    
    return parts.join(', ') || 'Custom Address';
  };

  const handlePlaceOrder = () => {
    if (!deliveryAddress) {
      alert('Please wait while we get your location...');
      return;
    }
    
    // Kết hợp address details đã chỉnh sửa
    const finalDeliveryAddress = {
      ...deliveryAddress,
      addressDetails: addressDetails,
      formattedAddress: formatAddressFromDetails(addressDetails)
    };
    
    console.log('OrderForm: Sending delivery address to parent:', finalDeliveryAddress);
    
    onPlaceOrder({
      deliveryAddress: finalDeliveryAddress,
      specialInstructions,
      voucherCode,
      paymentMethod: selectedPaymentMethod
    });
  };

  return (
    <div className="order-form-overlay">
      <div className="order-form-modal">
        <div className="order-form-header">
          <h2>YOUR ORDER</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="order-form-content">
          {/* Delivery Address */}
          <div className="delivery-address-section">
            <div className="section-header">
              <span className="section-title">Delivery Address</span>
              <div className="address-actions">
                <button 
                  className="current-location-btn"
                  onClick={handleRetryLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? '🔄 Getting Location...' : '📍 Update Location'}
                </button>
                {deliveryAddress && (
                  <button 
                    className="toggle-map-btn"
                    onClick={toggleMap}
                  >
                    {showMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
                  </button>
                )}
              </div>
            </div>
            
            {isGettingLocation ? (
              <div className="location-loading">
                <div className="loading-spinner"></div>
                <p>Getting your current location...</p>
                <p className="location-hint">Please allow location access in your browser</p>
              </div>
            ) : deliveryAddress ? (
              <div className="address-display">
                <div className="address-main-info">
                  <div className="address-icon">📍</div>
                  <div className="address-text-content">
                    <div className="address-text">
                      {deliveryAddress.formattedAddress}
                    </div>
                    <div className="address-source">
                      Detected via {deliveryAddress.source}
                    </div>
                  </div>
                </div>

                {/* Interactive Map */}
                {showMap && (
                  <div className="map-container">
                    <div 
                      ref={mapRef} 
                      className="delivery-map"
                      key={`map-${deliveryAddress.latitude}-${deliveryAddress.longitude}`}
                    />
                    <div className="map-note">
                      📍 Drag the marker or click on map to change location
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-address-message">
                <p>Unable to get your location. Please try again.</p>
                <button 
                  className="retry-btn"
                  onClick={handleRetryLocation}
                >
                  🔄 Retry Location Detection
                </button>
              </div>
            )}
          </div>

          {/* Các phần khác giữ nguyên */}
          {/* Order Items */}
          <div className="order-items-section">
            <div className="section-header">
              <span className="section-title">Order Items</span>
            </div>
            <div className="order-items-list">
              {cart.map(item => (
                <div key={item.id} className="order-item">
                  <div className="order-item-main">
                    <div className="order-item-info">
                      <div className="order-item-name">{item.name} × {item.quantity}</div>
                      <div className="order-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    {item.description && (
                      <div className="order-item-description">
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="special-instructions-section">
            <div className="section-title">Special Instructions</div>
            <textarea
              className="special-instructions-input"
              placeholder="Any special requests, delivery instructions, etc."
              value={specialInstructions}
              onChange={(e) => onSpecialInstructionsChange(e.target.value)}
              rows="3"
            />
          </div>

          {/* Voucher Code */}
          <div className="voucher-section">
            <div className="section-title">Voucher Code</div>
            <input
              type="text"
              className="voucher-input"
              placeholder="Enter voucher code"
              value={voucherCode}
              onChange={(e) => onVoucherCodeChange(e.target.value)}
            />
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${(finalTotal - tax).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{deliveryAddress ? 'FREE' : 'TBD'}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="payment-method-section">
            <div className="section-title">Payment Method</div>
            <div className="payment-methods">
              <div 
                className={`payment-method ${selectedPaymentMethod === 'crypto' ? 'selected' : ''}`}
                onClick={() => onPaymentMethodChange('crypto')}
              >
                <div className="payment-method-info">
                  <div className="payment-method-name">Crypto QR</div>
                  <div className="payment-method-description">Pay with USDT (TRC20)</div>
                </div>
                <div className="payment-method-icon">🔗</div>
              </div>
            </div>
          </div>

          {/* Payment Note */}
          <div className="payment-note">
            <p>💡 <strong>Note:</strong> For crypto payments, you have 10 minutes to complete the transaction.</p>
          </div>
        </div>

        <div className="order-form-footer">
          <button 
            className="pay-button" 
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || !deliveryAddress || isGettingLocation}
          >
            {isGettingLocation ? 'GETTING LOCATION...' : 
             selectedPaymentMethod === 'crypto' ? 'PAY WITH CRYPTO' : 'PAY WITH CARD'} ${finalTotal.toFixed(2)}
          </button>
          {!deliveryAddress && !isGettingLocation && (
            <div className="address-warning">
              ⚠️ Please allow location access to continue
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderForm;