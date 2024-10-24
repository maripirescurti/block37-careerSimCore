import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "./API";

export default function Register({ setToken }) {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      // Register the user
      await registerUser(first_name, last_name, username, email, password);

      // Automatically log in the user
      const loginResult = await loginUser(username, password);

      console.log('Login Response:', loginResult);

      setToken(loginResult.token);
      setSuccessMessage('Registration successful! You are now logged in.');
      setError(null);

      // Reset form
      setFirstName('');
      setLastName('');
      setUsername('');
      setEmail('');
      setPassword('');

      // Navigate to the home page or user dashboard
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setSuccessMessage('');
    }
  }

  return (
    <>
      <h2>Register</h2>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          First Name: 
          <input
            value={first_name}
            placeholder="First Name"
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>
        <label>
          Last Name: 
          <input
            value={last_name}
            placeholder="Last Name"
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>
        <label>
          Username: 
          <input
            value={username}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Email: 
          <input
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password: 
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Submit</button>
      </form>

      <p>
        Already have an account? <a href="/login">Sign in here!</a>
      </p>
    </>
  );
}