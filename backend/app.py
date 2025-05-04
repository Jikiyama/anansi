# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
# Import the function that performs the analysis:
from temporal_reasoning import analyze_text_events
from temporal_reasoning import analyze_text_causation
from temporal_reasoning import analyze_text_entities
from temporal_reasoning import analyze_parts_of_speech
from temporal_reasoning import analyze_word_morphology

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
        # Structured event-to-event relations (causation, temporal ordering, etc.)
        # The new analyze_text_causation() format returns {
        #   "events": { "e1": "…", ... },
        #   "relations": [ { "source": "e1", "target": "e2", "type": "CAUSES" }, ... ]
        # }
        # We expose this unaltered under the key `event_relations` for the frontend.
        "event_relations": causation_analysis,

        # Entity-to-entity relations extracted by analyze_text_entities()
        "entity_relations": entity_relations.get("entity_relations", [])
    }

    return jsonify(unified_json)

@app.route('/analyze_pos', methods=['POST'])
def analyze_pos():
    """
    Receives a POST with:
      - input_text
    
    Uses analyze_parts_of_speech to get the part of speech for each token.
    """
    input_text = request.form.get('input_text', '')
    
    # Perform the analysis
    results = analyze_parts_of_speech(input_text)
    
    return jsonify(results)

@app.route('/analyze_morphology', methods=['POST'])
def analyze_morphology():
    """
    Receives a POST with:
      - word
      - language
    
    Uses analyze_word_morphology to get detailed morphological analysis for a word.
    """
    word = request.form.get('word', '')
    language = request.form.get('language', 'English')
    
    # Perform the analysis
    results = analyze_word_morphology(word, language)
    
    return jsonify(results)

if __name__ == '__main__':
    # Host on 0.0.0.0 (accessible externally), port 5001
    app.run(host='0.0.0.0', port=5001, debug=True)
