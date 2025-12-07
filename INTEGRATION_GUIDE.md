# MyHealthMate - Frontend-Backend Integration Guide

## Overview
The frontend and backend are now fully connected! The chat interface can:
- **Analyze symptoms** using the `/symptoms` endpoint
- **Summarize PDF test reports** using the `/summarize` endpoint

## Backend Endpoints

### 1. Symptom Analysis - `POST /symptoms`
**Purpose:** Analyzes user symptoms and returns possible conditions with confidence scores.

**Request Body:**
```json
{
  "symptoms": ["fever", "headache", "cough"],
  "age": 30,
  "sex": "M",
  "duration": "3 days"
}
```

**Response:**
```json
{
  "causes": [
    {
      "id": "common_cold",
      "name": "Common Cold",
      "confidence": 0.85,
      "tests": ["CBC", "CRP Test"],
      "triage_level": "self_care"
    }
  ],
  "warnings": ["Seek immediate care if symptoms worsen"],
  "disclaimer": "This tool is for educational purposes only..."
}
```

### 2. Report Summarization - `POST /summarize`
**Purpose:** Summarizes medical reports (PDF or text) using AI.

**Request (multipart/form-data):**
- `pdf`: PDF file (optional)
- `text`: Text content (optional)

**Response:**
```json
{
  "abstract": "Summary of the report...",
  "bullet_points": ["Key finding 1", "Key finding 2"],
  "follow_up_questions": ["Question 1", "Question 2"],
  "disclaimer": "This tool is for educational purposes only..."
}
```

## Frontend Integration

### Chat Component (`Chat.tsx`)
The chat component now:
- Detects symptom-related queries and calls `/symptoms`
- Handles PDF uploads and calls `/summarize`
- Displays results with confidence scores and suggested tests
- Shows error messages if the backend is unavailable

### Key Features
1. **PDF Upload:** Click the file upload button to select a PDF test report
2. **Symptom Analysis:** Type your symptoms naturally (e.g., "I have fever and headache")
3. **Real-time Feedback:** Loading states and error handling
4. **Rich UI:** Displays conditions with confidence percentages and recommended tests

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Add your Groq API key to `.env`:**
   ```
   GROQ_API_KEY=your_actual_api_key_here
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   
   The backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:3000`

## Testing the Integration

### Test Symptom Analysis
1. Open the app at `http://localhost:3000`
2. Login (or continue as guest)
3. Type: "I have fever, headache, and cough"
4. Press Send
5. You should see possible conditions and recommended tests

### Test PDF Summarization
1. Click the file upload button (📤)
2. Select a PDF medical report
3. Optionally add a message
4. Press Send
5. You should see the report summary with key points

## API Configuration

The frontend connects to the backend using:
```typescript
const API_BASE_URL = "http://localhost:8000";
```

To change the backend URL (for production), update this constant in `Chat.tsx`.

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (frontend)
- All origins (for development)

For production, update the CORS settings in `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-production-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

## Troubleshooting

### Backend Issues
- **Error: "GROQ_API_KEY not set"**
  - Make sure you created a `.env` file in the `backend` directory
  - Add your Groq API key to the file

- **Port 8000 already in use**
  - Stop any other process using port 8000
  - Or change the port: `uvicorn app.main:app --reload --port 8001`

### Frontend Issues
- **"Failed to fetch" error**
  - Make sure the backend is running on port 8000
  - Check that CORS is properly configured
  - Verify the API_BASE_URL in Chat.tsx

- **PDF upload not working**
  - Ensure PyMuPDF is installed: `pip install PyMuPDF`
  - Check that the file is a valid PDF

## Dependencies

### Backend
- FastAPI
- Uvicorn
- python-dotenv
- requests
- PyMuPDF (for PDF processing)

### Frontend
- React
- TypeScript
- Motion (Framer Motion)
- Shadcn/ui components

## Next Steps

1. **Get a Groq API Key:**
   - Visit https://console.groq.com
   - Sign up and generate an API key
   - Add it to your `.env` file

2. **Test Both Servers:**
   - Start backend: `uvicorn app.main:app --reload` (in backend directory)
   - Start frontend: `npm run dev` (in frontend directory)

3. **Try the Features:**
   - Symptom analysis
   - PDF report summarization
   - Chat interactions

## Security Notes

- Never commit the `.env` file to version control
- The `.env.example` file is safe to commit
- Always use environment variables for API keys
- In production, implement proper authentication and rate limiting

## Support

If you encounter any issues:
1. Check that both servers are running
2. Verify your API key is correct
3. Check the browser console for errors
4. Check the backend terminal for error messages
