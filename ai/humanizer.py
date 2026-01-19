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
MODEL = "meta-llama/llama-3.3-70b-instruct: free"

# --- Prompt Engineering ---
HUMANIZER_PROMPT_TEMPLATE = """
You are a Legal Translator. Your job is to convert complex legal language into simple, everyday English that anyone can understand.

Take the contract text provided below and rewrite it in plain language.  Follow these rules:
1. Replace legal jargon with simple words
2. Break down long sentences into shorter, clearer ones
3. Explain what each clause actually means in practice
4. Keep the same meaning but make it conversational
5. Use "you" and "we" instead of "the party" and "the other party"

Contract text to humanize:
---
{contract_text}
---

Return your response as a JSON object with this structure:
{{
  "original_length": <number of words in original>,
  "simplified_length": <number of words in simplified version>,
  "humanized_text": "<the full simplified text here>",
  "key_points": [
    "<bullet point 1: most important thing to know>",
    "<bullet point 2: second most important thing>",
    "<bullet point 3: third most important thing>"
  ]
}}
"""

def simplify(text_content: str) -> dict:
    """
    Converts complex legal text into simple, everyday language. 

    Args:
        text_content: The legal text to simplify.

    Returns:
        A dictionary containing the humanized text and key points, or an error.
    """
    if not text_content or not text_content.strip():
        return {"error": "Input text is empty or contains only whitespace."}

    prompt = HUMANIZER_PROMPT_TEMPLATE.format(contract_text=text_content[:28000])

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role":  "user", "content": prompt}
        ],
        "max_tokens": 4000
    }

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        response_data = response.json()
        ai_response = response_data["choices"][0]["message"]["content"]
        
        # Extract JSON from response - handle code blocks and find JSON object
        json_match = re.search(r'\{[\s\S]*"humanized_text"[\s\S]*\}', ai_response)
        if json_match:
            cleaned_text = json_match.group(0)
        else:
            cleaned_text = ai_response.strip().replace("```json", "").replace("```", "").strip()
        
        return json.loads(cleaned_text)
    except json.JSONDecodeError:
        return {
            "error": "AI response was not valid JSON.", 
            "raw_response":  ai_response if 'ai_response' in locals() else "No response"
        }
    except requests.exceptions.RequestException as e:
        return {"error": f"API request failed: {e}"}
    except Exception as e: 
        return {"error": f"An unexpected error occurred: {e}"}

def humanize_clause(clause_text: str) -> dict:
    """
    Simplified wrapper for humanizing a single clause. 
    
    Args:
        clause_text: A single contract clause to simplify.
        
    Returns:
        A dictionary with the simplified version. 
    """
    return simplify(clause_text)