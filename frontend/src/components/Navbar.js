import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand fs-4" to="/">AI Resume Screener</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="nav-link fs-6" to="/home">Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link fs-6" to="/resumeupload">Resume Upload</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link fs-6" to="/bulkupload">Bulk Upload</Link>
          </li>
        </ul>
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link
              className="btn btn-outline-danger ms-lg-3 fs-5 px-3"
              to="/logout"
              style={{ fontWeight: 600 }}
            >
              Logout
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;