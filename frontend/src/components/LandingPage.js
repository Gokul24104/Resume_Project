import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex vh-100 align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="card shadow-lg p-5 text-center" style={{ maxWidth: "480px", borderRadius: "1rem" }}>
        <h1 className="mb-4 text-primary fw-bold">Resume Screener</h1>
        <p className="mb-5 text-secondary">
          AI-powered resume screening and career advisory made simple and effective.
        </p>

        <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
          <button
            className="btn btn-outline-primary btn-lg d-flex align-items-center gap-2 flex-grow-1"
            onClick={() => navigate("/register/individual")}
          >
            <i className="bi bi-person-fill"></i>
            Individuals
          </button>
          <button
            className="btn btn-outline-primary btn-lg d-flex align-items-center gap-2 flex-grow-1"
            onClick={() => navigate("/register/company")}
          >
            <i className="bi bi-building"></i>
             Companies
          </button>
        </div>
      </div>
    </div>
  );
}
