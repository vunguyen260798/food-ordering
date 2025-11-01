import React from 'react';

const CartButton = ({ totalItems, onShowCart }) => {
  return (
    <button className="cart-button" onClick={onShowCart}>
      <span>View Cart</span>
      <span className="cart-badge">{totalItems} items</span>
    </button>
  );
};

export default CartButton;