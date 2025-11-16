import React from 'react';

const OrderTable = ({ orders, onViewOrder, onUpdateStatus, onCancelOrder }) => {
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

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      paid: 'status-paid',
      confirmed: 'status-confirmed',
      preparing: 'status-preparing',
      ready: 'status-ready',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return `status-badge ${statusClasses[status] || 'status-pending'}`;
  };

  const statusOptions = ['pending', 'paid', 'preparing', 'ready', 'delivered', 'cancelled'];

  if (orders.length === 0) {
    return (
      <div className="table-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
          <h3>No orders found</h3>
          <p>Orders will appear here when customers place them.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>
                <strong>{order.orderNumber}</strong>
              </td>
              <td>
                <div>
                  <div><strong>{order.customerName}</strong></div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                    {order.customerEmail}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                    {order.customerPhone}
                  </div>
                </div>
              </td>
              <td>
                <div style={{ fontSize: '12px' }}>
                  {order.orderItems ? `${order.orderItems.length} item(s)` : 'N/A'}
                </div>
              </td>
              <td>
                <strong>{formatPrice(order.totalAmount)}</strong>
              </td>
              <td>
                <span className={getStatusBadgeClass(order.status)}>
                  {order.status}
                </span>
              </td>
              <td>
                <span className={getStatusBadgeClass(order.paymentStatus || 'pending')}>
                  {order.paymentStatus || 'pending'}
                </span>
              </td>
              <td>
                <small>{formatDate(order.createdAt)}</small>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <button
                    onClick={() => onViewOrder(order)}
                    className="btn btn-primary btn-sm"
                    title="View order details"
                  >
                    👁️ View
                  </button>
                  
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          onUpdateStatus(order._id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="btn btn-sm"
                      style={{ fontSize: '12px', padding: '4px' }}
                      defaultValue=""
                    >
                      <option value="">Update Status</option>
                      {statusOptions
                        .filter(status => status !== order.status && status !== 'cancelled')
                        .map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                    </select>
                  )}
                  
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button
                      onClick={() => onCancelOrder(order._id, 'Cancelled by admin')}
                      className="btn btn-danger btn-sm"
                      title="Cancel order"
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
