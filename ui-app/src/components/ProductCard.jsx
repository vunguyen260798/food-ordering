import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedVariant, quantity);
    setQuantity(1);
    setSelectedVariant(null);
  };

  const getCurrentPrice = () => {
    return selectedVariant ? selectedVariant.price : product.price;
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div style={{ display: product.image ? 'none' : 'flex' }}>
          🍽️
        </div>
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-price">
          {formatPrice(getCurrentPrice())}
        </div>

        {/* Variants Selection */}
        {product.variants && product.variants.length > 0 && (
          <div className="variants-section">
            <div className="variants-label">Size Options:</div>
            <div className="variants-list">
              <div
                className={`variant-option ${!selectedVariant ? 'selected' : ''}`}
                onClick={() => setSelectedVariant(null)}
              >
                Regular ({formatPrice(product.price)})
              </div>
              {product.variants.map((variant, index) => (
                <div
                  key={index}
                  className={`variant-option ${selectedVariant === variant ? 'selected' : ''} ${!variant.isAvailable ? 'disabled' : ''}`}
                  onClick={() => variant.isAvailable && setSelectedVariant(variant)}
                  style={{ 
                    opacity: variant.isAvailable ? 1 : 0.5,
                    cursor: variant.isAvailable ? 'pointer' : 'not-allowed'
                  }}
                >
                  {variant.name} ({formatPrice(variant.price)})
                  {!variant.isAvailable && ' - Unavailable'}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <span>Quantity:</span>
          <div className="quantity-controls">
            <button
              className="quantity-btn"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </button>
            <span className="quantity-display">{quantity}</span>
            <button
              className="quantity-btn"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="btn-primary"
          style={{ width: '100%' }}
        >
          Add to Cart - {formatPrice(getCurrentPrice() * quantity)}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
