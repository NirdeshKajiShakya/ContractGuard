import os
import requests
import json
from dotenv import load_dotenv
import re

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
API_KEY = os.getenv("OPENROUTER_API_KEY")
if not API_KEY:
    raise ValueError("OPENROUTER_API_KEY not found. Please create a .env file and add your key.")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "meta-llama/llama-3.3-70b-instruct:free"

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
    Analyzes the contract text using the OpenRouter API with Llama. 

    Args:
        text_content:  The full text of the contract. 

    Returns:
        A dictionary containing the structured analysis or an error. 
    """
    if not text_content or not text_content.strip():
        return {"error": "Input text is empty or contains only whitespace."}

    prompt = PROMPT_TEMPLATE.format(contract_text=text_content[:28000])  # Truncate to be safe

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 4000
    }

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        response_data = response.json()
        ai_response = response_data["choices"][0]["message"]["content"]
        
        # Better JSON extraction - handle code blocks and find JSON object
        json_match = re.search(r'\{[\s\S]*"analysis"[\s\S]*\][\s\S]*\}', ai_response)
        if json_match:
            cleaned_text = json_match.group(0)
        else:
            cleaned_text = ai_response.strip().replace("```json", "").replace("```", "").strip()
        
        return json.loads(cleaned_text)
    except json.JSONDecodeError:
        return {"error": "AI response was not valid JSON.", "raw_response": ai_response if 'ai_response' in locals() else "No response"}
    except requests.exceptions.RequestException as e:
        return {"error": f"API request failed: {e}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}