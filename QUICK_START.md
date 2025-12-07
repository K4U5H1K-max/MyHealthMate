# MyHealthMate - Quick Start Guide

## Prerequisites Check
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Groq API key obtained from https://console.groq.com

## 🚀 Quick Start (First Time Setup)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# OR
cp .env.example .env    # Mac/Linux

# Edit .env file and add your Groq API key:
# GROQ_API_KEY=your_actual_api_key_here
```

### 2. Frontend Setup
```bash
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

## 🏃 Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
# Activate venv if not already active
uvicorn app.main:app --reload
```
✅ Backend should be running on http://localhost:8000

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
✅ Frontend should be running on http://localhost:3000

## 🧪 Testing the Integration

### Test 1: Symptom Analysis
1. Open http://localhost:3000
2. Login or continue as guest
3. Type: **"I have fever, headache, and body aches"**
4. Click Send
5. ✅ You should see possible conditions and recommended tests

### Test 2: PDF Summarization
1. Click the 📤 (upload) button
2. Select a PDF medical report
3. Optionally add a message: **"Please summarize this report"**
4. Click Send
5. ✅ You should see the report summary with key points

### Test 3: General Chat
1. Type: **"What can you help me with?"**
2. Click Send
3. ✅ You should see a helpful response about available features

## 🔍 Verify Everything is Working

### Backend Health Check
Open http://localhost:8000/docs in your browser
- ✅ You should see the FastAPI Swagger UI
- ✅ Two endpoints should be visible: `/symptoms` and `/summarize`

### Frontend Check
- ✅ Landing page loads
- ✅ Login page accessible
- ✅ Chat page loads after login
- ✅ Upload button visible
- ✅ Text input working

## 📊 Expected Behavior

### Symptom Analysis Response
- Shows list of possible conditions
- Displays confidence percentages (e.g., "Common Cold (85%)")
- Lists recommended tests
- Shows warning messages if applicable

### PDF Summary Response
- Shows abstract/summary
- Lists key bullet points
- Provides follow-up questions
- All in easy-to-read format

## ❌ Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Mac/Linux

# Try a different port
uvicorn app.main:app --reload --port 8001
# Update frontend API_BASE_URL to http://localhost:8001
```

### Frontend won't start
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try a different port
npm run dev -- --port 3001
```

### API calls failing
1. Check backend is running (http://localhost:8000/docs)
2. Check browser console for CORS errors
3. Verify GROQ_API_KEY is set in .env
4. Check terminal for backend error messages

### PDF upload not working
```bash
# Install PyMuPDF
pip install PyMuPDF

# Restart backend
uvicorn app.main:app --reload
```

## 🎯 Common Issues

### "GROQ_API_KEY not set"
- Create `.env` file in `backend/` directory
- Add: `GROQ_API_KEY=your_key_here`
- Restart backend server

### "Failed to fetch"
- Ensure backend is running on port 8000
- Check firewall isn't blocking localhost
- Verify CORS settings in main.py

### TypeScript errors in frontend
- These are often just IntelliSense warnings
- Try: `npm run build` to see if it actually compiles
- Most type errors will resolve during build

## 📞 Need Help?

1. Check INTEGRATION_GUIDE.md for detailed documentation
2. Check INTEGRATION_SUMMARY.md for technical details
3. Review error messages in browser console (F12)
4. Review error messages in backend terminal

## ✨ You're All Set!

Once both servers are running:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

Enjoy using MyHealthMate! 🏥💚
