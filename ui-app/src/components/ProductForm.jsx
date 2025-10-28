import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, onSubmit, onCancel, isEditing }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    variants: []
  });

  const [newVariant, setNewVariant] = useState({
    name: '',
    price: '',
    description: '',
    isAvailable: true,
    sku: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        image: product.image || '',
        variants: product.variants || []
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVariantChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewVariant(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addVariant = () => {
    if (newVariant.name && newVariant.price) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...newVariant }]
      }));
      setNewVariant({
        name: '',
        price: '',
        description: '',
        isAvailable: true,
        sku: ''
      });
    }
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price: parseFloat(formData.price)
    };
    onSubmit(submitData);
  };

  return (
    <div className="form-container">
      <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label>Base Price * ($)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="form-control"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Image URL</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            className="form-control"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label>Product Variants</label>
          
          {/* Existing Variants */}
          {formData.variants.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h4>Current Variants:</h4>
              {formData.variants.map((variant, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  marginBottom: '5px',
                  padding: '5px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <span><strong>{variant.name}</strong></span>
                  <span>${variant.price}</span>
                  <span>{variant.description}</span>
                  <span>{variant.isAvailable ? '✅' : '❌'}</span>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="btn btn-danger btn-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Variant */}
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h4>Add Variant:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Variant name (e.g., Small, Large)"
                value={newVariant.name}
                onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                className="form-control"
              />
              <input
                type="number"
                placeholder="Price"
                value={newVariant.price}
                onChange={(e) => setNewVariant(prev => ({ ...prev, price: e.target.value }))}
                className="form-control"
                step="0.01"
                min="0"
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Description (optional)"
                value={newVariant.description}
                onChange={(e) => setNewVariant(prev => ({ ...prev, description: e.target.value }))}
                className="form-control"
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="SKU (optional)"
                value={newVariant.sku}
                onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                className="form-control"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={newVariant.isAvailable}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, isAvailable: e.target.checked }))}
                />
                Available
              </label>
              <button
                type="button"
                onClick={addVariant}
                className="btn btn-success btn-sm"
                disabled={!newVariant.name || !newVariant.price}
              >
                Add Variant
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
