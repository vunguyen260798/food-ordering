import React, { useState, useEffect } from 'react';

const ProductCard = ({ product, isInCart, quantity, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Set default variant (first variant or null if no variants)
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const handleVariantChange = (e, variant) => {
    e.stopPropagation(); // Prevent triggering card click
    setSelectedVariant(variant);
  };

  const handleAddToCart = () => {
    const productToAdd = {
      ...product,
      selectedVariant: selectedVariant,
      // Use variant price if available, otherwise use base price
      price: selectedVariant ? selectedVariant.price : product.price
    };
    onAddToCart(productToAdd);
  };

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <div 
      className={`product-card ${isInCart ? 'selected' : ''}`}
      onClick={handleAddToCart}
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

      {hasVariants && (
        <div className="variant-buttons">
          {product.variants.map((variant) => (
            <button
              key={variant._id}
              className={`variant-btn ${selectedVariant?._id === variant._id ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedVariant(variant);
              }}
              title={variant.description}
            >
              {variant.name}
            </button>
          ))}
        </div>
      )}
      
      <div className="product-price">${displayPrice.toFixed(2)}</div>
      
    </div>
  );
};

export default ProductCard;