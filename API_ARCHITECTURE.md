# API Integration Architecture

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (React + TypeScript)                          │
│                   http://localhost:3000                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                     (FastAPI + Python)                           │
│                   http://localhost:8000                          │
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │   /symptoms          │      │   /summarize         │        │
│  │   POST               │      │   POST               │        │
│  └──────────────────────┘      └──────────────────────┘        │
│           │                              │                      │
│           ▼                              ▼                      │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │ scoring_engine.py    │      │ extract_text_from    │        │
│  │ (Symptom Analysis)   │      │ _pdf()               │        │
│  └──────────────────────┘      └──────────────────────┘        │
│                                         │                       │
│                                         ▼                       │
│                                ┌──────────────────────┐         │
│                                │ llama3_groq.py       │         │
│                                │ (AI Summarization)   │         │
│                                └──────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                         │
                                         │ API Call
                                         ▼
                                ┌──────────────────────┐
                                │   Groq API           │
                                │   (Llama-3 Model)    │
                                └──────────────────────┘
```

## 📡 Endpoint Details

### 1. Symptom Analysis Endpoint

**URL:** `POST http://localhost:8000/symptoms`

**Frontend Function:** `analyzeSymptomsAPI(symptomsText: string)`

**Flow:**
```
User Input → Keyword Extraction → API Request → Backend Processing → Response
```

**Example:**
```typescript
// Frontend sends:
{
  symptoms: ["fever", "headache", "cough"],
  age: null,
  sex: null,
  duration: null
}

// Backend responds:
{
  causes: [
    {
      id: "flu",
      name: "Influenza",
      confidence: 0.85,
      tests: ["Rapid Flu Test", "CBC"],
      triage_level: "emergency"
    }
  ],
  warnings: ["Seek medical attention if fever exceeds 103°F"],
  disclaimer: "..."
}
```

### 2. PDF Summarization Endpoint

**URL:** `POST http://localhost:8000/summarize`

**Frontend Function:** `summarizeReportAPI(file?: File, text?: string)`

**Flow:**
```
File Upload → FormData Creation → API Request → PDF Extraction → 
AI Processing → Response
```

**Example:**
```typescript
// Frontend sends (multipart/form-data):
{
  pdf: [Binary PDF File]
}

// Backend responds:
{
  abstract: "The blood test shows normal hemoglobin levels...",
  bullet_points: [
    "Hemoglobin: 14.5 g/dL (normal)",
    "White blood cells: slightly elevated",
    "No signs of infection"
  ],
  follow_up_questions: [
    "Should I repeat the test in 6 months?",
    "Are there any dietary changes recommended?"
  ],
  disclaimer: "..."
}
```

## 🎨 Frontend Components

### Chat.tsx - Key Functions

```typescript
// API Configuration
const API_BASE_URL = "http://localhost:8000";

// State Management
const [messages, setMessages] = useState<Message[]>([...]);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [isTyping, setIsTyping] = useState(false);

// API Functions
analyzeSymptomsAPI(text) → calls /symptoms
summarizeReportAPI(file, text) → calls /summarize
handleSend() → orchestrates API calls
```

### Message Type Structure

```typescript
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedTests?: string[];
  possibleDiseases?: {
    name: string;
    confidence: number;
    triageLevel: string;
  }[];
  isError?: boolean;
}
```

## 🔐 Security & CORS

### Backend CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

### Environment Variables
```env
GROQ_API_KEY=gsk_...  # Required for AI summarization
```

## 🎯 Request/Response Patterns

### Pattern 1: Symptom Analysis
```
Frontend                Backend                 Response
   │                       │                       │
   ├─ POST /symptoms ─────>│                       │
   │  {symptoms: [...]}    │                       │
   │                       ├─ Analyze symptoms     │
   │                       ├─ Check knowledge base │
   │                       ├─ Calculate scores     │
   │                       │                       │
   │<───── 200 OK ─────────┤                       │
   │  {causes, warnings}   │                       │
   │                       │                       │
   ├─ Display results      │                       │
```

### Pattern 2: PDF Upload
```
Frontend                Backend                 Groq API
   │                       │                       │
   ├─ POST /summarize ────>│                       │
   │  FormData(pdf)        │                       │
   │                       ├─ Extract PDF text     │
   │                       │                       │
   │                       ├─ POST /chat ─────────>│
   │                       │  {text: "..."}        │
   │                       │                       │
   │                       │<──── Response ────────┤
   │                       │  {summary: "..."}     │
   │                       ├─ Parse response       │
   │<───── 200 OK ─────────┤                       │
   │  {abstract, bullets}  │                       │
   │                       │                       │
   ├─ Display summary      │                       │
```

## 🛠️ Error Handling

### Frontend Error Handling
```typescript
try {
  const response = await fetch(`${API_BASE_URL}/symptoms`, {...});
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  // Process success
} catch (error) {
  // Show user-friendly error message
  return { content: "Error message...", isError: true };
}
```

### Backend Error Responses
```python
# 400 Bad Request
raise HTTPException(status_code=400, detail="Symptoms list required")

# 500 Internal Server Error
raise RuntimeError("GROQ_API_KEY not set")
```

## 📊 Data Validation

### Frontend Validation
- PDF file type checking
- Empty input prevention
- File size limits (browser default)

### Backend Validation
```python
class SymptomInput(BaseModel):
    symptoms: List[str] = Field(..., description="...")
    age: Optional[int] = Field(None, ge=0, le=120)
    sex: Optional[str] = Field(None)
```

## 🚀 Performance Considerations

1. **Loading States:** `isTyping` flag shows user feedback
2. **Error Retry:** Users can resend failed requests
3. **File Upload:** Async processing prevents UI blocking
4. **Response Streaming:** Could be added for long summaries
5. **Caching:** Could cache common symptom combinations

## 📝 Next Steps for Production

- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Set up error monitoring (Sentry)
- [ ] Configure production CORS
- [ ] Add API key rotation
- [ ] Implement response caching
- [ ] Add file size limits
- [ ] Set up HTTPS
- [ ] Add API versioning (/v1/symptoms)

## 🎉 Integration Complete!

The frontend and backend are fully connected with:
✅ Two-way communication
✅ Error handling
✅ Loading states
✅ File uploads
✅ Rich UI feedback
✅ Type safety (TypeScript + Pydantic)
