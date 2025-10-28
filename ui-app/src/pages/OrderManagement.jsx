import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import OrderTable from '../components/OrderTable';
import OrderDetails from '../components/OrderDetails';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: ''
  });

  const statusOptions = ['', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
  const paymentStatusOptions = ['', 'pending', 'paid', 'failed', 'refunded'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderAPI.getAllOrders(filters.status, filters.paymentStatus);
      setOrders(response.data || []);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchOrders();
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setError('');
      await orderAPI.updateOrderStatus(orderId, newStatus);
      setSuccess(`Order status updated to ${newStatus}!`);
      fetchOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleCancelOrder = async (orderId, reason = '') => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setError('');
      await orderAPI.cancelOrder(orderId, reason);
      setSuccess('Order cancelled successfully!');
      fetchOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Order Management</h1>
        <p>Manage customer orders and track their status</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {!selectedOrder ? (
        <>
          <div className="actions">
            <button 
              className="btn btn-warning" 
              onClick={fetchOrders}
            >
              🔄 Refresh Orders
            </button>
          </div>

          {/* Filters */}
          <div className="search-container">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-control"
              style={{ flex: '0 0 200px' }}
            >
              <option value="">All Statuses</option>
              {statusOptions.slice(1).map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="form-control"
              style={{ flex: '0 0 200px' }}
            >
              <option value="">All Payment Status</option>
              {paymentStatusOptions.slice(1).map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <button onClick={applyFilters} className="btn btn-primary">
              Apply Filters
            </button>

            {(filters.status || filters.paymentStatus) && (
              <button 
                onClick={() => {
                  setFilters({ status: '', paymentStatus: '' });
                  fetchOrders();
                }}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : (
            <OrderTable 
              orders={orders}
              onViewOrder={handleViewOrder}
              onUpdateStatus={handleUpdateOrderStatus}
              onCancelOrder={handleCancelOrder}
            />
          )}
        </>
      ) : (
        <OrderDetails 
          order={selectedOrder}
          onClose={handleCloseOrderDetails}
          onUpdateStatus={handleUpdateOrderStatus}
          onCancelOrder={handleCancelOrder}
        />
      )}
    </div>
  );
};

export default OrderManagement;
