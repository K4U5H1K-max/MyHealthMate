# LLM-Based Symptom Extraction

## Overview

The symptom analysis now uses **Groq LLM (Llama 3.1)** to intelligently extract structured medical information from natural language input.

## New Endpoint

### `POST /symptoms/analyze`

**Purpose:** Analyze symptoms using natural language input with AI-powered extraction.

**Request Body:**
```json
{
  "text": "I'm a 55 year old male experiencing chest pain and shortness of breath for 2 hours"
}
```

**Response:**
```json
{
  "causes": [
    {
      "id": "I20.0",
      "name": "Myocardial Infarction",
      "confidence": 0.85,
      "tests": ["ECG", "Troponin", "Chest X-ray"],
      "triage_level": "emergency"
    }
  ],
  "warnings": ["Seek immediate emergency care - potential heart attack"],
  "disclaimer": "This tool is for educational purposes only...",
  "extracted_info": {
    "symptoms": ["chest_pain", "shortness_of_breath"],
    "age": 55,
    "sex": "male",
    "duration": "2 hours"
  }
}
```

## How It Works

### 1. User Input (Natural Language)
```
"I'm a 55 year old male experiencing chest pain and shortness of breath for 2 hours"
```

### 2. LLM Extraction
The Groq LLM extracts:
- **Symptoms:** Maps phrases to medical symptom keys
- **Age:** Extracts numeric age
- **Sex:** Identifies male/female
- **Duration:** Captures time information

### 3. Structured Output
```json
{
  "symptoms": ["chest_pain", "shortness_of_breath"],
  "age": 55,
  "sex": "male",
  "duration": "2 hours"
}
```

### 4. Medical Analysis
The extracted symptoms are analyzed using the Bayesian scoring engine to determine possible conditions.

## Available Symptom Keys

The LLM is trained to map natural language to these specific keys:

### Cardiac/Respiratory
- `chest_pain`
- `pain_radiating_left_arm`
- `shortness_of_breath`
- `sweating`
- `palpitations`

### Fever/Infection
- `fever`
- `cough`
- `sore_throat`
- `runny_nose`
- `body_aches`
- `fatigue`
- `headache`

### Digestive
- `nausea`
- `vomiting`
- `diarrhea`
- `abdominal_pain`

### Neurological/Other
- `dizziness`
- `confusion`
- `rash`
- `joint_pain`

## Example Queries

### Example 1: Cardiac Emergency
**Input:**
```
"Chest pain radiating to my left arm, I'm sweating and feel dizzy"
```

**Extracted:**
```json
{
  "symptoms": ["chest_pain", "pain_radiating_left_arm", "sweating", "dizziness"],
  "age": null,
  "sex": null,
  "duration": null
}
```

### Example 2: Respiratory Infection
**Input:**
```
"I'm a 30 year old female with fever, cough, and sore throat for 3 days"
```

**Extracted:**
```json
{
  "symptoms": ["fever", "cough", "sore_throat"],
  "age": 30,
  "sex": "female",
  "duration": "3 days"
}
```

### Example 3: Digestive Issues
**Input:**
```
"45 year old male, stomach pain and nausea since yesterday"
```

**Extracted:**
```json
{
  "symptoms": ["abdominal_pain", "nausea"],
  "age": 45,
  "sex": "male",
  "duration": "since yesterday"
}
```

## Frontend Integration

The frontend Chat component now automatically uses the `/symptoms/analyze` endpoint:

```typescript
const analyzeSymptomsAPI = async (symptomsText: string) => {
  const response = await fetch(`${API_BASE_URL}/symptoms/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: symptomsText }),
  });
  // ... handle response
};
```

## Benefits Over Keyword Matching

### Before (Keyword Matching)
- ❌ Limited patterns
- ❌ Rigid matching
- ❌ Couldn't extract age/sex/duration
- ❌ Missed variations in phrasing

### After (LLM Extraction)
- ✅ Understands natural language
- ✅ Extracts multiple fields
- ✅ Handles variations ("I'm sweating" = "sweat" = "perspiring")
- ✅ Context-aware
- ✅ Extracts age, sex, duration automatically

## Testing

### Test via API
```bash
curl -X POST http://localhost:8000/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "I have chest pain and shortness of breath"}'
```

### Test via Python
```python
from app.services.llama3_groq import extract_symptoms_with_llm

result = extract_symptoms_with_llm(
    "I'm a 55 year old male with chest pain for 2 hours"
)
print(result)
```

### Test via UI
1. Open http://localhost:3000
2. Type naturally: "I have chest pain and feel dizzy"
3. See extracted information in the response

## Configuration

### Environment Variables
```env
GROQ_API_KEY=your_groq_api_key_here
```

### Model Settings
```python
LLAMA3_JSON_MODEL = "llama-3.1-70b-versatile"
temperature = 0.1  # Low for consistent extraction
response_format = {"type": "json_object"}  # Force JSON output
```

## Error Handling

### No Symptoms Detected
```json
{
  "detail": "Could not identify any symptoms from the input. Please describe your symptoms more clearly."
}
```

### LLM Timeout/Error
Falls back to empty structure:
```json
{
  "symptoms": [],
  "age": null,
  "sex": null,
  "duration": null
}
```

## API Comparison

### Old Endpoint: `/symptoms` (Still Available)
**Use when:** You have pre-formatted symptom keys
```json
{
  "symptoms": ["chest_pain", "fever"],
  "age": 55,
  "sex": "male",
  "duration": "2 hours"
}
```

### New Endpoint: `/symptoms/analyze` (Recommended)
**Use when:** You have natural language input
```json
{
  "text": "I'm a 55 year old male with chest pain and fever for 2 hours"
}
```

## Performance

- **Latency:** ~1-2 seconds for LLM extraction
- **Accuracy:** High for common symptom descriptions
- **Rate Limit:** Subject to Groq API limits
- **Timeout:** 10 seconds

## Future Enhancements

- [ ] Multi-language support
- [ ] Symptom severity extraction
- [ ] Medical history extraction
- [ ] Medication extraction
- [ ] Cached common queries
- [ ] Fallback to keyword matching if LLM fails

## Troubleshooting

### LLM Returns Empty Symptoms
- User input too vague
- No medical symptoms mentioned
- Try rephrasing with specific symptoms

### Slow Response
- Groq API latency
- Check internet connection
- Verify API key is valid

### Incorrect Extraction
- LLM misunderstood input
- Try being more specific
- Use medical terminology when possible

## Best Practices

### Good Input Examples
✅ "I have chest pain and shortness of breath"
✅ "55 year old male with fever and cough for 3 days"
✅ "Experiencing headache and dizziness since yesterday"

### Poor Input Examples
❌ "I don't feel good"
❌ "Something is wrong"
❌ "Help me"

## Summary

The LLM-based extraction provides:
1. **Natural language understanding**
2. **Automatic field extraction** (age, sex, duration)
3. **Improved user experience** (no need to format input)
4. **Better accuracy** (understands context and variations)

This makes the symptom analysis more accessible and user-friendly! 🎉
