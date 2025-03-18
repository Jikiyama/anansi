# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
# Import the function that performs the analysis:
from temporal_reasoning import analyze_text_events
from temporal_reasoning import analyze_text_causation
from temporal_reasoning import analyze_text_entities
app = Flask(__name__)
CORS(app)  # Allow CORS so that the React app can fetch from a different port or domain.

@app.route('/', methods=['GET'])
def home():
    """
    Simple test route. 
    """
    return "API is running. POST to /analyze to analyze text."

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Receives a POST with:
      - input_text
      - doc_date
      - language

    Uses analyze_text_events and analyze_text_causation to get the analyses,
    and returns a unified JSON response.
    """
    input_text = request.form.get('input_text', '')
    doc_date_string = request.form.get('doc_date', '')
    language = request.form.get('language', 'English')

    # Perform the analyses
    results = analyze_text_events(input_text, doc_date_string, language)
    causation_analysis = analyze_text_causation(input_text, language)
    entity_relations = analyze_text_entities(input_text, language)
    # Merge the two JSON objects into a unified structure
    unified_json = {
        "events": results.get("events", []),
        "named_entities": results.get("named_entities", {}),
        "temporal_references": results.get("temporal_references", []),
        "important_notes": results.get("important_notes", []),
        "timeline_of_events": results.get("timeline_of_events", []),
        "summary": results.get("summary", ""),
        "events_causation": causation_analysis.get("events_causation", []),
        "causation_relations": causation_analysis.get("causation_relations", []),
        "entity_relations": entity_relations.get("entity_relations",[])
    }

    return jsonify(unified_json)

if __name__ == '__main__':
    # Host on 0.0.0.0 (accessible externally), port 5001
    app.run(host='0.0.0.0', port=5001, debug=True)
