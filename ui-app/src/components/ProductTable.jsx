import React from 'react';

const ProductTable = ({ products, onEdit, onDelete }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (products.length === 0) {
    return (
      <div className="table-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
          <h3>No products found</h3>
          <p>Start by adding your first product to the inventory.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Description</th>
            <th>Base Price</th>
            <th>Variants</th>
            <th>Image</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                <strong>{product.name}</strong>
              </td>
              <td>
                <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.description}
                </div>
              </td>
              <td>{formatPrice(product.price)}</td>
              <td>
                {product.variants && product.variants.length > 0 ? (
                  <div>
                    <small>{product.variants.length} variant(s)</small>
                    <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                      {product.variants.slice(0, 2).map((variant, index) => (
                        <div key={index}>
                          {variant.name}: {formatPrice(variant.price)}
                        </div>
                      ))}
                      {product.variants.length > 2 && (
                        <div>+{product.variants.length - 2} more...</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <span style={{ color: '#7f8c8d' }}>No variants</span>
                )}
              </td>
              <td>
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    style={{ 
                      width: '50px', 
                      height: '50px', 
                      objectFit: 'cover', 
                      borderRadius: '4px' 
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span style={{ color: '#7f8c8d' }}>No image</span>
                )}
              </td>
              <td>
                <small>{formatDate(product.createdAt)}</small>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => onEdit(product)}
                    className="btn btn-primary btn-sm"
                    title="Edit product"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => onDelete(product._id)}
                    className="btn btn-danger btn-sm"
                    title="Delete product"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
