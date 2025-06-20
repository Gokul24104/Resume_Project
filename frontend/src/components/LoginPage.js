import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { usertype } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        // 🔍 Immediately verify session
        const sessionCheck = await fetch('http://localhost:5000/api/check_session', {
          method: 'GET',
          credentials: 'include'
        });
        const sessionData = await sessionCheck.json();
        console.log('🔍 Session Check:', sessionData);

        // ✅ Navigate only if session is valid
        if (sessionData.logged_in) {
          if (usertype === 'individual') {
            navigate('/resumeupload');
          } else if (usertype === 'company') {
            navigate('/bulkupload');
          } else {
            navigate('/home');
          }
        } else {
          setError('Session not set. Please enable cookies and try again.');
        }
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again later.');
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
          {usertype === 'company' ? 'Company Login' : 'Individual Login'}
        </h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
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
            Login
          </button>
        </form>

        <p className="mt-4 text-center">
          Don't have an account?&nbsp;
          <Link
            to={`/register/${usertype || 'individual'}`}
            className="text-decoration-none text-primary fw-semibold"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
