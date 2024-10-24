import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/NavBar.css';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-title">Your Pet is My Boss!</div>

      {/* Hamburger Icon */}
      <div className="hamburger" onClick={toggleMenu}>
        <div className={`bar ${isOpen ? 'open-bar1' : ''}`}></div>
        <div className={`bar ${isOpen ? 'open-bar2' : ''}`}></div>
        <div className={`bar ${isOpen ? 'open-bar3' : ''}`}></div>
      </div>

      {/* Dropdown Menu */}
      <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
        <li>
          <Link to="/" onClick={toggleMenu}>Home</Link>
        </li>
        <li>
          <Link to="/login" onClick={toggleMenu}>Login</Link>
        </li>
        <li>
          <Link to="/register" onClick={toggleMenu}>Register</Link>
        </li>
        <li>
          <Link to="/account" onClick={toggleMenu}>Account</Link>
        </li>
      </ul>
    </nav>
  );
}