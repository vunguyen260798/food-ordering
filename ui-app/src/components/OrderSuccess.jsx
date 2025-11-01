import React from 'react';

const OrderSuccess = ({ onClose }) => {
  return (
    <div className="mobile-app">
      <div className="order-success-overlay">
        <div className="order-success-modal">
          <h2>🎉 Order Placed Successfully!</h2>
          <p>Thank you for your order. We'll contact you shortly to confirm.</p>
          <p>Estimated delivery: 45 minutes</p>
          <button 
            onClick={onClose}
            className="checkout-btn"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;