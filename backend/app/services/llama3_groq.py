import os
import requests
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
LLAMA3_MODEL = "llama-3-70b-8192"

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
