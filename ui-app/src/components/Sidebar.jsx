import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Food CMS</h2>
      <nav>
        <ul className="sidebar-nav">
          <li>
            <NavLink 
              to="/admin" 
              className={({ isActive }) => isActive ? 'active' : ''}
              end
            >
              📊 Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/products" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              🍕 Product Management
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/orders" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              📦 Order Management
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/" 
              style={{ borderTop: '1px solid #34495e', marginTop: '20px', paddingTop: '20px' }}
            >
              🌐 View Customer Site
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
