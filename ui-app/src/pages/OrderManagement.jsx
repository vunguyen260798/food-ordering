import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import '../styles/order.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  const statusOptions = [
    { value: '', label: 'Tất cả đơn hàng', color: '#666' },
    { value: 'pending', label: 'Chờ xác nhận', color: '#FF9500' },
    { value: 'confirmed', label: 'Đã xác nhận', color: '#007AFF' },
    { value: 'preparing', label: 'Đang chuẩn bị', color: '#5856D6' },
    { value: 'ready', label: 'Sẵn sàng', color: '#34C759' },
    { value: 'delivered', label: 'Đã giao', color: '#32D74B' },
    { value: 'cancelled', label: 'Đã hủy', color: '#FF3B30' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderAPI.getAllOrders(filters.status);
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

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : '#666';
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.label : status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Order Card Component
  const OrderCard = ({ order }) => (
    <div className="order-card" onClick={() => handleViewOrder(order)}>
      <div className="order-header">
        <div className="order-id">#{order._id.slice(-8)}</div>
        <div 
          className="order-status"
          style={{ backgroundColor: getStatusColor(order.status) }}
        >
          {getStatusLabel(order.status)}
        </div>
      </div>
      
      <div className="order-customer">
        <div className="customer-name">{order.customerName}</div>
        <div className="customer-phone">{order.customerPhone}</div>
      </div>

      <div className="order-items">
        {order.orderItems && order.orderItems.slice(0, 2).map((item, index) => (
          <div key={index} className="order-item">
            <span className="item-name">{item.productName}</span>
            <span className="item-quantity">x{item.quantity}</span>
          </div>
        ))}
        {order.orderItems && order.orderItems.length > 2 && (
          <div className="more-items">+{order.orderItems.length - 2} món khác</div>
        )}
      </div>

      <div className="order-footer">
        <div className="order-total">
          {formatCurrency(order.totalAmount)}
        </div>
        <div className="order-time">
          {formatDate(order.createdAt)}
        </div>
      </div>
    </div>
  );

  // Order Details Component
  const OrderDetails = ({ order, onClose, onUpdateStatus, onCancelOrder }) => (
    <div className="order-details-overlay">
      <div className="order-details">
        <div className="order-details-header">
          <button className="back-btn" onClick={onClose}>
            ←
          </button>
          <h2>Chi tiết đơn hàng</h2>
          <div 
            className="order-status-badge"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {getStatusLabel(order.status)}
          </div>
        </div>

        <div className="order-details-content">
          {/* Customer Info */}
          <div className="details-section">
            <h3>Thông tin khách hàng</h3>
            <div className="customer-info">
              <div className="info-row">
                <span className="info-label">Họ tên:</span>
                <span className="info-value">{order.customerName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">SĐT:</span>
                <span className="info-value">{order.customerPhone}</span>
              </div>
              {order.customerEmail && (
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{order.customerEmail}</span>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="info-row">
                  <span className="info-label">Địa chỉ:</span>
                  <span className="info-value">{order.deliveryAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="details-section">
            <h3>Đơn hàng</h3>
            <div className="order-items-list">
              {order.orderItems && order.orderItems.map((item, index) => (
                <div key={index} className="order-item-detail">
                  <div className="item-main">
                    <span className="item-name">{item.productName}</span>
                    <span className="item-price">{formatCurrency(item.productPrice)}</span>
                  </div>
                  <div className="item-quantity">Số lượng: {item.quantity}</div>
                  {item.specialRequest && (
                    <div className="item-request">Ghi chú: {item.specialRequest}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="details-section">
            <h3>Thanh toán</h3>
            <div className="order-summary">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="summary-row">
                <span>Thuế:</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="details-section">
              <h3>Ghi chú đặc biệt</h3>
              <div className="special-instructions">
                {order.specialInstructions}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            {order.status === 'pending' && (
              <>
                <button 
                  className="btn confirm-btn"
                  onClick={() => onUpdateStatus(order._id, 'confirmed')}
                >
                  Xác nhận đơn
                </button>
                <button 
                  className="btn cancel-btn"
                  onClick={() => onCancelOrder(order._id)}
                >
                  Hủy đơn
                </button>
              </>
            )}
            {order.status === 'confirmed' && (
              <button 
                className="btn preparing-btn"
                onClick={() => onUpdateStatus(order._id, 'preparing')}
              >
                Bắt đầu chuẩn bị
              </button>
            )}
            {order.status === 'preparing' && (
              <button 
                className="btn ready-btn"
                onClick={() => onUpdateStatus(order._id, 'ready')}
              >
                Đã sẵn sàng
              </button>
            )}
            {order.status === 'ready' && (
              <button 
                className="btn deliver-btn"
                onClick={() => onUpdateStatus(order._id, 'delivered')}
              >
                Đã giao hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="order-management">
      <div className="order-header">
        <h1>Quản lý đơn hàng</h1>
        <p>Theo dõi và quản lý đơn hàng của khách hàng</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {!selectedOrder ? (
        <>
          {/* Filters */}
          <div className="filters-section">
            <div className="search-box">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Tìm kiếm đơn hàng..."
                className="search-input"
              />
            </div>
            
            <div className="status-filters">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  className={`status-filter ${filters.status === status.value ? 'active' : ''}`}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, status: status.value }));
                    setTimeout(applyFilters, 100);
                  }}
                  style={{ 
                    borderColor: status.color,
                    color: filters.status === status.value ? status.color : '#666'
                  }}
                >
                  {status.label}
                </button>
              ))}
            </div>

            <button onClick={fetchOrders} className="refresh-btn">
              🔄 Làm mới
            </button>
          </div>

          {/* Orders Grid */}
          {loading ? (
            <div className="loading">Đang tải đơn hàng...</div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">📦</div>
              <h3>Không có đơn hàng</h3>
              <p>Chưa có đơn hàng nào phù hợp với bộ lọc</p>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map(order => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
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