import React from 'react';

const ProductCard = ({ product, isInCart, quantity, onAddToCart }) => {
  return (
    <div 
      className={`product-card ${isInCart ? 'selected' : ''}`}
      onClick={() => onAddToCart(product)}
    >
      <div className="product-image">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
      </div>
      <div className="product-name">{product.name}</div>
      <div className="product-price">${product.price.toFixed(2)}</div>
      
      {isInCart && (
        <div className="product-quantity-badge">
          {quantity}
        </div>
      )}
    </div>
  );
};

export default ProductCard;