import React, { useState } from "react";
import AnalysisTabs from "./components/AnalysisTabs.jsx";

function App() {
  const [inputText, setInputText] = useState("");
  const [docDate, setDocDate] = useState("");
  const [language, setLanguage] = useState("English");
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Replace with your actual backend URL if needed:
  const BACKEND_URL = "http://18.206.205.171:5001/analyze";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAnalysisData(null);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          doc_date: docDate,
          input_text: inputText,
          language: language,
        }),
      });
      const data = await response.json();
      
      // Debug log to see what's coming from the API
      console.log("API Response:", data);
      console.log("Timeline data:", data.timeline_of_events);
      console.log("Causation data:", data.events_causation, data.causation_relations);
      console.log("Entity relations:", data.entity_relations);
      
      // Include the original input text and language in the analysis data
      setAnalysisData({
        ...data,
        original_text: inputText,
        language: language
      });
    } catch (error) {
      console.error("Error during analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Once analysisData is received, show only the AnalysisTabs (taking the whole page)
  if (analysisData) {
    return (
      <div style={{ margin: "20px", fontFamily: "Arial, sans-serif" }}>
        <AnalysisTabs analysisData={analysisData} />
      </div>
    );
  }

  return (
    <div style={{ margin: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Advanced Narrative Analytics System Infrastructure 2.0</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
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
            <option value="Same as Input Document">Document Language</option>
          </select>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Input Text:</label>
          <br />
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your text here..."
            rows={6}
            // Make sure the textarea is not too wide and wraps text
            style={{
              width: "100%",
              maxWidth: "600px",
              wordWrap: "break-word",
              overflowWrap: "break-word"
            }}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Analyzing..." : "Analyze Text"}
        </button>
      </form>
    </div>
  );
}

export default App;
