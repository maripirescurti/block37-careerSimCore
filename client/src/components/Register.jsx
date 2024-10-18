import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register({ setToken }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, username, email, password }),
      });

      const result = await response.json();

      console.log('Response:', result);


      if (!response.ok) {
        throw new Error(result.message || 'Sign up failed.')
      }
      
      setToken(result.token);
      setSuccessMessage('Registration successful! You can now log in.')
      setError(null);

      setFirstName('');
      setLastName('');
      setUsername('');
      setEmail('');
      setPassword('');

      // navigate('/login');

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
          First Name: <input
            value={firstName}
            placeholder="First Name"
            onChange={(e) => setFirstName(e.target.value)} />
        </label>
        <label>
          Last Name: <input
            value={lastName}
            placeholder="Last Name"
            onChange={(e) => setLastName(e.target.value)} />
        </label>
        <label>
          Username: <input
            value={username}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Email: <input
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password: <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button>Submit</button>
      </form>
      <p>
        Already have an account? <a href="/login">Sign in here!</a>
      </p>
    </>
  )
}