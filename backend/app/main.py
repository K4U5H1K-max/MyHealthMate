"""
Main FastAPI app entrypoint for MyHealthMate
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import symptoms, summarize

app = FastAPI(
	title="MyHealthMate API",
	description="API for symptom analysis and medical paper simplification.",
	version="1.0.0"
)

# Allow CORS for frontend (localhost:3000) and all origins for dev
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*", "http://localhost:3000"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"]
)

app.include_router(symptoms.router)
app.include_router(summarize.router)
