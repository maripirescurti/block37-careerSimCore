import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';

export default function NavBar({ token, setToken }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    setToken(null); // Clear the token
    localStorage.removeItem('token'); // Optionally remove it from localStorage
    setIsOpen(false); // Close the menu
    navigate('/'); // Redirect to home after logging out
  };

  return (
    <nav className="navbar">
      {/* Navbar Title with Link to Home */}
      <Link to="/" className="navbar-title" onClick={() => setIsOpen(false)}>
        Your Pet is My Boss!
      </Link>

      {/* Hamburger Icon */}
      <div className="hamburger" onClick={toggleMenu}>
        <div className={`bar ${isOpen ? 'open-bar1' : ''}`}></div>
        <div className={`bar ${isOpen ? 'open-bar2' : ''}`}></div>
        <div className={`bar ${isOpen ? 'open-bar3' : ''}`}></div>
      </div>

      {/* Conditional Dropdown Menu */}
      <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
        <li>
          <Link to="/" onClick={toggleMenu}>Home</Link>
        </li>
        {!token ? (
          <>
            <li>
              <Link to="/login" onClick={toggleMenu}>Login</Link>
            </li>
            <li>
              <Link to="/register" onClick={toggleMenu}>Register</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/account" onClick={toggleMenu}>Account</Link>
            </li>
            <li>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}