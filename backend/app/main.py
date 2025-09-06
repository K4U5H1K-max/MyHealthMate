"""
Main FastAPI app entrypoint for MyHealthMate
"""
from fastapi import FastAPI
from .routers import symptoms

app = FastAPI(
	title="MyHealthMate API",
	description="API for symptom analysis and medical paper simplification.",
	version="1.0.0"
)

app.include_router(symptoms.router)
