import React, { useState } from 'react';

const OrderForm = ({ cart, totalPrice, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    specialInstructions: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email is invalid';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    }

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Order submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const tax = totalPrice * 0.1;
  const deliveryFee = 5.0;
  const grandTotal = totalPrice + tax + deliveryFee;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>Complete Your Order</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {/* Order Summary */}
        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Order Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', fontSize: '0.9rem' }}>
            {cart.map((item) => (
              <React.Fragment key={item.id}>
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </React.Fragment>
            ))}
            <hr style={{ gridColumn: '1 / -1', margin: '0.5rem 0' }} />
            <span>Subtotal:</span>
            <span>{formatPrice(totalPrice)}</span>
            <span>Tax (10%):</span>
            <span>{formatPrice(tax)}</span>
            <span>Delivery Fee:</span>
            <span>{formatPrice(deliveryFee)}</span>
            <hr style={{ gridColumn: '1 / -1', margin: '0.5rem 0' }} />
            <strong>Total:</strong>
            <strong style={{ color: '#27ae60' }}>{formatPrice(grandTotal)}</strong>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              className={`form-input ${errors.customerName ? 'error' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.customerName && (
              <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {errors.customerName}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleInputChange}
              className={`form-input ${errors.customerEmail ? 'error' : ''}`}
              placeholder="Enter your email"
            />
            {errors.customerEmail && (
              <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {errors.customerEmail}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleInputChange}
              className={`form-input ${errors.customerPhone ? 'error' : ''}`}
              placeholder="Enter your phone number"
            />
            {errors.customerPhone && (
              <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {errors.customerPhone}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Address *</label>
            <textarea
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleInputChange}
              className={`form-input form-textarea ${errors.deliveryAddress ? 'error' : ''}`}
              placeholder="Enter your complete delivery address"
              rows="3"
            />
            {errors.deliveryAddress && (
              <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {errors.deliveryAddress}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Special Instructions (Optional)</label>
            <textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              className="form-input form-textarea"
              placeholder="Any special requests or delivery instructions..."
              rows="2"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Back to Cart
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Placing Order...' : `Place Order - ${formatPrice(grandTotal)}`}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#7f8c8d', textAlign: 'center' }}>
          <p>Your order will be delivered within 45 minutes. Payment is cash on delivery.</p>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
