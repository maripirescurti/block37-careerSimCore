import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "./API"; // Import the API call

export default function Login({ setToken, setEmail }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const result = await loginUser(username, password);

      // Store token and email in local state and localStorage
      setToken(result.token);
      setEmail(result.email);
      localStorage.setItem('token', result.token);
      localStorage.setItem('email', result.email);

      setSuccessMessage("Login successful!");
      setIsLoggedIn(true);
      setError(null);

      // Clear input fields
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
      setSuccessMessage('');
    }
  }

  return (
    <>
      <h2>Sign In</h2>
      {error && <p className="error-message">{error}</p>}
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
          <p>
            <button onClick={() => navigate('/')}>Browse All Services!</button>
          </p>
          <p>
            <button onClick={() => navigate('/account')}>View Account Info</button>
          </p>
        </div>
      )}
      {!isLoggedIn && (
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit">Login</button>
        </form>
      )}
    </>
  );
}