"""
FastAPI router for /symptoms endpoint
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from ..services.scoring_engine import analyze_symptoms

router = APIRouter()

class SymptomInput(BaseModel):
    symptoms: List[str] = Field(..., description="List of symptoms (lowercase, underscore-separated)")
    age: Optional[int] = Field(None, ge=0, le=120, description="Age of the user")
    sex: Optional[str] = Field(None, description="Sex of the user (optional)")
    duration: Optional[str] = Field(None, description="Duration of symptoms (optional)")

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

@router.post("/symptoms", response_model=SymptomAnalysisResponse)
def analyze_symptoms_api(input: SymptomInput):
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
