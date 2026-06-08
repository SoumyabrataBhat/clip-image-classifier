import { useState, useRef, useCallback } from "react";
import { classifyImage } from "./api";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const inputRef = useRef();

  const setFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setShowResult(false);
  }, []);

  const handleSelect = (e) => setFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    setFile(e.dataTransfer.files[0]);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);

  const handleClassify = async () => {
    if (!image || loading) return;
    setLoading(true);
    setShowResult(false);
    try {
      const data = await classifyImage(image);
      setResult(data);
      setTimeout(() => setShowResult(true), 50);
    } catch {
      setResult({ label: "Error", confidence: 0, top_5: [], description: null });
      setTimeout(() => setShowResult(true), 50);
    }
    setLoading(false);
  };

  const desc = result?.description;

  return (
    <div className="app">
      <div className="bg-gradient" />
      <div className="bg-orb top-right" />
      <div className="bg-orb bottom-left" />

      <header className="header">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        <h1>Image Classifier</h1>
        <p className="subtitle">Drop any image&mdash;classified against 1,000 classes</p>
      </header>

      <div className="split-panel">
        <div
          className={`upload-box ${dragOver ? "drag-over" : ""}`}
          onClick={() => inputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {preview ? (
            <img src={preview} alt="preview" className="preview" />
          ) : (
            <div className="upload-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p>Choose or drag</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleSelect} />
        </div>

        <div className={`desc-box ${showResult && result ? "visible" : ""}`}>
          {result && showResult && desc ? (
            <p className="desc-text">{desc}.</p>
          ) : result && showResult && !desc ? (
            <p className="desc-text desc-muted">No description available.</p>
          ) : (
            <div className="desc-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p>Description will appear here</p>
            </div>
          )}
        </div>
      </div>

      <button
        className={`classify-btn ${loading ? "loading" : ""}`}
        onClick={handleClassify}
        disabled={!image || loading}
      >
        {loading ? (
          <span className="btn-content">
            <span className="spinner" />
            Classifying…
          </span>
        ) : (
          "Classify Image"
        )}
      </button>

      {result && showResult && (
        <div className="result-card">
          <div className="result-header">
            <h2>{result.label}</h2>
            <span className="badge" style={result.label === "Error" ? { background: "#e74c3c" } : {}}>
              {(result.confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(result.confidence * 100).toFixed(1)}%` }} />
          </div>
          <table className="top5">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Class</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {result.top_5.map((item, i) => (
                <tr key={item.label} style={{ animationDelay: `${i * 80}ms` }}>
                  <td className="rank">#{i + 1}</td>
                  <td>{item.label}</td>
                  <td className="score">{(item.score * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
