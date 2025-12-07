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

### **Clone the Repository**

git clone https://github.com/K4U5H1K-max/MyHealthMate.git
cd myhealthmate

### **Backend Setup (FastAPI)**
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --reload

### **Frontend Setup (Next.js)**
cd frontend
npm install
npm run dev
