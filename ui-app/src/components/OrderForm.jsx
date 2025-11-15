import React, { useState, useRef, useEffect } from 'react';

const OrderForm = ({
  cart,
  specialInstructions,
  voucherCode,
  selectedPaymentMethod,
  finalTotal,
  onClose,
  onSpecialInstructionsChange,
  onVoucherCodeChange,
  onPaymentMethodChange,
  onPlaceOrder
}) => {
  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: ''
  });
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
  const [manualAddressMode, setManualAddressMode] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const addressInputTimeoutRef = useRef(null);

  // Tự động lấy địa chỉ khi component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Khởi tạo map khi có deliveryAddress và showMap = true
  useEffect(() => {
    if (deliveryAddress && showMap && !mapInitialized && mapRef.current && !manualAddressMode) {
      setTimeout(() => {
        initializeMap();
      }, 300);
    }
  }, [deliveryAddress, showMap, manualAddressMode, mapInitialized]);

  // Cập nhật address details và delivery address trong customerInfo khi deliveryAddress thay đổi
  useEffect(() => {
    if (deliveryAddress && deliveryAddress.addressDetails) {
      setAddressDetails(deliveryAddress.addressDetails);
      // Cập nhật địa chỉ giao hàng trong customerInfo
      setCustomerInfo(prev => ({
        ...prev,
        deliveryAddress: deliveryAddress.formattedAddress
      }));
    }
  }, [deliveryAddress]);

  // Cleanup map khi component unmount
  useEffect(() => {
    return () => {
      cleanupMap();
      if (addressInputTimeoutRef.current) {
        clearTimeout(addressInputTimeoutRef.current);
      }
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

  // Hàm geocoding: chuyển đổi địa chỉ text thành tọa độ
  const geocodeAddress = async (address) => {
    if (!address.trim()) return null;
    
    setIsGeocoding(true);
    try {
      console.log('Geocoding address:', address);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=1&accept-language=vi`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding API failed');
      }
      
      const data = await response.json();
      console.log('Geocoding result:', data);
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Trích xuất thông tin địa chỉ chi tiết
        const addressDetails = {
          streetNumber: result.address.house_number || result.address.house_name || '',
          streetName: result.address.road || result.address.street || result.address.pedestrian || '',
          ward: result.address.suburb || result.address.village || result.address.neighbourhood || '',
          district: result.address.city_district || result.address.district || '',
          city: result.address.city || result.address.town || result.address.county || '',
          state: result.address.state || '',
          country: result.address.country || '',
          postcode: result.address.postcode || ''
        };

        // Tạo formatted address từ kết quả geocoding
        const formattedAddress = result.display_name || address;

        return {
          latitude: lat,
          longitude: lng,
          formattedAddress,
          source: 'address_geocoding',
          addressDetails,
          rawAddress: result
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };

  // Hàm xử lý thay đổi địa chỉ với debounce
  const handleDeliveryAddressChange = (value) => {
    // Cập nhật giá trị input ngay lập tức
    setCustomerInfo(prev => ({
      ...prev,
      deliveryAddress: value
    }));

    // Clear timeout cũ nếu có
    if (addressInputTimeoutRef.current) {
      clearTimeout(addressInputTimeoutRef.current);
    }

    // Chỉ thực hiện geocoding sau khi người dùng ngừng nhập 1.5 giây
    addressInputTimeoutRef.current = setTimeout(async () => {
      if (value.trim()) {
        console.log('Processing address input:', value);
        const geocodedAddress = await geocodeAddress(value);
        
        if (geocodedAddress) {
          console.log('Address geocoded successfully:', geocodedAddress);
          setDeliveryAddress(geocodedAddress);
          
          // Nếu map đã được khởi tạo, cập nhật vị trí marker
          if (mapInstanceRef.current && markerRef.current) {
            updateMapLocation(geocodedAddress.latitude, geocodedAddress.longitude);
          } else if (showMap) {
            // Nếu map chưa được khởi tạo nhưng đang hiển thị, reset flag để khởi tạo lại
            setMapInitialized(false);
          }
        } else {
          console.log('Geocoding failed for address:', value);
        }
      }
    }, 1500); // Debounce 1.5 giây
  };

  // Hàm cập nhật vị trí map khi địa chỉ thay đổi
  const updateMapLocation = (lat, lng) => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    try {
      // Di chuyển map đến vị trí mới
      mapInstanceRef.current.setView([lat, lng], 16);
      
      // Di chuyển marker đến vị trí mới
      markerRef.current.setLatLng([lat, lng]);
      
      // Cập nhật popup
      markerRef.current.bindPopup(`
        <div style="text-align: center;">
          <strong>📍 Delivery Location</strong><br>
          ${customerInfo.deliveryAddress}
        </div>
      `).openPopup();

      console.log('Map location updated to:', lat, lng);
    } catch (error) {
      console.error('Error updating map location:', error);
    }
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      const position = await getBrowserLocation();
      console.log('Location obtained:', position);
    } catch (error) {
      console.error('Error getting location:', error);
      // Switch to manual address mode if location detection fails
      setManualAddressMode(true);
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
          
          // Cập nhật address input
          setCustomerInfo(prev => ({
            ...prev,
            deliveryAddress: newAddress.formattedAddress
          }));
          
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
          
          // Cập nhật address input
          setCustomerInfo(prev => ({
            ...prev,
            deliveryAddress: newAddress.formattedAddress
          }));
          
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
    
    if (!newShowMap) {
      // When hiding map, cleanup and reset initialization flag
      cleanupMap();
    } else if (newShowMap && deliveryAddress) {
      // When showing map, reset flag and let useEffect handle initialization
      setMapInitialized(false);
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

  // Thêm hàm xử lý thay đổi thông tin khách hàng
  const handleCustomerInfoChange = (field, value) => {
    if (field === 'deliveryAddress') {
      handleDeliveryAddressChange(value);
    } else {
      setCustomerInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePlaceOrder = () => {
    // Validate required fields
    if (!customerInfo.customerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!customerInfo.customerPhone.trim()) {
      alert('Please enter your phone number');
      return;
    }
    if (!customerInfo.deliveryAddress.trim()) {
      alert('Please enter your address');
      return;
    }

    onPlaceOrder({
      customerInfo,
      specialInstructions,
      voucherCode,
      paymentMethod: selectedPaymentMethod,
      deliveryAddress: deliveryAddress
    });
  };

  return (
    <div className="order-form-overlay">
      <div className="order-form-modal">
        <div className="order-form-header">
          <h2>Checkout</h2> 
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="order-form-content">
          {/* Order Items */}
          <div className="order-items-section">
            <div className="order-items-list">
              {cart.map(item => (
                <div key={item.id} className="order-item">
                  <div className="order-item-main">
                    <div className="order-item-info">
                      {/* Hình ảnh sản phẩm */}
                      <div className="order-item-image-container">
                        <div className="order-item-image">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="item-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : null}
                        </div>
                        <div className="order-item-content">
                          <div className="order-item-left">
                            <div className="order-item-name">{item.name}</div>
                            {item.description && (
                              <div className="order-item-description">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="order-item-right">
                        <div className="order-item-quantity">{item.quantity}x</div>
                        <div className="order-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voucher Code */}
          <div className="voucher-section">
            <input
              type="text"
              className="voucher-input"
              placeholder="Enter voucher code"
              value={voucherCode}
              onChange={(e) => onVoucherCodeChange(e.target.value)}
            />
          </div>

          {/* Special Instructions */}
          <div className="special-instructions-section">
            <textarea
              className="special-instructions-input"
              placeholder="Add comment..."
              value={specialInstructions}
              onChange={(e) => onSpecialInstructionsChange(e.target.value)}
              rows="3"
            />
          </div>

          {/* Customer Information */}
          <div className="customer-info-section">
            <div className="customer-info-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your full name"
                    value={customerInfo.customerName}
                    onChange={(e) => handleCustomerInfoChange('customerName', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Phone number"
                    value={customerInfo.customerPhone}
                    onChange={(e) => handleCustomerInfoChange('customerPhone', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-textarea"
                  placeholder="Full delivery address"
                  value={customerInfo.deliveryAddress}
                  onChange={(e) => handleCustomerInfoChange('deliveryAddress', e.target.value)}
                  rows="3"
                />
                {isGeocoding && (
                  <div className="geocoding-indicator">
                    Updating map location...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map Section */}
          {showMap && deliveryAddress && (
            <div className="map-section">
              <div 
                ref={mapRef} 
                className="delivery-map"
                style={{ height: '200px', width: '100%' }}
              />
              <div className="map-actions">
                <button 
                  className="retry-location-btn"
                  onClick={handleRetryLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? 'Getting Location...' : 'Refresh Location'}
                </button>
              </div>
            </div>
          )}

          {!showMap && (
            <div className="map-toggle-section">
              <button 
                className="show-map-btn"
                onClick={toggleMap}
              >
                Show Delivery Map
              </button>
            </div>
          )}

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${(finalTotal).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>$0.00</span>
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
                  <div className="payment-method-name">Crypto QR Payment</div>
                  <div className="payment-method-description">Pay with USDT (TRC20)</div>
                </div>
                <div className="payment-method-icon">🔗</div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-form-footer">
          <button 
            className="pay-button" 
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || !customerInfo.customerName || !customerInfo.customerPhone || !customerInfo.deliveryAddress}
          >
            PAY ${finalTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;