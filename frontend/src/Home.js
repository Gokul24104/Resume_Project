import React from 'react';
import Navbar from './components/Navbar'; 

export default function Home() {
  return (
    <>
    <Navbar />
    <div>
      {/* Hero Section */}
      <section
        className="d-flex flex-column justify-content-center align-items-center text-center text-white"
        style={{
          height: '50vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '0 1rem',
        }}
      >
        <h1 className="display-4 fw-bold mb-3">Smart Resume Screener</h1>
        <p className="lead mb-4">
          Enhance your career prospects or streamline your hiring with AI-powered resume screening.
        </p>
        <a href="/register/individual" className="btn btn-light btn-lg px-4 me-3">
          Get Started
        </a>
        <a href="/about" className="btn btn-outline-light btn-lg px-4">
          Learn More
        </a>
      </section>

      {/* Features Section */}
      <section className="container py-5">
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="mb-3 fs-1">📄</div>
                <h5 className="card-title">Individual Resume Analysis</h5>
                <p className="card-text">
                  Upload your resume to get instant AI feedback and personalized job suggestions.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="mb-3 fs-1">🏢</div>
                <h5 className="card-title">Company Bulk Screening</h5>
                <p className="card-text">
                  Easily upload bulk resumes and job descriptions to find perfect matches fast.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="mb-3 fs-1">🤖</div>
                <h5 className="card-title">AI-powered Matching</h5>
                <p className="card-text">
                  Our NLP and AI algorithms analyze skills and fit for smarter hiring and job search.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
