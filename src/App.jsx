import React, { useState, useEffect } from "react";
import AnalysisTabs from "./components/AnalysisTabs.jsx";

function App() {
  /* ---------------------------- form state ---------------------------- */
  const [inputText, setInputText] = useState("");
  const [docDate, setDocDate]     = useState("");
  const [language, setLanguage]   = useState("English");
  const [isLoading, setIsLoading] = useState(false);

  /* ---------------------------- viewer state -------------------------- */
  const [analysisData, setAnalysisData] = useState(null);

  /* ---------------------------- saved analyses ------------------------ */
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const STORAGE_KEY = "savedNarrativeAnalyses";
  const MAX_SAVED   = 5;

  // load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedAnalyses(JSON.parse(stored));
      } catch (_) {
        console.warn("Corrupt saved analyses – clearing");
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // helper to persist
  const persist = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

  /* ---------------------------- analyse text -------------------------- */
  const BACKEND_URL = "http://18.206.205.171:5001/analyze";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    setAnalysisData(null);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ doc_date: docDate, input_text: inputText, language }),
      });

      const data = await response.json();

      // enrich with original payload for repeatability
      const fullData = { ...data, original_text: inputText, language };
      setAnalysisData(fullData);

      // store to history (most‑recent first)
      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        docDate,
        summary: fullData.summary?.slice(0, 140) || "(no summary)",
        snippet: inputText.slice(0, 140),
        data: fullData,
      };
      const updated = [entry, ...savedAnalyses].slice(0, MAX_SAVED);
      setSavedAnalyses(updated);
      persist(updated);
    } catch (err) {
      console.error("Error during analysis:", err);
      alert("Analysis failed. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------- render previous list ------------------ */
  const renderSavedList = () => (
    savedAnalyses.length === 0 ? null : (
      <div style={{ marginTop: "2rem" }}>
        <h2>Previous Analyses</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {savedAnalyses.map((a) => (
            <li key={a.id} style={{ marginBottom: "1rem", border: "1px solid #ddd", padding: "0.75rem", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                <strong>Date:</strong> {a.docDate || "N/A"} &nbsp;|&nbsp; <strong>Saved:</strong> {new Date(a.timestamp).toLocaleString()}
              </div>
              <div style={{ marginBottom: "0.5rem" }}>{a.summary}</div>
              <button onClick={() => setAnalysisData(a.data)}>Load</button>
            </li>
          ))}
        </ul>
      </div>
    )
  );

  /* ---------------------------- viewer mode --------------------------- */
  if (analysisData) {
    return (
      <div style={{ margin: "20px", fontFamily: "Arial, sans-serif" }}>
        <button onClick={() => setAnalysisData(null)} style={{ marginBottom: "1rem" }}>← Back to Home</button>
        <AnalysisTabs analysisData={analysisData} />
      </div>
    );
  }

  /* ---------------------------- home / form --------------------------- */
  return (
    <div style={{ margin: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Advanced Narrative Analytics System Infrastructure 2.0</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Document Date: </label>
          <input type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)} style={{ marginLeft: "0.5rem" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Output Language: </label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ marginLeft: "0.5rem" }}>
            <option value="English">English</option>
            <option value="Same as Input Document">Document Language</option>
          </select>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Input Text:</label><br />
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your text here…"
            rows={6}
            style={{ width: "100%", maxWidth: "600px", wordWrap: "break-word", overflowWrap: "break-word" }}
          />
        </div>
        <button type="submit" disabled={isLoading}>{isLoading ? "Analyzing…" : "Analyze Text"}</button>
      </form>

      {renderSavedList()}
    </div>
  );
}

export default App;
