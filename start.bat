@echo off
echo =========================================================
echo        VOICESHIELD - AI Security Incident Assistant       
echo          HackerHouse Goa Submission | SOC Console         
echo =========================================================
echo.

echo [1/2] Starting VoiceShield FastAPI Backend on port 8000...
start "VoiceShield Backend (FastAPI)" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting VoiceShield Frontend (Vite) on port 5173...
cd frontend
start "VoiceShield Frontend (Vite)" cmd /k "npm run dev"

echo.
echo =========================================================
echo VoiceShield is launching!
echo Backend API:  http://127.0.0.1:8000/docs
echo SOC Console:  http://127.0.0.1:5173/
echo =========================================================
pause
