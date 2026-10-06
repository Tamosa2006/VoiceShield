#!/usr/bin/env bash
echo "========================================================="
echo "       VOICESHIELD - AI Security Incident Assistant      "
echo "         HackerHouse Goa Submission | SOC Console        "
echo "========================================================="

echo "[1/2] Starting VoiceShield FastAPI Backend on port 8000..."
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

echo "[2/2] Starting VoiceShield Frontend (Vite) on port 5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "VoiceShield running:"
echo "Backend API: http://127.0.0.1:8000/docs"
echo "SOC Console: http://127.0.0.1:5173/"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
