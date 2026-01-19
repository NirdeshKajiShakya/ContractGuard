import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("GOOGLE_API_KEY not found.  Please create a .env file and add your key.")
genai.configure(api_key=API_KEY)

# --- Prompt Engineering ---
PROMPT_TEMPLATE = """
You are an AI Contract Analyzer.  Your goal is to help a non-lawyer understand potential risks in a legal document.  Review the provided text and identify any clauses that are risky, unfair, or predatory. 

For each risky clause you find, provide the following in a structured JSON format:
1.   `clause_text`: The exact, word-for-word text of the risky clause. 
2.  `risk_score`: A score from 1 (low risk) to 10 (high risk).
3.  `explanation`: A clear, simple explanation of why the clause is risky. 
4.  `recommendation`: A suggested action or negotiation point. 

Analyze the following contract text: 
---
{contract_text}
---

Return your analysis as a single JSON object containing a list called "analysis".  If no risky clauses are found, return an empty list. 
Example output:
{{
  "analysis": [
    {{
      "clause_text": "The landlord may enter the premises at any time without prior notice.",
      "risk_score": 9,
      "explanation": "This clause violates tenant privacy rights by allowing entry without notice.",
      "recommendation": "Request an amendment requiring at least 24 hours' written notice before entry, except in emergencies."
    }}
  ]
}}
"""

def run(text_content):
    """
    Analyzes the contract text using the Gemini API. 

    Args:
        text_content:  The full text of the contract. 

    Returns:
        A dictionary containing the structured analysis or an error. 
    """
    if not text_content or not text_content.strip():
        return {"error": "Input text is empty or contains only whitespace."}

    model = genai.GenerativeModel('gemini-pro')
    prompt = PROMPT_TEMPLATE.format(contract_text=text_content[: 28000])  # Truncate to be safe

    try:
        response = model.generate_content(prompt)
        cleaned_text = response.text.strip().replace("```json", "").replace("```", "").strip()
        
        return json.loads(cleaned_text)
    except json.JSONDecodeError:
        return {"error": "AI response was not valid JSON.", "raw_response": response.text}
    except Exception as e:
        return {"error":  f"An unexpected error occurred: {e}"}