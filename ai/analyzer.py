import os
import sys
import requests
import json
from dotenv import load_dotenv
import re
import time

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
API_KEY = os.getenv("OPENROUTER_API_KEY")
if not API_KEY:
    raise ValueError("OPENROUTER_API_KEY not found. Please create a .env file and add your key.")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "meta-llama/llama-3.3-70b-instruct:free"
# MODEL = "tngtech/deepseek-r1t2-chimera:free"

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

def chunk_text(text, chunk_size=15000, overlap=500):
    """
    Split text into overlapping chunks to ensure clauses aren't cut off.
    
    Args:
        text: The text to chunk
        chunk_size: Maximum size of each chunk
        overlap: Number of characters to overlap between chunks
    
    Returns:
        List of text chunks
    """
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # If this isn't the last chunk, try to break at a sentence or paragraph
        if end < len(text):
            # Look for sentence endings in the last 200 chars of the chunk
            last_period = text.rfind('.', end - 200, end)
            last_newline = text.rfind('\n', end - 200, end)
            break_point = max(last_period, last_newline)
            
            if break_point > start:
                end = break_point + 1
        
        chunks.append(text[start:end])
        start = end - overlap  # Overlap to avoid missing clauses at boundaries
    
    return chunks

def analyze_chunk(chunk, chunk_num, total_chunks):
    """
    Analyze a single chunk of contract text.
    """
    sys.stderr.write(f"Analyzing chunk {chunk_num}/{total_chunks} ({len(chunk)} characters)...\n")
    
    # Add delay between chunks to avoid rate limiting
    if chunk_num > 1:
        delay = 10  # Wait 10 seconds between chunks
        sys.stderr.write(f"Waiting {delay} seconds to avoid rate limits...\n")
        time.sleep(delay)
    
    prompt = PROMPT_TEMPLATE.format(contract_text=chunk)

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 4000,
        "temperature": 0.7
    }

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=90)
        response.raise_for_status()
        
        response_data = response.json()
        
        if "choices" not in response_data or len(response_data["choices"]) == 0:
            sys.stderr.write(f"Chunk {chunk_num}: Invalid response structure\n")
            return {"error": "Invalid API response structure", "raw_response": str(response_data)[:500]}
        
        ai_response = response_data["choices"][0]["message"]["content"]
        
        if not ai_response or ai_response.strip() == "":
            if "error" in response_data:
                return {"error": f"API Error: {response_data['error']}"}
            return {"error": "AI returned empty response"}
        
        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*"analysis"[\s\S]*\][\s\S]*\}', ai_response)
        if json_match:
            cleaned_text = json_match.group(0)
        else:
            cleaned_text = ai_response.strip().replace("```json", "").replace("```", "").strip()
        
        parsed_result = json.loads(cleaned_text)
        
        if "analysis" not in parsed_result:
            return {"error": "AI response missing 'analysis' field"}
        
        sys.stderr.write(f"Chunk {chunk_num}: Found {len(parsed_result.get('analysis', []))} risk items\n")
        return parsed_result
        
    except json.JSONDecodeError as e:
        sys.stderr.write(f"Chunk {chunk_num}: JSON decode error: {e}\n")
        return {"error": f"Invalid JSON: {str(e)}"}
    except requests.exceptions.Timeout:
        sys.stderr.write(f"Chunk {chunk_num}: Request timed out\n")
        return {"error": "Request timed out"}
    except requests.exceptions.RequestException as e:
        sys.stderr.write(f"Chunk {chunk_num}: Request failed: {e}\n")
        return {"error": f"API request failed: {str(e)}"}
    except Exception as e:
        sys.stderr.write(f"Chunk {chunk_num}: Unexpected error: {e}\n")
        return {"error": f"Unexpected error: {str(e)}"}

def run(text_content):
    """
    Analyzes the contract text using the OpenRouter API with Llama.
    Automatically chunks large contracts and combines results.

    Args:
        text_content:  The full text of the contract. 

    Returns:
        A dictionary containing the structured analysis or an error. 
    """
    if not text_content or not text_content.strip():
        return {"error": "Input text is empty or contains only whitespace."}
    
    sys.stderr.write(f"Processing contract with {len(text_content)} characters\n")
    
    # Split into chunks if text is large
    chunks = chunk_text(text_content, chunk_size=15000, overlap=500)
    total_chunks = len(chunks)
    
    sys.stderr.write(f"Split into {total_chunks} chunk(s)\n")
    
    # Analyze each chunk
    all_analyses = []
    errors = []
    
    for i, chunk in enumerate(chunks, 1):
        result = analyze_chunk(chunk, i, total_chunks)
        
        if "error" in result:
            errors.append(f"Chunk {i}: {result['error']}")
            # Continue processing other chunks even if one fails
            continue
        
        if "analysis" in result and isinstance(result["analysis"], list):
            all_analyses.extend(result["analysis"])
    
    # If all chunks failed, return error
    if errors and not all_analyses:
        return {"error": f"Analysis failed: {'; '.join(errors)}"}
    
    # Remove duplicate risk items (might occur at chunk boundaries)
    unique_analyses = []
    seen_clauses = set()
    
    for item in all_analyses:
        # Use first 100 chars of clause text as identifier
        clause_id = item.get("clause_text", "")[:100].strip()
        if clause_id and clause_id not in seen_clauses:
            seen_clauses.add(clause_id)
            unique_analyses.append(item)
    
    sys.stderr.write(f"Total unique risk items found: {len(unique_analyses)}\n")
    
    # Include warnings if some chunks failed
    result = {"analysis": unique_analyses}
    if errors:
        result["warnings"] = errors
    
    return result

# Main execution block - reads from stdin and outputs to stdout
if __name__ == "__main__":
    try:
        # Read JSON input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)
        
        # Parse the JSON input
        parsed_input = json.loads(input_data)
        contract_text = parsed_input.get("text", "")
        
        if not contract_text:
            print(json.dumps({"error": "No text field in input"}))
            sys.exit(1)
        
        # Run the analysis
        result = run(contract_text)
        
        # Output the result as JSON to stdout
        print(json.dumps(result))
        
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Failed to parse input JSON: {e}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Unexpected error: {e}"}))
        sys.exit(1)