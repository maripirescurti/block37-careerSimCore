import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({setToken, setEmail }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Log in failed.')
      }

      setToken(result.token);
      setEmail(result.email);
      setSuccessMessage("Login successful")

      // clear inputs
      setUsername('');
      setPassword('');
      setError(null);

    } catch (error) {
      setError(error.message);
      setSuccessMessage('');
    }
  };

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
      <form onSubmit={handleSubmit}>
        <label>
          Username: <input 
          type="text" 
          placeholder="Username"
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
        </label>
        <label>
          Password: <input 
          type="password" 
          placeholder="Password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        </label>
        <button type="submit">Login</button>
      </form>
    </>
  )

}