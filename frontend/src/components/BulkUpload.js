import React, { useState } from "react";
import { FaFileUpload, FaClipboardList, FaSpinner, FaCheckCircle } from "react-icons/fa";
import Navbar from "./Navbar";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
export default function BulkUpload() {
  const [jdInputType, setJdInputType] = useState("text");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState(null);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJdFileChange = (e) => {
    setJdFile(e.target.files[0]);
  };

  const handleResumeFilesChange = (e) => {
    setResumeFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (jdInputType === "text" && !jdText) {
      setError("Please provide Job Description text.");
      return;
    }
    if (jdInputType === "file" && !jdFile) {
      setError("Please upload a Job Description file.");
      return;
    }
    if (resumeFiles.length === 0) {
      setError("Please upload at least one resume file.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      jdInputType === "file"
        ? formData.append("jd_file", jdFile)
        : formData.append("jd_text", jdText);
      resumeFiles.forEach((file) => formData.append("resumes", file));

      const response = await fetch(`${BASE_URL}/upload_bulk`, {
        method: "POST",
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to upload and analyze.");
        setResults([]);
      } else {
        setResults(data.results);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error uploading files. Please try again.");
      setResults([]);
    }
    setLoading(false);
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return "bg-success";
    if (score >= 50) return "bg-warning text-dark";
    return "bg-danger";
  };
  console.log("Results for table:", results);

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="container my-5" style={{ maxWidth: "850px" }}>
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold">
              <FaFileUpload className="me-2 text-primary" />
              Company Bulk Resume Screener
            </h1>
            <p className="lead text-muted">
              Upload multiple resumes and a job description to screen and rank candidates based on skill match.
            </p>
          </div>
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="card p-3 h-100 shadow border-primary">
                <h5>
                  <FaFileUpload className="me-2 text-primary" />
                  Upload Resumes
                </h5>
                <input
                  type="file"
                  multiple
                  className="form-control mt-2"
                  accept=".pdf,.docx"
                  onChange={handleResumeFilesChange}
                />
                {resumeFiles.length > 0 && (
                  <small className="text-muted mt-2">{resumeFiles.length} file(s) selected</small>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="card p-3 h-100 shadow border-success">
                <h5>
                  <FaClipboardList className="me-2 text-success" />
                  Job Description
                </h5>
                <select
                  className="form-select mt-2"
                  value={jdInputType}
                  onChange={(e) => {
                    setJdInputType(e.target.value);
                    setJdText("");
                    setJdFile(null);
                  }}
                >
                  <option value="text">Paste Text</option>
                  <option value="file">Upload File</option>
                </select>

                {jdInputType === "file" && (
                  <div className="mt-3">
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.docx"
                      onChange={handleJdFileChange}
                    />
                    {jdFile && (
                      <small className="text-muted mt-2">Selected: {jdFile.name}</small>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {jdInputType === "text" && (
            <div className="mb-4">
              <label htmlFor="jdText" className="form-label fw-bold">
                Job Description Text
              </label>
              <textarea
                id="jdText"
                rows={6}
                className="form-control"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job description here"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="me-2 spinner-border-sm" /> Analyzing...
              </>
            ) : (
              <>
                <FaFileUpload className="me-2" />
                Upload and Analyze
              </>
            )}
          </button>

          {error && (
            <div className="alert alert-danger mt-3" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-5 p-4 bg-light rounded shadow-sm border">
              <h4 className="mb-4 text-primary">
                <FaCheckCircle className="me-2" />
                Screening Results
              </h4>
              {results.length > 0 && (
                <div className="mt-4 text-end">
                  <button
                    className="btn btn-outline-success ms-2"
                    onClick={async () => {
                      const response = await fetch(`${BASE_URL}/download_report`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ results }),
                      });
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "resume_report.pdf";
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    Download Summary PDF
                  </button>
                  <button
                    className="btn btn-outline-success ms-2"
                    onClick={async () => {
                      const response = await fetch(`${BASE_URL}/download_report_excel`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ results }),
                      });
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "resume_report.xlsx";
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    Download Excel
                  </button>
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Resume</th>
                      <th>Match Score</th>
                      <th>Missing Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((res, index) => (
                      <tr key={index}>
                        <td>{res.filename}</td>
                        <td>
                          <span className={`badge fs-6 px-3 py-2 ${getScoreBadgeClass(res.match_score)}`}>
                            {res.match_score}%
                          </span>
                        </td>
                        <td>
                          {res.missing_skills.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2">
                              {res.missing_skills.map((skill, i) => (
                                <span
                                  key={i}
                                  className="badge bg-secondary p-2 text-truncate"
                                  style={{ maxWidth: "150px" }}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-success">No missing skills</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          )}

          <footer className="text-center mt-5 text-muted small">
            &copy; {new Date().getFullYear()} Smart Resume Screener · Built with ❤️ using React & Flask
          </footer>
        </div>
      </div>
    </>
  );
}
