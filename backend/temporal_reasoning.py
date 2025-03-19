# temporal_reasoning.py
import json
from openai import OpenAI


def analyze_text_entities(input_text : str, language : str):
    instructions = """ 
    You are an expert text analyst. You are given a text passage (one or more sentences). Your task is to perform a structured, in-depth analysis of the text and return the results in JSON format.
In this specific case, you are tasked with understanding the causation relations between the entities mentioned in the text which include. Your answer should be presented, ONLY AND SPECIFICALLY, as a json with the following contents:

The relationships we want to capture should illustrate how the entities are related to each other, for example, in the sentence:

The cat was taken to the veterinary by their owner

owner ---[owns]---> cat
veterinary ---[treats]---> cat

The relation should be captured by a single word verb that describes how the source entity is related to the target entity.
Deliver a response like this
{
   "entity_relations":[
        {
             "source_entity":"",
             "target_entity":""
             "relation":""
        },
        {
             "source_relation":"",
             "target_entity":""
             "relation":""
        }
    ]
}
    Here is the input text: 
    """
    
    instructions = instructions + f"\nHere is the input text:\n{input_text}\nIMPORTANT: MAKE SURE THE OUTPUT/ANALYSIS WRITTEN TO THE JSON IS WRITTEN IN THIS LANGUAGE: {language}\n"
    client = OpenAI(api_key='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')
    response = client.chat.completions.create(
        model="o3-mini",
        messages=[{"role": "user", "content": instructions}]
    )
    print(response.choices[0].message.content.strip())
    raw_answer = response.choices[0].message.content.strip()
    raw_answer = raw_answer.replace("```json", "").replace("```", "")
    final_json_str = raw_answer.strip()
    print(final_json_str)
    try:
        analysis_json = json.loads(final_json_str)
    except json.JSONDecodeError:
        analysis_json = {
            "events_causation": [],
            "causation_relations": [],
            "error": "JSON parsing failed. Raw output was:\n" + final_json_str
        }
    return analysis_json

def analyze_text_causation(input_text : str, language : str):
    instructions = """ 
    You are an expert text analyst. You are given a text passage (one or more sentences). Your task is to perform a structured, in-depth analysis of the text and return the results in JSON format.
In this specific case, you are tasked with understanding the causation relations between the events in the text. Your answer should be presented, ONLY AND SPECIFICALLY, as a json with the following contents:

{
   "events_causation":[
        {
            "occurrence_summary":""
        },
        {
           "occurrence_summary":""
        }
    ]
   "causation_relations":[
        {
             "source_occurrence_summary":"",
             "target_occurrence_summary":""
        },
        {
             "source_occurrence_summary":"",
             "target_occurrence_summary":""
        }
    ]
}

Note that, the occurrence summary in the causation relations should be exactly as they appear in the occurrence_summmary on top. Only fill out the json file if there are proven CAUSATION relations, if there are none, it is fine to return an empty json. Causation relations are events that lead to another, for example, in the sentence:

In response to President Trump's tariffs, China has now enacted tariffs of their own

So in this case, Trump Imposes Tariffs on China has a causation relation directed towards China Imposes Tariffs on the U.S. Write the occurrence summaries in the voice shown, speaking as a matter of fact.
    The occurrence summaries should also be short, try to keep them to a few words.
    Here is the input text: 
    """
    
    instructions = instructions + f"\nHere is the input text:\n{input_text}\nIMPORTANT: MAKE SURE THE OUTPUT/ANALYSIS WRITTEN TO THE JSON IS WRITTEN IN THIS LANGUAGE: {language}\n"
    client = OpenAI(api_key='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')
    response = client.chat.completions.create(
        model="o3-mini",
        messages=[{"role": "user", "content": instructions}]
    )
    print(response.choices[0].message.content.strip())
    raw_answer = response.choices[0].message.content.strip()
    raw_answer = raw_answer.replace("```json", "").replace("```", "")
    final_json_str = raw_answer.strip()
    print(final_json_str)
    try:
        analysis_json = json.loads(final_json_str)
    except json.JSONDecodeError:
        analysis_json = {
            "events_causation": [],
            "causation_relations": [],
            "error": "JSON parsing failed. Raw output was:\n" + final_json_str
        }
    return analysis_json

def analyze_text_events(input_text: str, doc_date_: str, language : str):
    print("hello")
    """
    Analyzes the input text using a large language model to produce
    structured event, entity, and temporal data in JSON format.

    Steps:
    1) Optionally parse a line "Document Date: <date>" from input_text.
    2) Construct the prompt with your new instructions, appending the
       user's text and the extracted doc_date if found.
    3) Call the ChatGPT o3-mini endpoint.
    4) Parse the chain-of-thought or "thinking" text out (stop at </think>).
    5) Return the final JSON (or an error if parse fails).

    :param input_text: The user-provided text, which may include an optional
                       "Document Date: <something>" line.
    :return: A Python dict containing the LLM's parsed JSON structure.
    """

    # 1) Optionally parse out the document date from a line like:
    #    "Document Date: Jan 16, 2025"
    doc_date = doc_date_

    # 2) Construct the prompt:
    base_instructions = """
You are an expert text analyst. You are given a text passage (one or more sentences). Your task is to perform a structured, in-depth analysis of the text and return the results in JSON format.
Please follow these steps:
Break down the analysis by sentences, and note every temporal reference, event, and named entity, indicating the sentence from which you extracted it.
Identify every event (any action, occurrence, or communication indicated by a verb or verbal noun):
For each event, create a JSON object with:
sentence: Sentence the word appeared in
event_type: Classify the event (e.g., accident, statement, etc.)
verb: The main verb or nominal form representing the event
agent: Who or what performs the action (if identified)
patients: Who or what is affected (if applicable)
temporal_reference: Any explicit time references
cause: Why the event occurred, if known or inferable (label assumptions clearly)
purpose_context: The context or significance of the event, if known or inferable
Collect all event objects into an array called "events".

Identify all named entities and classify each by type. For each named entity, provide:
entity: The name of the entity
type: The category (person, location, organization, etc.)
description: Brief details or inferred role, if available (label assumptions clearly)
Organize them under "named_entities", using separate arrays by category
(e.g., "persons", "organizations", "locations", "dates", etc.).
If none exist for a category, keep that array empty.

List all explicit or implicit time references in a "temporal_references" array. For each time reference, include:
reference: The time expression as stated in the text
description: What it refers to or any contextual info

If assumptions are made, label them as "assumptions" within the relevant field.
Include "important_notes" if additional context is necessary.

Return everything as a single JSON object formatted like this:
{
  "events": [
    {
      "sentence": "",
      "event_type": "",
      "verb": "",
      "agent": "",
      "patients": "",
      "temporal_reference": "",
      "cause": "",
      "purpose_context": ""
    }
  ],
  "named_entities": {
    "persons": [
      {
        "entity": "",
        "type": "",
        "description": ""
      }
    ],
    "organizations": [
      {
        "entity": "",
        "type": "",
        "description": ""
      }
    ],
    "locations": [
      {
        "entity": "",
        "type": "",
        "description": ""
      }
    ],
    "institutions": [
      {
        "entity": "",
        "type": "",
        "description": ""
      }
    ],
    "dates": [],
    "legal_terms": []
  },
  "temporal_references": [
    {
      "reference": "",
      "description": ""
    }
  ],
  "important_notes": [],
  "timeline_of_events": [
    {
      "date": "",
      "events": [
        {
          "event_summary": "",
          "event_verb": "",
          "temporal_reference_connection": ""
        }
      ]
    }
  ],
  "summary": ""
}

Warnings:
- Do not include any output outside the JSON object.
- Do not fabricate data. If something is not explicitly stated, leave it out or mark it as an assumption.
- Every event-denoting verb or nominalization should be reflected in the "events" array.
- If a category (e.g., "institutions") has no entries, return an empty array for that category.

Given the document date which may or may not be provided: <insert date>, build a timeline of all relevant events described in this text. Provide the output of this timeline as follows:
Date of Event: Normalized date, use the document date to determine it, if it can't be determined you can give a relative date. For date ranges, provide a start and end date.
Event: Event's main words
Event Verb: Event's main verb
Temporal Reference Connection: Temporal Reference the event is connected to
For events that the date is not clearly defined try to infer their temporal placement using inference.
Add a one paragraph summary of the document.
Do not add extra commentary or text outside the JSON structure.
    """.strip()
    base_instructions = base_instructions + f"\nIMPORTANT: MAKE SURE THE OUTPUT/ANALYSIS WRITTEN TO THE JSON IS WRITTEN IN THIS LANGUAGE: {language}\n"

    doc_date_str = doc_date
    # Combine instructions, doc date, and user text
    full_prompt = f"""{base_instructions}
Document Date: {doc_date_str}

Here is the text to analyze:
{input_text}
"""
    print("here is the prompt i used\n", full_prompt)

    # 3) Call the ChatGPT o3-mini endpoint using the OpenAI library
    #    (This is just an example; adapt to your own usage)
    client = OpenAI(api_key='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')
    response = client.chat.completions.create(
        model="o3-mini",
        messages=[{"role": "user", "content": full_prompt}]
    )

    # 4) Extract the model's content
    raw_answer = response.choices[0].message.content.strip()
    raw_answer = raw_answer.replace("```json", "").replace("```", "")
    outputFile = open("answer.txt", "w")
    outputFile.write(raw_answer)
    print("wrote to file lol")

    # If the LLM includes chain-of-thought or "thinking" steps, strip out everything
    splitted = raw_answer.split("</think>")
    if len(splitted) > 1:
        final_json_str = splitted[-1].strip()
        outputFile.write("\n\n\n\n")
        outputFile.write(final_json_str)
        outputFile.close()
        print("Wrote to file again :) ")
    else:
        # If there's no </think>, use the entire text
        final_json_str = raw_answer.strip()

    # 5) Parse the JSON
    try:
        analysis_json = json.loads(final_json_str)
    except json.JSONDecodeError:
        analysis_json = {
            "events": [],
            "named_entities": {
                "persons": [],
                "organizations": [],
                "locations": [],
                "institutions": [],
                "dates": [],
                "legal_terms": []
            },
            "temporal_references": [],
            "important_notes": [],
            "timeline_of_events": [],
            "error": "JSON parsing failed. Raw output was:\n" + final_json_str
        }
    print(analysis_json)
    return analysis_json

def analyze_parts_of_speech(input_text: str):
    """
    Analyzes the input text using OpenAI to identify part of speech for each token.
    
    :param input_text: The text to analyze
    :return: A Python dict containing the parts of speech for each token
    """
    instructions = """
    For the following text, produce a json with an array of the part of speech of every token in this fashion:
    
    {
      "parts_of_speech": [
        {
          "token": "word1",
          "tokenId": 0,
          "partOfSpeech": "Pronoun"
        },
        {
          "token": "word2",
          "tokenId": 1,
          "partOfSpeech": "Verb"
        },
        ...
      ]
    }
    
    Use the following part of speech categories: Noun, Proper Noun, Pronoun, Verb, Adjective, Adverb, Preposition, Conjunction, Interjection, Article, Numeral, Determiner, Auxiliary Verb, Particle, Punctuation.
    
    Here is the input text:
    """
    
    instructions = instructions + f"\n{input_text}\n"
    
    client = OpenAI(api_key='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')
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # Using a cheaper model as suggested
        messages=[{"role": "user", "content": instructions}]
    )
    
    raw_answer = response.choices[0].message.content.strip()
    raw_answer = raw_answer.replace("```json", "").replace("```", "")
    final_json_str = raw_answer.strip()
    
    try:
        analysis_json = json.loads(final_json_str)
    except json.JSONDecodeError:
        analysis_json = {
            "parts_of_speech": [],
            "error": "JSON parsing failed. Raw output was:\n" + final_json_str
        }
    
    return analysis_json

def analyze_word_morphology(word: str, language: str):
    """
    Performs morphological analysis on a specific word.
    
    :param word: The word to analyze
    :param language: The language of the word
    :return: A Python dict containing the morphological analysis
    """
    instructions = f"""
    Can you help me? I would like for you to do morphological analysis in the following {language} word:
    
    {word}
    
    Provide the response in a sentence like this:
    "This is a verb, in this tense, in this voice, etc...."
    "This is a noun that means ...." (in some languages, specify if the noun is using the masculine or feminine form)
    """
    
    client = OpenAI(api_key='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')
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # Using a cheaper model as suggested
        messages=[{"role": "user", "content": instructions}]
    )
    
    analysis = response.choices[0].message.content.strip()
    
    return {
        "word": word,
        "analysis": analysis
    }
