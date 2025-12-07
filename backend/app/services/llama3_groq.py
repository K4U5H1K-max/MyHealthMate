import os
import requests
import json
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
LLAMA3_MODEL = "llama3-70b-8192"
LLAMA3_JSON_MODEL = "llama-3.3-70b-versatile"  # Updated: 3.1 was decommissioned

# Safe prompt for medical paper simplification
SUMMARIZE_PROMPT = (
    "You are a medical research summarizer. Given the following text, generate:\n"
    "1. A professional-style abstract (~100 words)\n"
    "2. Three patient-friendly bullet points explaining the key findings\n"
    "3. Two follow-up questions a patient should ask their doctor\n"
    "\nText:\n{input}\n\n"
    "Output format:\n"
    "Abstract: ...\n"
    "Patient-friendly bullet points:\n- ...\n- ...\n- ...\n"
    "Follow-up questions:\n1. ...\n2. ...\n"
    "\nDo not give direct medical advice. Keep language safe and informational."
)

def llama3_summarize(text: str) -> dict:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not set in environment variables.")
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": LLAMA3_MODEL,
        "messages": [
            {"role": "system", "content": "You are a helpful medical research summarizer."},
            {"role": "user", "content": SUMMARIZE_PROMPT.format(input=text)}
        ],
        "temperature": 0.3,
        "max_tokens": 1024
    }
    response = requests.post(GROQ_API_URL, headers=headers, json=data)
    response.raise_for_status()
    result = response.json()
    # Parse the output
    content = result["choices"][0]["message"]["content"]
    # Simple parsing (can be improved)
    abstract = ""    
    bullet_points = []
    follow_up_questions = []
    lines = content.splitlines()
    mode = None
    for line in lines:
        if line.lower().startswith("abstract"):
            mode = "abstract"
            continue
        elif "patient-friendly bullet" in line.lower():
            mode = "bullets"
            continue
        elif "follow-up question" in line.lower():
            mode = "questions"
            continue
        if mode == "abstract" and line.strip():
            abstract += line.strip() + " "
        elif mode == "bullets" and line.strip().startswith("-"):
            bullet_points.append(line.strip().lstrip("- "))
        elif mode == "questions" and line.strip().startswith(("1.", "2.")):
            follow_up_questions.append(line.strip()[2:].strip())
    return {
        "abstract": abstract.strip(),
        "bullet_points": bullet_points,
        "follow_up_questions": follow_up_questions
    }


# Prompt for extracting symptoms from natural language
SYMPTOM_EXTRACTION_PROMPT = """You are a medical symptom extraction assistant. Extract structured information from the patient's description.

Available symptom keys (use ONLY these exact keys):
- chest_pain, pain_radiating_left_arm, shortness_of_breath, sweating, palpitations
- fever, cough, sore_throat, runny_nose, body_aches, fatigue, headache
- nausea, vomiting, diarrhea, abdominal_pain
- dizziness, confusion, rash, joint_pain

Extract and return JSON with:
1. "symptoms": List of matching symptom keys from above (lowercase, underscore-separated)
2. "age": Integer age if mentioned, otherwise null
3. "sex": "male" or "female" if mentioned, otherwise null
4. "duration": Duration string if mentioned (e.g., "2 hours", "3 days"), otherwise null

Rules:
- Only use symptom keys from the list above
- Map natural language to the closest matching symptom key
- If no symptoms match, return empty symptoms list
- Be precise with age extraction
- Return valid JSON only

Patient input: {user_input}

Return JSON only, no explanation."""


def extract_symptoms_with_llm(user_input: str) -> Dict[str, Any]:
    """
    Use Groq LLM to extract symptoms, age, sex, and duration from natural language input.
    Returns a dict with keys: symptoms (list), age (int|None), sex (str|None), duration (str|None)
    """
    print(f"\n{'='*60}")
    print(f"[LLM Extraction] Starting extraction...")
    print(f"{'='*60}")
    
    if not GROQ_API_KEY:
        print(f"[LLM Extraction] ❌ FATAL: GROQ_API_KEY not set in environment variables")
        raise RuntimeError("GROQ_API_KEY not set in environment variables.")
    
    print(f"[LLM Extraction] ✅ API Key found (length: {len(GROQ_API_KEY)} chars)")
    print(f"[LLM Extraction] 📝 User Input: '{user_input}'")
    print(f"[LLM Extraction] 🤖 Model: {LLAMA3_JSON_MODEL}")
    print(f"[LLM Extraction] 🌐 API URL: {GROQ_API_URL}")
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": LLAMA3_JSON_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a medical data extraction assistant. Extract symptoms and patient information from text and return valid JSON only."
            },
            {
                "role": "user",
                "content": SYMPTOM_EXTRACTION_PROMPT.format(user_input=user_input)
            }
        ],
        "temperature": 0.1,  # Low temperature for consistent extraction
        "max_tokens": 500,
        "response_format": {"type": "json_object"}  # Force JSON output
    }
    
    print(f"\n[LLM Extraction] 📤 Sending request to Groq API...")
    print(f"[LLM Extraction] Request payload: {json.dumps(data, indent=2)}")
    
    try:
        print(f"\n[LLM Extraction] 🚀 Calling Groq API...")
        response = requests.post(GROQ_API_URL, headers=headers, json=data, timeout=10)
        
        print(f"\n[LLM Extraction] 📥 Response received")
        print(f"[LLM Extraction] Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print(f"\n[LLM Extraction] ❌ AUTHENTICATION ERROR")
            print(f"[LLM Extraction] Your API key is invalid or missing")
            print(f"[LLM Extraction] Response: {response.text}")
            print(f"[LLM Extraction] ℹ️ Check your .env file has: GROQ_API_KEY=your_actual_key")
            return {
                "symptoms": [],
                "age": None,
                "sex": None,
                "duration": None
            }
        
        if response.status_code == 404:
            print(f"\n[LLM Extraction] ❌ MODEL NOT FOUND ERROR")
            print(f"[LLM Extraction] Model '{LLAMA3_JSON_MODEL}' does not exist")
            print(f"[LLM Extraction] Response: {response.text}")
            print(f"[LLM Extraction] ℹ️ Try these models: llama-3.3-70b-versatile, llama-3.1-8b-instant")
            return {
                "symptoms": [],
                "age": None,
                "sex": None,
                "duration": None
            }
        
        response.raise_for_status()
        result = response.json()
        
        # Parse the JSON response
        content = result["choices"][0]["message"]["content"]
        print(f"\n[LLM Extraction] 📄 Raw LLM Response:")
        print(f"{content}")
        print(f"\n[LLM Extraction] 🔍 Parsing JSON...")
        
        extracted_data = json.loads(content)
        
        # Validate and normalize the response
        extracted = {
            "symptoms": extracted_data.get("symptoms", []),
            "age": extracted_data.get("age"),
            "sex": extracted_data.get("sex"),
            "duration": extracted_data.get("duration")
        }
        
        print(f"\n[LLM Extraction] ✅ EXTRACTION SUCCESSFUL")
        print(f"[LLM Extraction] Symptoms Found: {extracted['symptoms']}")
        print(f"[LLM Extraction] Age: {extracted['age']}")
        print(f"[LLM Extraction] Sex: {extracted['sex']}")
        print(f"[LLM Extraction] Duration: {extracted['duration']}")
        print(f"{'='*60}\n")
        return extracted
    
    except requests.exceptions.Timeout as e:
        print(f"\n[LLM Extraction] ⏱️ TIMEOUT ERROR")
        print(f"[LLM Extraction] Request took longer than 10 seconds")
        print(f"[LLM Extraction] Details: {e}")
        print(f"[LLM Extraction] ℹ️ The API might be slow or overloaded. Try again.")
        print(f"{'='*60}\n")
        return {
            "symptoms": [],
            "age": None,
            "sex": None,
            "duration": None
        }
    except requests.exceptions.ConnectionError as e:
        print(f"\n[LLM Extraction] 🌐 CONNECTION ERROR")
        print(f"[LLM Extraction] Cannot reach Groq API at {GROQ_API_URL}")
        print(f"[LLM Extraction] Details: {e}")
        print(f"[LLM Extraction] ℹ️ Check your internet connection or firewall settings")
        print(f"{'='*60}\n")
        return {
            "symptoms": [],
            "age": None,
            "sex": None,
            "duration": None
        }
    except requests.exceptions.RequestException as e:
        # If LLM fails, return empty structure
        print(f"\n[LLM Extraction] ❌ API REQUEST ERROR")
        print(f"[LLM Extraction] Error Type: {type(e).__name__}")
        print(f"[LLM Extraction] Details: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"[LLM Extraction] Response Status: {e.response.status_code}")
            print(f"[LLM Extraction] Response Body: {e.response.text}")
        print(f"{'='*60}\n")
        return {
            "symptoms": [],
            "age": None,
            "sex": None,
            "duration": None
        }
    except (json.JSONDecodeError, KeyError) as e:
        # If JSON parsing fails, return empty structure
        print(f"\n[LLM Extraction] 🔧 JSON PARSING ERROR")
        print(f"[LLM Extraction] Error Type: {type(e).__name__}")
        print(f"[LLM Extraction] Details: {e}")
        if 'content' in locals():
            print(f"[LLM Extraction] Content that failed to parse: {content}")
        print(f"[LLM Extraction] ℹ️ The LLM returned invalid JSON format")
        print(f"{'='*60}\n")
        return {
            "symptoms": [],
            "age": None,
            "sex": None,
            "duration": None
        }
