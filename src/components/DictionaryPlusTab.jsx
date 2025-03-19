import React, { useState, useEffect } from "react";

// Define colors for different parts of speech
const posColors = {
  "Noun": "#FF9999", // Light red
  "Proper Noun": "#FF6666", // Darker red
  "Pronoun": "#FFCC99", // Light orange
  "Verb": "#99FF99", // Light green
  "Adjective": "#9999FF", // Light blue
  "Adverb": "#CC99FF", // Light purple
  "Preposition": "#FFFF99", // Light yellow
  "Conjunction": "#99FFFF", // Light cyan
  "Interjection": "#FF99FF", // Light magenta
  "Article": "#CCCCCC", // Light gray
  "Numeral": "#FFCC66", // Light gold
  "Determiner": "#66CCFF", // Sky blue
  "Auxiliary Verb": "#66FF66", // Brighter green
  "Particle": "#FF66FF", // Brighter magenta
  "Punctuation": "#999999", // Gray
  "default": "#FFFFFF" // Default white
};

function DictionaryPlusTab({ analysisData }) {
  const [posData, setPosData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [morphology, setMorphology] = useState(null);
  const [selectedWord, setSelectedWord] = useState("");
  
  // Backend URL - should match your setup
  const BACKEND_URL_POS = "http://18.206.205.171:5001/analyze_pos";
  const BACKEND_URL_MORPHOLOGY = "http://18.206.205.171:5001/analyze_morphology";
  
  useEffect(() => {
    const fetchPosData = async () => {
      setIsLoading(true);
      try {
        // Use the original input text from the analysis data
        const originalText = analysisData.original_text || "No text available";
        
        const response = await fetch(BACKEND_URL_POS, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            input_text: originalText,
          }),
        });
        
        const data = await response.json();
        setPosData(data);
      } catch (error) {
        console.error("Error fetching POS data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosData();
  }, [analysisData]);
  
  const handleWordClick = async (word, language) => {
    setSelectedWord(word);
    setMorphology(null); // Clear previous analysis
    
    try {
      const response = await fetch(BACKEND_URL_MORPHOLOGY, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          word: word,
          language: language || "English",
        }),
      });
      
      const data = await response.json();
      setMorphology(data);
    } catch (error) {
      console.error("Error fetching morphology:", error);
    }
  };
  
  const renderColorCodedText = () => {
    if (!posData || !posData.parts_of_speech) {
      return <p>No part of speech data available.</p>;
    }
    
    return (
      <div style={{ lineHeight: 1.6 }}>
        {posData.parts_of_speech.map((item, index) => (
          <span
            key={index}
            style={{
              backgroundColor: posColors[item.partOfSpeech] || posColors.default,
              padding: '2px 0',
              margin: '0 1px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
            onClick={() => handleWordClick(item.token, analysisData.language || "English")}
            title={`Click for morphological analysis of "${item.token}"`}
          >
            {item.token}
          </span>
        ))}
      </div>
    );
  };
  
  const renderPosLegend = () => {
    return (
      <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <h4 style={{ width: '100%' }}>Legend:</h4>
        {Object.entries(posColors).filter(([key]) => key !== 'default').map(([pos, color]) => (
          <div key={pos} style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: color,
                marginRight: '5px',
                borderRadius: '3px'
              }}
            ></div>
            <span>{pos}</span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <h3>Dictionary+ Analysis</h3>
      
      {isLoading ? (
        <p>Loading part of speech analysis...</p>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h4>Text with Color-Coded Parts of Speech</h4>
            <p>Click on any word for morphological analysis.</p>
            {renderColorCodedText()}
          </div>
          
          {renderPosLegend()}
          
          {morphology && (
            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
              <h4>Morphological Analysis for: <em>{selectedWord}</em></h4>
              <p>{morphology.analysis}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DictionaryPlusTab; 