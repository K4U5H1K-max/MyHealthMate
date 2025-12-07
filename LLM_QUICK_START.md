# 🚀 Quick Start: LLM-Based Symptom Extraction

## What Changed?

Your symptom analysis now uses **AI-powered natural language understanding** instead of simple keyword matching!

## ✅ What You Can Do Now

### Before (Old Way)
You had to format symptoms carefully:
```
"chest_pain", "fever", "cough"
```

### After (New Way - LLM)
Just type naturally:
```
"I have chest pain, fever, and cough"
"I'm a 55 year old male with chest pain for 2 hours"
"Experiencing headache and nausea since yesterday"
```

## 🎯 New Features

1. **Natural Language Input** - Type like you're talking to a doctor
2. **Automatic Age Extraction** - "I'm 55 years old" → age: 55
3. **Sex Recognition** - "I'm a male" → sex: "male"
4. **Duration Capture** - "for 2 hours" → duration: "2 hours"
5. **Smart Symptom Mapping** - "chest pain" → chest_pain

## 📝 How to Test

### Option 1: Via Frontend (Easiest)
1. **Restart backend** (if running): `Ctrl+C` then `uvicorn app.main:app --reload`
2. **Open browser:** http://localhost:3000
3. **Type naturally:** "I'm a 55 year old male with chest pain and shortness of breath"
4. **See magic happen!** ✨

### Option 2: Via curl
```bash
curl -X POST http://localhost:8000/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "I have chest pain and shortness of breath"}'
```

### Option 3: Via Python Test Script
```bash
cd backend
python test_llm_extraction.py
```

## 🔄 API Changes

### New Endpoint Added
**`POST /symptoms/analyze`** - Natural language input (AI-powered)

### Old Endpoint Still Works
**`POST /symptoms`** - Structured input (for programmatic use)

## 📊 Example Comparison

### Input
```
"I'm a 55 year old male experiencing chest pain and shortness of breath for 2 hours"
```

### What LLM Extracts
```json
{
  "symptoms": ["chest_pain", "shortness_of_breath"],
  "age": 55,
  "sex": "male",
  "duration": "2 hours"
}
```

### What You Get Back
```json
{
  "causes": [
    {
      "name": "Myocardial Infarction",
      "confidence": 0.85,
      "tests": ["ECG", "Troponin"],
      "triage_level": "emergency"
    }
  ],
  "extracted_info": {
    "symptoms": ["chest_pain", "shortness_of_breath"],
    "age": 55,
    "sex": "male",
    "duration": "2 hours"
  }
}
```

## 🎨 What Users Will See

The frontend now displays extracted information:

```
Based on your description, here's my analysis:

**Extracted Information:**
• Symptoms: chest_pain, shortness_of_breath
• Age: 55
• Sex: male
• Duration: 2 hours

⚠️ **Important Warnings:**
• Seek immediate emergency care - potential heart attack

**Possible Conditions:**
1. Myocardial Infarction (85.0% confidence)
   Triage Level: emergency
```

## ⚙️ Technical Details

### Files Modified
- ✅ `backend/app/services/llama3_groq.py` - Added LLM extraction
- ✅ `backend/app/routers/symptoms.py` - Added new endpoint
- ✅ `frontend/src/components/Chat.tsx` - Updated to use new endpoint

### New Dependencies
- None! Uses existing Groq API setup

### Environment Variables Required
```env
GROQ_API_KEY=your_api_key_here
```

## 🧪 Test Cases to Try

1. **Cardiac emergency:**
   - "Chest pain radiating to left arm, sweating"

2. **Respiratory infection:**
   - "30 year old female with fever, cough, and headache for 3 days"

3. **Digestive issue:**
   - "I have stomach pain and nausea"

4. **With age and sex:**
   - "I'm a 45 year old male experiencing dizziness"

5. **With duration:**
   - "Headache for the past 6 hours"

## 🎯 Expected Behavior

### Good Input
✅ "I have chest pain and shortness of breath"
→ Extracts symptoms correctly

### Vague Input
❌ "I don't feel good"
→ Returns error: "Could not identify any symptoms"

## 🔍 Debugging

### Check Backend Logs
Watch for:
```
INFO:     127.0.0.1:xxxxx - "POST /symptoms/analyze HTTP/1.1" 200 OK
```

### Check LLM Response
Backend will print errors if LLM fails:
```python
print(f"Error calling Groq API: {e}")
```

### Check Frontend Console
Press F12 in browser, look for:
```javascript
console.log("Extracted info:", data.extracted_info)
```

## 📚 Documentation Files

1. **LLM_EXTRACTION_GUIDE.md** - Full technical documentation
2. **SYMPTOM_MAPPING_GUIDE.md** - Old keyword mapping (deprecated)
3. **INTEGRATION_GUIDE.md** - General API integration

## 🎉 Benefits

| Feature | Old Way | New Way (LLM) |
|---------|---------|---------------|
| Input format | Strict keywords | Natural language |
| Age extraction | Manual | Automatic |
| Sex extraction | Manual | Automatic |
| Duration extraction | Not supported | Automatic |
| Understands variations | No | Yes |
| User-friendly | ❌ | ✅ |

## ⚡ Quick Checklist

- [ ] Backend restarted
- [ ] Frontend running
- [ ] GROQ_API_KEY in .env
- [ ] Test: "I have chest pain"
- [ ] See extracted information
- [ ] See possible conditions
- [ ] Celebrate! 🎊

## 🆘 Troubleshooting

### "Could not identify any symptoms"
→ Input too vague, be more specific

### "GROQ_API_KEY not set"
→ Add API key to backend/.env file

### Slow response
→ LLM takes 1-2 seconds, this is normal

### No extracted_info in response
→ Check you're using `/symptoms/analyze` not `/symptoms`

## 🚀 You're Ready!

The LLM-based extraction is now live and ready to use. Just type naturally and let the AI do the work! 🎉
