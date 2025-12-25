"""
FastAPI router for /summarize endpoint (PDF or text)
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import tempfile
import os

from ..services.llama3_groq import llama3_summarize, chat_with_context
from ..services.conversation_memory import conversation_memory

# Call Groq Llama-3 for summarization
def gpt_summarize(text: str, conversation_history: Optional[List[dict]] = None) -> dict:
    return llama3_summarize(text, conversation_history=conversation_history)

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
    session_id: Optional[str] = None

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(
    text: Optional[str] = Form(None),
    pdf: Optional[UploadFile] = File(None),
    session_id: Optional[str] = Form(None)
):
    # Treat empty string, None, or non-file as no file (Swagger UI quirk)
    if not pdf or getattr(pdf, "filename", None) in (None, ""):
        pdf = None
    if not text and not pdf:
        raise HTTPException(status_code=400, detail="Provide either text or a PDF file.")
    if pdf:
        extracted_text = await extract_text_from_pdf(pdf)
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from PDF.")
        text = extracted_text
    
    # Validate text input
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")
    
    # Create or get session ID
    if not session_id:
        session_id = conversation_memory.create_session()
    
    # Store user message
    conversation_memory.add_message(session_id, "user", f"Please summarize this report: {text[:100]}...")
    
    # Get conversation context
    context = conversation_memory.get_context_messages(session_id, max_pairs=3)
    
    # Call GPT for summary
    try:
        result = gpt_summarize(text, conversation_history=context)
        
        # Store assistant response
        summary_text = f"Summary: {result['abstract'][:100]}..."
        conversation_memory.add_message(session_id, "assistant", summary_text)
        
        response = SummarizeResponse(**result, session_id=session_id)
        return response
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    General conversational endpoint with memory.
    Handles follow-up questions and contextual conversations.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    # Create or get session ID
    session_id = request.session_id
    if not session_id:
        session_id = conversation_memory.create_session()
    
    # Store user message
    conversation_memory.add_message(session_id, "user", request.message)
    
    # Get conversation context
    context = conversation_memory.get_context_messages(session_id, max_pairs=5)
    
    try:
        # Generate response with context
        response_text = chat_with_context(request.message, conversation_history=context[:-1])  # Exclude current message
        
        # Store assistant response
        conversation_memory.add_message(session_id, "assistant", response_text)
        
        return ChatResponse(response=response_text, session_id=session_id)
    except Exception as e:
        error_msg = f"Failed to generate response: {str(e)}"
        raise HTTPException(status_code=500, detail=error_msg)
