import React, { useState, useEffect } from 'react';

const ProductCard = ({ product, isInCart, quantity, onAddToCart, onUpdateQuantity, onRemoveFromCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantQuantities, setVariantQuantities] = useState({});

  // Set default variant (first variant or null if no variants)
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants[0];
      setSelectedVariant(defaultVariant);
      
      // Initialize quantities for all variants
      const initialQuantities = {};
      product.variants.forEach(variant => {
        initialQuantities[variant._id] = 0;
      });
      setVariantQuantities(initialQuantities);
    }
  }, [product]);

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 0) return;
    
    if (!selectedVariant) return;

    const variantId = selectedVariant._id;
    
    setVariantQuantities(prev => ({
      ...prev,
      [variantId]: newQuantity
    }));

    if (newQuantity === 0) {
      // Remove from cart if quantity becomes 0
      const itemId = `${product._id}-${variantId}`;
      onRemoveFromCart(itemId);
    } else {
      // Update quantity in cart
      const productToUpdate = {
        ...product,
        selectedVariant: selectedVariant,
        price: selectedVariant ? selectedVariant.price : product.price
      };
      onUpdateQuantity(productToUpdate, newQuantity);
    }
  };

  const getCurrentQuantity = () => {
    if (!selectedVariant) return 0;
    return variantQuantities[selectedVariant._id] || 0;
  };

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const hasVariants = product.variants && product.variants.length > 0;
  const currentQuantity = getCurrentQuantity();

  return (
    <div className={`product-card ${isInCart ? 'selected' : ''}`}>
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
      
      
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-price">${displayPrice.toFixed(2)}</div>
      </div>

      {hasVariants && (
        <div className="variant-buttons-grid">
          {product.variants.map((variant) => (
            <button
              key={variant._id}
              className={`variant-btn ${selectedVariant?._id === variant._id ? 'active' : ''}`}
              onClick={() => handleVariantChange(variant)}
              title={variant.description}
            >
              {variant.name}
            </button>
          ))}
        </div>
      )}
      
      <div className="product-actions">
        {hasVariants ? (
          selectedVariant && (
            <div className="selected-variant-controls">
              {currentQuantity === 0 ? (
                <button
                  className="add-variant-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  Add
                </button>
              ) : (
                <div className="quantity-controls">
                  <button
                    className="quantity-btn decrease"
                    onClick={() => handleQuantityChange(currentQuantity - 1)}
                  >
                    -
                  </button>
                  <span className="quantity-display">{currentQuantity}</span>
                  <button
                    className="quantity-btn increase"
                    onClick={() => handleQuantityChange(currentQuantity + 1)}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          )
        ) : (
          quantity === 0 ? (
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              Add 
            </button>
          ) : (
            <div className="quantity-controls">
              <button
                className="quantity-btn decrease"
                onClick={() => onUpdateQuantity(product, quantity - 1)}
              >
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button
                className="quantity-btn increase"
                onClick={() => onUpdateQuantity(product, quantity + 1)}
              >
                +
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProductCard;