import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { usertype } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usertype) {
      setError('User type is missing from URL (e.g., /register/individual or /register/company)');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username,
          password,
          usertype,
          
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Registration successful! You can now login.');
        setError('');
        setTimeout(() => {
          navigate(`/login/${usertype}`);
        }, 2000);
      } else {
        setError(data.error || '❌ Registration failed.');
        setMessage('');
      }
    } catch {
      setError('Something went wrong. Please try again later.');
      setMessage('');
    }
  };

  return (
    <div
      className="d-flex vh-100 align-items-center justify-content-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Back Arrow Button */}
      <button
        className="btn btn-link position-absolute top-0 start-0 m-3 fs-3 text-white"
        onClick={() => navigate(-1)}
        style={{ zIndex: 10 }}
        title="Go Back"
      >
        <i className="bi bi-arrow-left"></i>
      </button>
      
      <div
        className="card shadow-lg p-4 p-md-5"
        style={{ maxWidth: '420px', borderRadius: '1rem', width: '100%' }}
      >
        <h2 className="text-center mb-4 text-primary fw-bold">
          {usertype === 'company' ? 'Company Registration' : 'Individual Registration'}
        </h2>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-control"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-semibold">
            Register
          </button>
        </form>

        <p className="mt-4 text-center">
          Already have an account?&nbsp;
          <Link to={`/login/${usertype || 'individual'}`} className="text-decoration-none text-primary fw-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
