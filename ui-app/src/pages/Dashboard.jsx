import React, { useState, useEffect } from 'react';
import { productAPI, orderAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch products and orders data
      const [productsResponse, ordersResponse] = await Promise.all([
        productAPI.getAllProducts(),
        orderAPI.getAllOrders()
      ]);

      const products = productsResponse.data || [];
      const orders = ordersResponse.data || [];

      // Calculate statistics
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders,
        deliveredOrders
      });
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your food ordering system</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Total Products</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db', margin: 0 }}>{stats.totalProducts}</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Total Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60', margin: 0 }}>{stats.totalOrders}</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Pending Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12', margin: 0 }}>{stats.pendingOrders}</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Delivered Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60', margin: 0 }}>{stats.deliveredOrders}</p>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
