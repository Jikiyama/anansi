import React, { useState, useEffect } from "react";
import AnalysisTabs from "./components/AnalysisTabs.jsx";

/* -------------------------------- helpers ------------------------------ */
const STORAGE_KEY = "savedNarrativeAnalyses";
const MAX_SAVED   = 5;
const BACKEND_URL = "http://18.206.205.171:5001/analyze";

/** Minimal schema check for an uploaded analysis-JSON */
function isValidAnalysisJson(obj) {
  return (
    obj &&
    typeof obj === "object" &&
    Array.isArray(obj.events) &&
    typeof obj.summary === "string" &&
    typeof obj.named_entities === "object"
  );
}

function App() {
  /* ---------------------------- form state ---------------------------- */
  const [mode, setMode]           = useState("text");   // "text" | "json"
  const [inputText, setInputText] = useState("");
  const [inputFile, setInputFile] = useState(null);
  const [docDate, setDocDate]     = useState("");
  const [language, setLanguage]   = useState("English");
  const [isLoading, setIsLoading] = useState(false);

  /* ---------------------------- viewer state -------------------------- */
  const [analysisData, setAnalysisData] = useState(null);

  /* ---------------------------- saved analyses ------------------------ */
  const [savedAnalyses, setSavedAnalyses] = useState([]);

  /* ------------ load history from localStorage on first mount -------- */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedAnalyses(JSON.parse(stored));
      } catch {
        console.warn("Corrupt saved analyses – clearing");
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const persist = (arr) =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

  /* ---------------------- analyse TEXT via backend ------------------- */
  const submitTextForAnalysis = async () => {
    setIsLoading(true);
    setAnalysisData(null);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          doc_date: docDate,
          input_text: inputText,
          language,
        }),
      });

      const data = await response.json();
      const fullData = { ...data, original_text: inputText, language };
      setAnalysisData(fullData);
      saveToHistory(fullData, inputText.slice(0, 140));
    } catch (err) {
      console.error("Error during analysis:", err);
      alert("Analysis failed. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------- load JSON locally ----------------------- */
  const submitJsonForAnalysis = async () => {
    if (!inputFile) {
      alert("Please choose a JSON file first.");
      return;
    }
    setIsLoading(true);
    try {
      const text = await inputFile.text();
      const parsed = JSON.parse(text);

      if (!isValidAnalysisJson(parsed)) {
        alert(
          "The uploaded JSON is not in the expected format.\n" +
            "Make sure it contains keys like 'events', 'named_entities', and 'summary'."
        );
        return;
      }
      setAnalysisData(parsed);
      saveToHistory(
        parsed,
        "(loaded from JSON)",
        parsed.summary?.slice(0, 140) || "(no summary)"
      );
    } catch (err) {
      console.error(err);
      alert("Could not read or parse the file. Make sure it is valid JSON.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ----------------------- shared form submit ------------------------ */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "text") {
      if (!inputText.trim()) return;
      submitTextForAnalysis();
    } else {
      submitJsonForAnalysis();
    }
  };

  /* ----------------------------- history ----------------------------- */
  const saveToHistory = (dataObj, snippet, summaryOverride) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      docDate,
      summary: summaryOverride || dataObj.summary?.slice(0, 140) || "",
      snippet,
      data: dataObj,
    };
    const updated = [entry, ...savedAnalyses].slice(0, MAX_SAVED);
    setSavedAnalyses(updated);
    persist(updated);
  };

  const renderSavedList = () =>
    savedAnalyses.length === 0 ? null : (
      <div style={{ marginTop: "2rem" }}>
        <h2>Previous Analyses</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {savedAnalyses.map((a) => (
            <li
              key={a.id}
              style={{
                marginBottom: "1rem",
                border: "1px solid #ddd",
                padding: "0.75rem",
                borderRadius: "6px",
              }}
            >
              <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                <strong>Date:</strong> {a.docDate || "N/A"} &nbsp;|&nbsp;
                <strong>Saved:</strong>{" "}
                {new Date(a.timestamp).toLocaleString()}
              </div>
              <div style={{ marginBottom: "0.5rem" }}>{a.summary}</div>
              <button onClick={() => setAnalysisData(a.data)}>Load</button>
            </li>
          ))}
        </ul>
      </div>
    );

  /* ---------------------------- viewer mode --------------------------- */
  if (analysisData) {
    return (
      <div style={{ margin: "20px", fontFamily: "Arial, sans-serif" }}>
        <button
          onClick={() => setAnalysisData(null)}
          style={{ marginBottom: "1rem" }}
        >
          ← Back to Home
        </button>
        <AnalysisTabs analysisData={analysisData} />
      </div>
    );
  }

  /* ---------------------------- home / form --------------------------- */
  return (
    <div style={{ margin: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Advanced Narrative Analytics System Infrastructure 2.0</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        {/* ---------- input-source toggle ---------- */}
        <fieldset style={{ marginBottom: "1rem" }}>
          <legend style={{ fontWeight: "bold" }}>Input source:</legend>
          <label style={{ marginRight: "1.5rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="mode"
              value="text"
              checked={mode === "text"}
              onChange={() => setMode("text")}
            />{" "}
            Text
          </label>
          <label style={{ cursor: "pointer" }}>
            <input
              type="radio"
              name="mode"
              value="json"
              checked={mode === "json"}
              onChange={() => setMode("json")}
            />{" "}
            JSON file
          </label>
        </fieldset>

        {/* ---------- document date & language (text mode only) ---------- */}
        {mode === "text" && (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <label>Document Date: </label>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                style={{ marginLeft: "0.5rem" }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>Output Language: </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ marginLeft: "0.5rem" }}
              >
                <option value="English">English</option>
                <option value="Same as Input Document">
                  Document Language
                </option>
              </select>
            </div>
          </>
        )}

        {/* ---------- text or file input ---------- */}
        {mode === "text" ? (
          <div style={{ marginBottom: "1rem" }}>
            <label>Input Text:</label>
            <br />
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here…"
              rows={6}
              style={{
                width: "100%",
                maxWidth: "600px",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            />
          </div>
        ) : (
          <div style={{ marginBottom: "1rem" }}>
            <label>Choose JSON file: </label>
            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => setInputFile(e.target.files?.[0] ?? null)}
              style={{ marginLeft: "0.5rem" }}
            />
          </div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading
            ? mode === "text"
              ? "Analyzing…"
              : "Loading…"
            : mode === "text"
            ? "Analyze Text"
            : "Load JSON"}
        </button>
      </form>

      {renderSavedList()}
    </div>
  );
}

export default App;
