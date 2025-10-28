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
              to="/products" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              🍕 Product Management
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/orders" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              📦 Order Management
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
