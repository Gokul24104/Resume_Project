// src/App.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import ResumeUpload from './components/ResumeUpload';
import BulkUpload from './components/BulkUpload';
import LogoutPage from './components/LogoutPage';
import Navbar from './components/Navbar';
import Home from './Home';

function AppWrapper() {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/login/individual', '/login/company', '/register/individual', '/register/company'];
  const hideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/register/:usertype" element={<RegisterPage />} />
        <Route path="/login/:usertype" element={<LoginPage />} />
        <Route path="/resumeupload" element={<ResumeUpload />} />
        <Route path="/bulkupload" element={<BulkUpload />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/login" element={<Navigate to="/login/individual" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
