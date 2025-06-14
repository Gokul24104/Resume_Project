// src/components/LogoutPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    axios.post('http://localhost:5000/logout', {}, { withCredentials: true })
      .then(() => {
        navigate('/');
      })
      .catch((err) => {
        console.error('Logout failed:', err);
        navigate('/');
      });
  }, [navigate]);

  return <p className="text-center mt-5">Logging out...</p>;
}

export default LogoutPage;
