"""
FastAPI router for /symptoms endpoint
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from ..services.scoring_engine import analyze_symptoms
from ..services.llama3_groq import extract_symptoms_with_llm

router = APIRouter()

class SymptomInput(BaseModel):
    symptoms: List[str] = Field(..., description="List of symptoms (lowercase, underscore-separated)")
    age: Optional[int] = Field(None, ge=0, le=120, description="Age of the user")
    sex: Optional[str] = Field(None, description="Sex of the user (optional)")
    duration: Optional[str] = Field(None, description="Duration of symptoms (optional)")

class NaturalLanguageInput(BaseModel):
    """Accept natural language input for LLM-based extraction"""
    text: str = Field(..., description="Natural language description of symptoms")

class CauseResult(BaseModel):
    id: str
    name: str
    confidence: float
    tests: List[str]
    triage_level: str

class SymptomAnalysisResponse(BaseModel):
    causes: List[CauseResult]
    warnings: List[str]
    disclaimer: str = "This tool is for educational purposes only and is not a substitute for professional medical advice."
    extracted_info: Optional[dict] = Field(None, description="Extracted patient information (when using natural language)")

@router.post("/symptoms", response_model=SymptomAnalysisResponse)
def analyze_symptoms_api(input: SymptomInput):
    """
    Analyze symptoms using structured input.
    Accepts pre-formatted symptom keys.
    """
    # Validate input
    if not input.symptoms or not isinstance(input.symptoms, list):
        raise HTTPException(status_code=400, detail="Symptoms list is required.")
    # Lowercase and clean symptoms
    user_symptoms = [s.strip().lower() for s in input.symptoms]
    result = analyze_symptoms(user_symptoms)
    # Format causes for response
    causes = [
        CauseResult(
            id=c['id'],
            name=c['name'],
            confidence=round(c['confidence'], 3),
            tests=c['tests'],
            triage_level=c['triage_level']
        ) for c in result.get('causes', [])
    ]
    return SymptomAnalysisResponse(
        causes=causes,
        warnings=result.get('warnings', [])
    )


@router.post("/symptoms/analyze", response_model=SymptomAnalysisResponse)
def analyze_symptoms_natural_language(input: NaturalLanguageInput):
    """
    Analyze symptoms using natural language input.
    Uses Groq LLM to extract symptoms, age, sex, and duration from text.
    
    Example input: 
    {
        "text": "I'm a 55 year old male experiencing chest pain and shortness of breath for 2 hours"
    }
    """
    print(f"[/symptoms/analyze] Received text: {input.text}")
    
    # Extract structured data from natural language using LLM
    extracted = extract_symptoms_with_llm(input.text)
    
    print(f"[/symptoms/analyze] Extracted data: {extracted}")
    
    # Validate that we got some symptoms
    if not extracted.get("symptoms") or len(extracted["symptoms"]) == 0:
        raise HTTPException(
            status_code=400, 
            detail="Could not identify any symptoms from the input. Please describe your symptoms more clearly."
        )
    
    # Use the extracted symptoms for analysis
    user_symptoms = extracted["symptoms"]
    result = analyze_symptoms(user_symptoms)
    
    # Format causes for response
    causes = [
        CauseResult(
            id=c['id'],
            name=c['name'],
            confidence=round(c['confidence'], 3),
            tests=c['tests'],
            triage_level=c['triage_level']
        ) for c in result.get('causes', [])
    ]
    
    return SymptomAnalysisResponse(
        causes=causes,
        warnings=result.get('warnings', []),
        extracted_info={
            "symptoms": extracted["symptoms"],
            "age": extracted["age"],
            "sex": extracted["sex"],
            "duration": extracted["duration"]
        }
    )
