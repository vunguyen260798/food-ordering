import React from 'react';

const Header = ({ darkMode, onToggleTheme }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>🍕 Food Ordering</h1>
        <button 
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};

export default Header;