"""
A simple script to test the logging functionality of temporal_reasoning.py
"""

from temporal_reasoning import (
    analyze_text_entities,
    analyze_text_causation,
    analyze_text_events,
    analyze_parts_of_speech,
    analyze_word_morphology
)

def test_logging():
    """Test the logging functionality for each function."""
    
    # Sample text for testing
    sample_text = """
    On January 15, 2023, President Biden announced a new economic policy. 
    The policy aims to reduce inflation and create jobs. 
    As a result of this announcement, the stock market rose by 2%.
    """
    
    # Test each function
    print("Testing analyze_text_entities...")
    analyze_text_entities(sample_text, "English")
    
    print("Testing analyze_text_causation...")
    analyze_text_causation(sample_text, "English")
    
    print("Testing analyze_text_events...")
    analyze_text_events(sample_text, "2023-01-20", "English")
    
    print("Testing analyze_parts_of_speech...")
    analyze_parts_of_speech(sample_text)
    
    print("Testing analyze_word_morphology...")
    analyze_word_morphology("announced", "English")
    
    print("All tests completed. Check the logs directory for the output files.")

if __name__ == "__main__":
    test_logging() 