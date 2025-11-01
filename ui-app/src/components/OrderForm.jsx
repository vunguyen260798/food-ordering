import React from 'react';

const OrderForm = ({
  cart,
  specialInstructions,
  selectedPaymentMethod,
  tax,
  finalTotal,
  onClose,
  onSpecialInstructionsChange,
  onPaymentMethodChange,
  onPlaceOrder
}) => {
  return (
    <div className="order-form-overlay">
      <div className="order-form-modal">
        <div className="order-form-header">
          <h2>YOUR ORDER</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="order-form-content">
          {/* Order Items */}
          <div className="order-items-section">
            <div className="section-header">
              <span className="section-title">Order Items</span>
            </div>
            {cart.map(item => (
              <div key={item.id} className="order-item">
                <div className="order-item-main">
                  <div className="order-item-info">
                    <div className="order-item-name">{item.name} × {item.quantity}</div>
                    <div className="order-item-price">${(item.price * item.quantity).toFixed(2)}</div>
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
            <div className="section-title">Special Instructions</div>
            <textarea
              className="special-instructions-input"
              placeholder="Any special requests, details, etc."
              value={specialInstructions}
              onChange={(e) => onSpecialInstructionsChange(e.target.value)}
              rows="3"
            />
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${(finalTotal - tax).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Free Delivery</span>
              <span>$0.00</span>
            </div>
            <div className="summary-row tax-row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
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
            onClick={onPlaceOrder}
            disabled={cart.length === 0}
          >
            {selectedPaymentMethod === 'crypto' ? 'PAY WITH CRYPTO' : 'PAY WITH CARD'} ${finalTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;