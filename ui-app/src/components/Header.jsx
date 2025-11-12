// Header.jsx
import React, { useState } from 'react';

const Header = ({ darkMode, onToggleTheme }) => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleThemeToggle = () => {
    onToggleTheme();
    setShowMenu(false);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h1>🍕 Food Ordering</h1>
        <div className="header-actions">
          <button 
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label="Open menu"
          >
            ☰
          </button>
          
          {showMenu && (
            <div className="dropdown-menu">
              <button 
                className="menu-item theme-toggle-item"
                onClick={handleThemeToggle}
              >
                <span className="menu-icon">
                  {darkMode ? '☀️' : '🌙'}
                </span>
                <span className="menu-text">
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showMenu && (
        <div className="menu-overlay" onClick={() => setShowMenu(false)}></div>
      )}
    </header>
  );
};

export default Header;