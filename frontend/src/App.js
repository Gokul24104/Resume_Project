import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ResumeUpload from "./components/ResumeUpload";
import BulkUpload from "./components/BulkUpload";
import About from "./components/About";
import Home from "./Home";  // import Home

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />   {/* Landing Page */}
        <Route path="/home" element={<Home />} />      {/* Home Page */}
        <Route path="/upload" element={<ResumeUpload />} />
        <Route path="/bulk-upload" element={<BulkUpload />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
