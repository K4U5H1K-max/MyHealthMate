# MyHealthMate
AI-powered platform that simplifies complex medical papers into plain-language summaries and helps users understand possible causes for their symptoms using a hybrid expert system + AI chatbot. ⚕️ Built with FastAPI, Next.js, and OpenAI GPT, this project is a step toward accessible, patient-friendly healthcare technology.
# 🩺 MyHealthMate
**AI-powered Medical Paper Simplifier & Symptom Expert System**

MyHealthMate is a web application designed to **bridge the gap between complex medical information and everyday understanding**.  
It has two core features:

1. **Medical Paper Simplifier** – Upload a research paper or paste medical text, and MyHealthMate generates:
   - A concise abstract
   - Patient-friendly explanations
   - Suggested follow-up questions to discuss with a doctor

2. **Symptom Expert System** – Enter your symptoms, and MyHealthMate provides:
   - A ranked list of **possible causes** (not a diagnosis)
   - Recommended **tests** to confirm or rule out conditions
   - **Triage guidance** (self-care, consult GP, or emergency care)

> ⚠️ **Disclaimer:**  
> This tool is for **educational purposes only** and **not a substitute for professional medical advice**.  
> Always consult a qualified healthcare provider for diagnosis and treatment.

---

## 🚀 Features
- **Simplify medical research** into actionable patient insights.
- Hybrid **expert system + GPT-powered explanations**.
- PDF & text ingestion for paper summarization.
- **Bayesian scoring engine** for symptom-cause ranking.
- Red flag safety rules for urgent/emergency triage.
- Modern **Next.js frontend** + **FastAPI backend**.
- Deployable to **Vercel** (frontend) & **Railway/Render** (backend).

---

## 🗂 Project Structure
myhealthmate/
├── backend/ # FastAPI backend
│ ├── app/
│ │ ├── main.py # API entrypoint
│ │ ├── routers/ # Route handlers (/summarize, /symptoms)
│ │ ├── services/ # Core logic (KB, scoring, GPT helpers)
│ │ ├── models/ # Pydantic models
│ │ └── data/ # knowledge_base.json, red_flags.json
│ └── requirements.txt
│
├── frontend/ # Next.js frontend
│ ├── pages/
│ ├── components/
│ └── package.json
│
└── README.md


---

## ⚙️ Tech Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js, Tailwind CSS |
| **Backend** | FastAPI (Python) |
| **AI Models** | OpenAI GPT-4/GPT-4o-mini |
| **Database** | PostgreSQL (via Railway) |
| **Deployment** | Vercel (frontend), Railway/Render (backend) |

---

## 🛠 Setup Instructions

### **Prerequisites**
Before you begin, make sure you have the following installed:
- **Python 3.8+** ([Download here](https://www.python.org/downloads/))
- **Node.js 16+** and npm ([Download here](https://nodejs.org/))
- **Git** ([Download here](https://git-scm.com/downloads))

---

### **Step 1: Clone the Repository**
Open your terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
git clone https://github.com/K4U5H1K-max/MyHealthMate.git
cd MyHealthMate
```

---

### **Step 2: Backend Setup (FastAPI)**

#### **2.1 Create a Virtual Environment**
A virtual environment keeps your project dependencies isolated from other Python projects.

```bash
# Navigate to the project root (if not already there)
cd MyHealthMate

# Create a virtual environment named 'venv'
python -m venv venv
```

#### **2.2 Activate the Virtual Environment**

**On Windows (Command Prompt or PowerShell):**
```bash
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` appear at the start of your terminal prompt, indicating the virtual environment is active.

#### **2.3 Install Dependencies**
Install all required Python packages from `requirements.txt`:

```bash
pip install -r requirements.txt
```

This will install FastAPI, uvicorn, and all other dependencies needed for the backend.

#### **2.4 Start the Backend Server**
Navigate to the backend folder and start the FastAPI server:

```bash
cd backend
uvicorn app.main:app --reload
```

The backend API will be running at `http://localhost:8000`  
You can view the API documentation at `http://localhost:8000/docs`

> **Keep this terminal window open** while using the application!

---

### **Step 3: Frontend Setup (Next.js)**

Open a **new terminal window** (keep the backend running in the previous one).

#### **3.1 Navigate to Frontend Directory**
```bash
cd MyHealthMate/frontend
```

#### **3.2 Install Node Dependencies**
Install all required npm packages:

```bash
npm install
```

This will download and install React, Next.js, Tailwind CSS, and other frontend dependencies.

#### **3.3 Start the Frontend Development Server**
```bash
npm run dev
```

The frontend will be running at `http://localhost:3000`

> **Keep this terminal window open** as well!

---

### **Step 4: Access the Application**
Open your web browser and navigate to:
```
http://localhost:3000
```

You should now see the MyHealthMate application! 🎉

---

### **🔄 Stopping the Application**

**To stop the servers:**
- Press `Ctrl + C` in each terminal window where the servers are running

**To deactivate the virtual environment (backend):**
```bash
deactivate
```

---

### **📝 Quick Restart Guide**

**Next time you want to run the application:**

1. **Terminal 1 (Backend):**
   ```bash
   cd MyHealthMate
   venv\Scripts\activate  # On Windows
   # source venv/bin/activate  # On macOS/Linux
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Terminal 2 (Frontend):**
   ```bash
   cd MyHealthMate/frontend
   npm run dev
   ```

3. **Open browser:** `http://localhost:3000`
