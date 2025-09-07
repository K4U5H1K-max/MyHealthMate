"""
FastAPI router for /summarize endpoint (PDF or text)
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
import tempfile
import os

from ..services.llama3_groq import llama3_summarize

# Call Groq Llama-3 for summarization
def gpt_summarize(text: str) -> dict:
    return llama3_summarize(text)

# PDF text extraction helper
async def extract_text_from_pdf(pdf_file: UploadFile) -> str:
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise HTTPException(status_code=500, detail="PyMuPDF is required for PDF extraction.")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        content = await pdf_file.read()
        tmp.write(content)
        tmp_path = tmp.name
    doc = fitz.open(tmp_path)
    text = "\n".join(page.get_text() for page in doc)
    doc.close()
    os.remove(tmp_path)
    return text

router = APIRouter()

class SummarizeResponse(BaseModel):
    abstract: str
    bullet_points: list
    follow_up_questions: list
    disclaimer: str = "This tool is for educational purposes only and is not a substitute for professional medical advice."

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(
    text: Optional[str] = Form(None),
    pdf: Optional[UploadFile] = File(None)
):
    # Treat empty string as no file (Swagger UI quirk)
    if pdf is not None and getattr(pdf, "filename", None) == "":
        pdf = None
    if not text and not pdf:
        raise HTTPException(status_code=400, detail="Provide either text or a PDF file.")
    if pdf:
        extracted_text = await extract_text_from_pdf(pdf)
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from PDF.")
        text = extracted_text
    # Call GPT for summary
    result = await gpt_summarize(text)
    return SummarizeResponse(**result)
