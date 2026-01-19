import os
import sys
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

def chunk_text(text, chunk_size=15000, overlap=500):
    """
    Split text into overlapping chunks to ensure content isn't cut off.
    
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
        start = end - overlap  # Overlap to avoid missing content at boundaries
    
    return chunks

def humanize_chunk(chunk, chunk_num, total_chunks):
    """
    Humanize a single chunk of contract text.
    
    Args:
        chunk: The text chunk to humanize
        chunk_num: Current chunk number (1-indexed)
        total_chunks: Total number of chunks
    
    Returns:
        Dictionary with humanized results or error
    """
    sys.stderr.write(f"Humanizing chunk {chunk_num}/{total_chunks} ({len(chunk)} characters)...\n")
    
    prompt = HUMANIZER_PROMPT_TEMPLATE.format(contract_text=chunk)

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
            return {"error": "Invalid API response structure"}
        
        ai_response = response_data["choices"][0]["message"]["content"]
        
        if not ai_response or ai_response.strip() == "":
            if "error" in response_data:
                return {"error": f"API Error: {response_data['error']}"}
            return {"error": "AI returned empty response"}
        
        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*"humanized_text"[\s\S]*\}', ai_response)
        if json_match:
            cleaned_text = json_match.group(0)
        else:
            cleaned_text = ai_response.strip().replace("```json", "").replace("```", "").strip()
        
        parsed_result = json.loads(cleaned_text)
        
        if "humanized_text" not in parsed_result:
            return {"error": "AI response missing 'humanized_text' field"}
        
        sys.stderr.write(f"Chunk {chunk_num}: Successfully humanized\n")
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

def simplify(text_content: str) -> dict:
    """
    Converts complex legal text into simple, everyday language.
    Automatically chunks large contracts and combines results.

    Args:
        text_content: The legal text to simplify.

    Returns:
        A dictionary containing the humanized text and key points, or an error.
    """
    if not text_content or not text_content.strip():
        return {"error": "Input text is empty or contains only whitespace."}
    
    sys.stderr.write(f"Humanizing contract with {len(text_content)} characters\n")
    
    # Split into chunks if text is large
    chunks = chunk_text(text_content, chunk_size=15000, overlap=500)
    total_chunks = len(chunks)
    
    sys.stderr.write(f"Split into {total_chunks} chunk(s)\n")
    
    # Humanize each chunk
    humanized_parts = []
    all_key_points = []
    total_original_words = 0
    total_simplified_words = 0
    errors = []
    
    for i, chunk in enumerate(chunks, 1):
        result = humanize_chunk(chunk, i, total_chunks)
        
        if "error" in result:
            errors.append(f"Chunk {i}: {result['error']}")
            continue
        
        if "humanized_text" in result:
            humanized_parts.append(result["humanized_text"])
            
            # Aggregate metadata
            if "original_length" in result:
                total_original_words += result["original_length"]
            if "simplified_length" in result:
                total_simplified_words += result["simplified_length"]
            if "key_points" in result and isinstance(result["key_points"], list):
                all_key_points.extend(result["key_points"])
    
    # If all chunks failed, return error
    if errors and not humanized_parts:
        return {"error": f"Humanization failed: {'; '.join(errors)}"}
    
    # Combine all humanized parts
    combined_text = "\n\n".join(humanized_parts)
    
    # Deduplicate key points (keep unique ones)
    unique_key_points = []
    seen_points = set()
    for point in all_key_points:
        point_normalized = point.lower().strip()
        if point_normalized and point_normalized not in seen_points:
            seen_points.add(point_normalized)
            unique_key_points.append(point)
    
    # Limit to most important 5 key points
    unique_key_points = unique_key_points[:5]
    
    sys.stderr.write(f"Successfully humanized {len(humanized_parts)} chunk(s)\n")
    
    result = {
        "original_length": total_original_words if total_original_words > 0 else len(text_content.split()),
        "simplified_length": total_simplified_words if total_simplified_words > 0 else len(combined_text.split()),
        "humanized_text": combined_text,
        "key_points": unique_key_points
    }
    
    # Include warnings if some chunks failed
    if errors:
        result["warnings"] = errors
    
    return result

def humanize_clause(clause_text: str) -> dict:
    """
    Simplified wrapper for humanizing a single clause. 
    
    Args:
        clause_text: A single contract clause to simplify.
        
    Returns:
        A dictionary with the simplified version. 
    """
    return simplify(clause_text)