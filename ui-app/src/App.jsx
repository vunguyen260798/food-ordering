import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FoodOrderingApp from './pages/FoodOrderingApp';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Food Ordering Interface */}
        <Route path="/" element={<FoodOrderingApp />} />
        
        {/* Admin CMS Interface */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
