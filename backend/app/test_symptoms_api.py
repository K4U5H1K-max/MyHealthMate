import requests

# Sample payload for symptom analysis
payload = {
    "symptoms": ["chest_pain", "pain_radiating_left_arm", "sweating"],
    "age": 55,
    "sex": "male",
    "duration": "2 hours"
}

response = requests.post("http://127.0.0.1:8000/symptoms", json=payload)
print("Status Code:", response.status_code)
print("Response:", response.json())
