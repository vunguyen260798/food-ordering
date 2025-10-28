import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (search = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await productAPI.getAllProducts(search);
      setProducts(response.data || []);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchTerm);
  };

  const handleCreateProduct = async (productData) => {
    try {
      setError('');
      await productAPI.createProduct(productData);
      setSuccess('Product created successfully!');
      setShowForm(false);
      fetchProducts(searchTerm);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      setError('');
      await productAPI.updateProduct(editingProduct._id, productData);
      setSuccess('Product updated successfully!');
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts(searchTerm);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setError('');
      await productAPI.deleteProduct(productId);
      setSuccess('Product deleted successfully!');
      fetchProducts(searchTerm);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setError('');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Product Management</h1>
        <p>Manage your food products inventory</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {!showForm ? (
        <>
          <div className="actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowForm(true)}
            >
              + Add New Product
            </button>
            <button 
              className="btn btn-warning" 
              onClick={() => fetchProducts(searchTerm)}
            >
              🔄 Refresh
            </button>
          </div>

          <form onSubmit={handleSearch} className="search-container">
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
            {searchTerm && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  fetchProducts('');
                }}
              >
                Clear
              </button>
            )}
          </form>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <ProductTable 
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          )}
        </>
      ) : (
        <ProductForm
          product={editingProduct}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={handleCancelForm}
          isEditing={!!editingProduct}
        />
      )}
    </div>
  );
};

export default ProductManagement;
