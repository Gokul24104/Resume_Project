import React, { useState } from "react";
import axios from "axios";
import {
  FaFileUpload,
  FaClipboardList,
  FaMagic,
  FaRobot,
  FaCheckCircle,
  FaSpinner,
  FaLightbulb,
} from "react-icons/fa";

const BASE_URL = "https://resume-project-i2f8.onrender.com"; // Replace with your deployed backend URL

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [jdInputMethod, setJdInputMethod] = useState("text");
  const [jdFile, setJdFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [enhancement, setEnhancement] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);

    if (jdInputMethod === "file" && jdFile) {
      formData.append("jd_file", jdFile);
    } else {
      formData.append("jd_text", jobDescription);
    }

    try {
      const res = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // ensures cookies sent
      });

      setResponse(res.data);
      setError(null);
      setEnhancement("");
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
      setResponse(null);
      setEnhancement("");
    } finally {
      setLoading(false);
    }
  };

  const handleEnhance = async () => {
    if (!response?.resume_text) {
      setError("No resume text to enhance");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/enhance_resume`,
        {
          resume_text: response.resume_text,
          job_description: jdInputMethod === "file" ? "" : jobDescription,
        },
        {
          withCredentials: true, // ensures cookies sent here too
        }
      );
      setEnhancement(res.data.enhanced_feedback);
      setError(null);
    } catch (err) {
      setError("Failed to get enhancement");
      setEnhancement("");
    } finally {
      setLoading(false);
    }
  };

  const scoreColorClass =
    response?.match_score >= 80
      ? "bg-success"
      : response?.match_score >= 50
      ? "bg-warning text-dark"
      : "bg-danger";

  return (
    <div className="container my-5" style={{ maxWidth: "850px" }}>
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">AI Resume Screener</h1>
        <p className="lead text-muted">
          Upload your resume and a job description to get skill match analysis,
          improvement tips, and AI enhancement.
        </p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card p-3 h-100 shadow border-primary">
            <h5>
              <FaFileUpload className="me-2 text-primary" />
              Upload Resume
            </h5>
            <input
              type="file"
              className="form-control mt-2"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file && <small className="text-muted mt-2">Selected: {file.name}</small>}
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
              value={jdInputMethod}
              onChange={(e) => setJdInputMethod(e.target.value)}
            >
              <option value="text">Paste Text</option>
              <option value="file">Upload File</option>
            </select>

            {jdInputMethod === "file" && (
              <div className="mt-3">
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,.docx"
                  onChange={(e) => setJdFile(e.target.files[0])}
                />
                {jdFile && (
                  <small className="text-muted mt-2">Selected: {jdFile.name}</small>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {jdInputMethod === "text" && (
        <div className="mb-4">
          <label htmlFor="jdText" className="form-label fw-bold">
            Job Description Text
          </label>
          <textarea
            id="jdText"
            rows={6}
            className="form-control"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
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
            <FaMagic className="me-2" />
            Upload and Analyze
          </>
        )}
      </button>

      {error && (
        <div className="alert alert-danger mt-3" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-5 p-4 bg-light rounded shadow-sm border">
          <h4 className="mb-4 text-primary">
            <FaCheckCircle className="me-2" />
            Analysis Result
          </h4>

          <div className="mb-4">
            <h5>Match Score</h5>
            <span className={`badge fs-5 px-3 py-2 ${scoreColorClass}`}>
              {response.match_score}%
            </span>
          </div>

          <div className="mb-4">
            <h5>Missing Skills</h5>
            {response.missing_skills.length ? (
              <div className="d-flex flex-wrap gap-2">
                {response.missing_skills.map((skill) => (
                  <span
                    key={skill}
                    className="badge bg-secondary p-2 text-truncate"
                    style={{ maxWidth: "150px" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-success">No missing skills — great match!</p>
            )}
          </div>

          <div className="mb-4">
            <h5>
              <FaLightbulb className="me-2 text-warning" />
              Learning Suggestions
            </h5>
            {response.learning_suggestions &&
            Object.keys(response.learning_suggestions).length > 0 ? (
              <ul className="list-group">
                {Object.entries(response.learning_suggestions).map(([skill, url]) => (
                  <li
                    key={skill}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {skill}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      Learn
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No learning suggestions available.</p>
            )}
          </div>

          <button
            className="btn btn-outline-secondary w-100 mt-3"
            onClick={handleEnhance}
            disabled={loading}
          >
            <FaRobot className="me-2" />
            Get AI Resume Enhancement Suggestions
          </button>
        </div>
      )}

      {enhancement && (
        <div className="mt-5">
          <h4 className="mb-3">
            <FaMagic className="me-2 text-success" />
            AI Enhancement Feedback
          </h4>
          <div
            className="p-3 border rounded shadow-sm"
            style={{
              whiteSpace: "pre-wrap",
              maxHeight: "300px",
              overflowY: "auto",
              backgroundColor: "#f8f9fa",
            }}
          >
            {enhancement}
          </div>
        </div>
      )}

      <footer className="text-center mt-5 text-muted small">
        &copy; {new Date().getFullYear()} Smart Resume Screener · Built with ❤️ using React & Flask
      </footer>
    </div>
  );
}

export default ResumeUpload;
