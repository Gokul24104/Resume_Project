// src/components/LogoutPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'https://resume-project-i2f8.onrender.com'; // Your deployed backend URL

function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true })
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
