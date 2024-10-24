import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles//NavBar.css";

export default function NavBar({ isLoggedIn, setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-title">
        <h3>Your Pet Is My Boss</h3>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "active-link" : ""}
          >
            Home
          </NavLink>
        </li>
        {!isLoggedIn ? (
          <>
            <li>
              <NavLink 
                to="/login" 
                className={({ isActive }) => isActive ? "active-link" : ""}
              >
                Login
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/register" 
                className={({ isActive }) => isActive ? "active-link" : ""}
              >
                Register
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink 
                to="/account" 
                className={({ isActive }) => isActive ? "active-link" : ""}
              >
                Account
              </NavLink>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}