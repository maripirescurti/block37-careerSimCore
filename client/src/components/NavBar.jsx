import React from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="navbar">
      <div>
        <h3>Your Pet Is My Boss</h3>
      </div>
      <ul className="navbar-links">
        <li><Link to='/'>Home</Link></li>
        <li><Link to='/login'>Login</Link></li>
        <li><Link to='/register'>Register</Link></li>
        <li><Link to='/account'>Account</Link></li>
      </ul>
    </nav>
  );
}