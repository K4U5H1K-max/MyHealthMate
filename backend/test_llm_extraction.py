"""
Test script for LLM-based symptom extraction
"""
from app.services.llama3_groq import extract_symptoms_with_llm

# Test cases
test_inputs = [
    "I'm a 55 year old male experiencing chest pain and shortness of breath for 2 hours",
    "I have fever, cough, and headache",
    "I'm 30 years old female with stomach pain and nausea for 3 days",
    "Chest pain radiating to left arm, sweating, dizzy",
    "My 10 year old son has fever and cough",
]

print("Testing LLM Symptom Extraction\n" + "="*50)

for i, user_input in enumerate(test_inputs, 1):
    print(f"\nTest {i}: {user_input}")
    print("-" * 50)
    
    try:
        result = extract_symptoms_with_llm(user_input)
        print(f"Extracted:")
        print(f"  Symptoms: {result['symptoms']}")
        print(f"  Age: {result['age']}")
        print(f"  Sex: {result['sex']}")
        print(f"  Duration: {result['duration']}")
    except Exception as e:
        print(f"  ERROR: {e}")

print("\n" + "="*50)
print("Test complete!")
