import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';

const OrderDetails = ({ order, onClose, onUpdateStatus, onCancelOrder }) => {
  const [detailedOrder, setDetailedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [order._id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderAPI.getOrderById(order._id);
      setDetailedOrder(response.data);
    } catch (err) {
      setError('Failed to fetch order details');
      console.error('Fetch order details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      preparing: 'status-preparing',
      ready: 'status-ready',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return `status-badge ${statusClasses[status] || 'status-pending'}`;
  };

  const statusOptions = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Order Details</h2>
          <button onClick={onClose} className="btn btn-secondary">← Back to Orders</button>
        </div>
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Order Details</h2>
          <button onClick={onClose} className="btn btn-secondary">← Back to Orders</button>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  const orderData = detailedOrder || order;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Order Details</h2>
        <button onClick={onClose} className="btn btn-secondary">← Back to Orders</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Order Information */}
        <div className="table-container">
          <h3 style={{ padding: '15px', margin: 0, backgroundColor: '#34495e', color: 'white' }}>
            Order Information
          </h3>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Order Number:</strong> {orderData.orderNumber}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Status:</strong>{' '}
              <span className={getStatusBadgeClass(orderData.status)}>
                {orderData.status}
              </span>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Payment Status:</strong>{' '}
              <span className={getStatusBadgeClass(orderData.paymentStatus || 'pending')}>
                {orderData.paymentStatus || 'pending'}
              </span>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Created:</strong> {formatDate(orderData.createdAt)}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Updated:</strong> {formatDate(orderData.updatedAt)}
            </div>
            {orderData.specialInstructions && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Special Instructions:</strong><br />
                <em>{orderData.specialInstructions}</em>
              </div>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div className="table-container">
          <h3 style={{ padding: '15px', margin: 0, backgroundColor: '#34495e', color: 'white' }}>
            Customer Information
          </h3>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Name:</strong> {orderData.customerName}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Email:</strong> {orderData.customerEmail}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Phone:</strong> {orderData.customerPhone}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Delivery Address:</strong><br />
              {typeof orderData.deliveryAddress === 'string' 
                ? orderData.deliveryAddress 
                : `${orderData.deliveryAddress?.street || ''}, ${orderData.deliveryAddress?.city || ''}, ${orderData.deliveryAddress?.state || ''} ${orderData.deliveryAddress?.zipCode || ''}`
              }
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="table-container" style={{ marginBottom: '20px' }}>
        <h3 style={{ padding: '15px', margin: 0, backgroundColor: '#34495e', color: 'white' }}>
          Order Items
        </h3>
        {orderData.orderItems && orderData.orderItems.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orderData.orderItems.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div>
                      <strong>{item.product?.name || item.productName}</strong>
                    </div>
                    {item.customizations && item.customizations.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                        Customizations: {item.customizations.map(c => c.value).join(', ')}
                      </div>
                    )}
                    {item.specialRequest && (
                      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                        Note: {item.specialRequest}
                      </div>
                    )}
                  </td>
                  <td>{formatPrice(item.productPrice || item.price)}</td>
                  <td>{item.quantity}</td>
                  <td><strong>{formatPrice(item.subtotal)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
            No order items found
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="table-container" style={{ marginBottom: '20px' }}>
        <h3 style={{ padding: '15px', margin: 0, backgroundColor: '#34495e', color: 'white' }}>
          Order Summary
        </h3>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Subtotal:</span>
            <span>{formatPrice(orderData.subtotal || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Tax:</span>
            <span>{formatPrice(orderData.tax || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Delivery Fee:</span>
            <span>{formatPrice(orderData.deliveryFee || 0)}</span>
          </div>
          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
            <span>Total:</span>
            <span>{formatPrice(orderData.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {orderData.status !== 'cancelled' && orderData.status !== 'delivered' && (
        <div className="actions">
          <select
            onChange={(e) => {
              if (e.target.value) {
                onUpdateStatus(orderData._id, e.target.value);
                e.target.value = '';
              }
            }}
            className="btn btn-primary"
            defaultValue=""
          >
            <option value="">Update Order Status</option>
            {statusOptions
              .filter(status => status !== orderData.status)
              .map(status => (
                <option key={status} value={status}>
                  Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
          </select>
          
          <button
            onClick={() => onCancelOrder(orderData._id, 'Cancelled by admin')}
            className="btn btn-danger"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
