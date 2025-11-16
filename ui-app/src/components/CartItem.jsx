import React from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  // Ensure quantity exists
  const quantity = item.quantity || 1;
  
  return (
    <div className="cart-item">
      <div className="item-info">
        <div className="item-image">
          {item.image && (
            <img src={item.image} alt={item.name} />
          )}
        </div>
        <div className="item-details">
          <div className="item-name">{item.name}</div>
          <div className="item-price">${(item.price || 0).toFixed(2)}</div>
        </div>
      </div>
      <div className="item-controls">
        <button 
          className="quantity-btn"
          onClick={() => onUpdateQuantity(item.id, quantity - 1)}
        >
          -
        </button>
        <span className="quantity">{quantity}</span>
        <button 
          className="quantity-btn"
          onClick={() => onUpdateQuantity(item.id, quantity + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default CartItem;