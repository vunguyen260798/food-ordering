import React from 'react';

const Cart = ({ cart, onUpdateItem, onRemoveItem, onClose, onCheckout, totalPrice }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const tax = totalPrice * 0.1; // 10% tax
  const deliveryFee = 5.0; // Fixed delivery fee
  const grandTotal = totalPrice + tax + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Shopping Cart</h2>
            <button onClick={onClose} className="modal-close">×</button>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
            <h3>Your cart is empty</h3>
            <p>Add some delicious items to get started!</p>
            <button onClick={onClose} className="btn-primary">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ minWidth: '500px' }}>
        <div className="modal-header">
          <h2>Shopping Cart ({getTotalItems()} items)</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">{formatPrice(item.price)} each</div>
              </div>
              
              <div className="cart-item-controls">
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => onUpdateItem(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => onUpdateItem(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                
                <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: 'bold' }}>
                  {formatPrice(item.price * item.quantity)}
                </div>
                
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="remove-item"
                  title="Remove item"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-total">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Subtotal:</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Tax (10%):</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Delivery Fee:</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
          <hr style={{ margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="cart-total-label">Total:</span>
            <span className="cart-total-amount">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        <div className="form-actions">
          <button onClick={onClose} className="btn-secondary">
            Continue Shopping
          </button>
          <button onClick={onCheckout} className="btn-primary">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
