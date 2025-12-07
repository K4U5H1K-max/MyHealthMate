# Symptom Mapping Test Examples

## Test Cases

### Test 1: Chest Pain (Cardiac)
**User Input:** "I have chest pain and shortness of breath"

**Mapped Symptoms:**
- `chest_pain`
- `shortness_of_breath`

**Expected Backend Response:** Conditions related to chest pain (cardiac issues, etc.)

---

### Test 2: Fever and Cough (Respiratory)
**User Input:** "I'm experiencing fever, cough, and headache"

**Mapped Symptoms:**
- `fever`
- `cough`
- `headache`

**Expected Backend Response:** Viral infections, flu, COVID-19, etc.

---

### Test 3: Digestive Issues
**User Input:** "I have stomach pain and nausea"

**Mapped Symptoms:**
- `abdominal_pain`
- `nausea`

**Expected Backend Response:** Digestive-related conditions

---

### Test 4: Complex Symptoms
**User Input:** "I have chest pain radiating to my left arm, I'm sweating and feel dizzy"

**Mapped Symptoms:**
- `chest_pain`
- `pain_radiating_left_arm`
- `sweating`
- `dizziness`

**Expected Backend Response:** Cardiac conditions (potential heart attack warning)

---

## Supported Symptom Keywords

### Chest/Heart
- chest pain, chest hurt, chest ache → `chest_pain`
- arm pain, left arm → `pain_radiating_left_arm`
- shortness of breath, can't breathe → `shortness_of_breath`
- sweating, sweat → `sweating`
- palpitations, heart racing → `palpitations`

### Fever/Infection
- fever, high temperature → `fever`
- cough, coughing → `cough`
- sore throat, throat pain → `sore_throat`
- runny nose, stuffy nose → `runny_nose`
- body ache, muscle ache → `body_aches`
- tired, fatigue, exhausted → `fatigue`
- headache, head pain → `headache`

### Digestive
- nausea, nauseous, feel sick → `nausea`
- vomiting, throwing up → `vomiting`
- diarrhea, loose stool → `diarrhea`
- stomach pain, belly pain → `abdominal_pain`

### Other
- dizzy, lightheaded → `dizziness`
- confused, disoriented → `confusion`
- rash, skin rash → `rash`
- joint pain, joints hurt → `joint_pain`

---

## How to Test

1. **Start both servers** (backend and frontend)
2. **Open the chat** at http://localhost:3000
3. **Type a natural query** like:
   - "I have fever and cough"
   - "I'm experiencing chest pain"
   - "I have stomach pain and nausea"

4. **Verify the response** shows:
   - Possible conditions with confidence percentages
   - Recommended tests
   - Appropriate triage level

---

## If No Symptoms Detected

If you see:
> "I couldn't identify specific symptoms from your message..."

**Try being more specific:**
- ✅ "I have chest pain" (works)
- ❌ "I feel bad" (too vague)
- ✅ "I have fever and headache" (works)
- ❌ "Something is wrong" (too vague)

---

## Backend Console

Watch the backend terminal for the actual API request:
```
INFO:     127.0.0.1:58499 - "POST /symptoms HTTP/1.1" 200 OK
```

The backend should receive symptom keys like:
```json
{
  "symptoms": ["chest_pain", "shortness_of_breath"],
  "age": null,
  "sex": null,
  "duration": null
}
```

---

## Quick Test Commands

### Using curl (Windows PowerShell):
```powershell
$body = @{
    symptoms = @("chest_pain", "shortness_of_breath", "sweating")
    age = 55
    sex = "male"
    duration = "2 hours"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/symptoms" -Method POST -Body $body -ContentType "application/json"
```

### Using the UI:
Just type naturally in the chat:
- "I have chest pain and can't breathe well"
- "I'm experiencing fever and body aches"
- "I have headache and feel dizzy"
