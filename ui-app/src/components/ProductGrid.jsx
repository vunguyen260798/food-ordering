import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading, isProductInCart, getProductQuantity, onAddToCart, onRemoveFromCart, onUpdateQuantity }) => {
  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard
          key={product._id}
          product={product}
          isInCart={isProductInCart(product._id)}
          quantity={getProductQuantity(product._id)}
          onAddToCart={onAddToCart}
          onRemoveFromCart={onRemoveFromCart}
          onUpdateQuantity={onUpdateQuantity}
        />
      ))}
    </div>
  );
};

export default ProductGrid;