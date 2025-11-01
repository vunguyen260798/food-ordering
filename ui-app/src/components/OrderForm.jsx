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
              onChange={(e) => onSpecialInstructionsChange(e.target.value)}
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
            </div>
          </div>
        </div>

        <div className="order-form-footer">
          <button 
            className="pay-button" 
            onClick={onPlaceOrder}
          >
            PAY ${finalTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;