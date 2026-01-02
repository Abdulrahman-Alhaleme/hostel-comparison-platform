# Hostel Comparison Platform with AI

## Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- MongoDB (Running locally on port 27017 or update `backend/app/config.py`)
- OpenAI API Key (Set in `backend/app/config.py` or `.env` as `OPENAI_API_KEY`)

## Setup

### Backend
1. Navigate to root directory.
2. Create virtual environment and install dependencies (if not done):
```bash
python -m venv backend/venv
source backend/venv/bin/activate  # Windows: backend\venv\Scripts\activate
pip install -r backend/requirements.txt
```
3. Seed the database (Make sure MongoDB is running):
```bash
# Windows PowerShell
$env:PYTHONPATH="backend"; python backend/scripts/seed_db.py
```
4. Run the server:
```bash
uvicorn app.main:app --reload --app-dir backend
```

### Frontend
1. Navigate to `frontend`.
2. Install dependencies:
```bash
npm install
```
3. Run the development server:
```bash
npm run dev
```

## Features
- **User Authentication**: Register/Login with JWT.
- **AI Comparison**: Compare two hostels using OpenAI (Requires API Key).
- **Dashboard**: View history (structure ready).
- **Dark Mode**: Toggle theme globally.
- **Export**: Export comparisons to PDF.

## Tech Stack
- Frontend: React + Vite, Recharts, Framer Motion, Vanilla CSS (Glassmorphism).
- Backend: FastAPI, Motor (Async Mongo), Pydantic.
