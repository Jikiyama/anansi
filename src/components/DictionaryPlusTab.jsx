import React, { useState } from "react";

function DictionaryPlusTab({ analysisData }) {
  // The user can highlight a substring in the displayed text
  const [selectedText, setSelectedText] = useState("");
  // Store the morphology results from the backend
  const [morphologyResult, setMorphologyResult] = useState(null);
  
  // Use the language from analysisData if available
  const language = analysisData.language || "English";

  // Morphology endpoint
  const BACKEND_URL_MORPHOLOGY = "http://18.206.205.171:5001/analyze_morphology";

  // Called when the user clicks the "Analyze Selected Text" button
  const handleAnalyzeSelected = async () => {
    if (!selectedText.trim()) {
      alert("Please select some text first!");
      return;
    }
    try {
      const response = await fetch(BACKEND_URL_MORPHOLOGY, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          word: selectedText,
          language: language,
        }),
      });
      const data = await response.json();
      setMorphologyResult(data);
    } catch (error) {
      console.error("Error fetching morphology:", error);
      setMorphologyResult({ analysis: "An error occurred." });
    }
  };

  // Whenever the mouse lifts after text selection, capture the selected text
  const handleMouseUp = () => {
    const highlighted = window.getSelection().toString();
    setSelectedText(highlighted);
  };

  return (
    <div>
      <h3>Dictionary+ (Manual Morphological Analysis)</h3>
      
      <p>Select any text below (click and drag). Then click the button to analyze it.</p>

      {/* Display the original text for user selection */}
      <div
        onMouseUp={handleMouseUp}
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "4px",
          width: "100%",
          maxWidth: "600px",
          minHeight: "150px",
          marginBottom: "1rem",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          cursor: "text"
        }}
      >
        {analysisData.original_text || "No text available"}
      </div>

      <button onClick={handleAnalyzeSelected}>
        Analyze Selected Text
      </button>

      {/* Show the currently selected text */}
      {selectedText && (
        <p style={{ marginTop: "1rem" }}>
          <strong>Currently Selected:</strong> <em>{selectedText}</em>
        </p>
      )}

      {/* Show the morphological analysis result if any */}
      {morphologyResult && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "#f9f9f9",
            borderRadius: "4px"
          }}
        >
          <h4>Morphological Analysis Result</h4>
          <p>{morphologyResult.analysis}</p>
        </div>
      )}
    </div>
  );
}

export default DictionaryPlusTab;
