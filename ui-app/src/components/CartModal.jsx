import React from 'react';
import CartItem from './CartItem';

const CartModal = ({ 
  cart, 
  onClose, 
  onUpdateCartItem, 
  onRemoveFromCart, 
  totalPrice, 
  onProceedToCheckout 
}) => {
  return (
    <div className="cart-modal-overlay">
      <div className="cart-modal">
        <div className="cart-header">
          <h3>Your Cart</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">Your cart is empty</div>
          ) : (
            cart.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateCartItem}
                onRemove={onRemoveFromCart}
              />
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              Total: <strong>${totalPrice.toFixed(2)}</strong>
            </div>
            <button 
              className="checkout-btn" 
              onClick={onProceedToCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;