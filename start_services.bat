@echo off
echo 🚀 Starting AgriPredict Services...
echo ======================================

REM Start frontend in background
echo Starting Next.js frontend...
start "Frontend" cmd /c "cd /d %~dp0 && npm run dev"

REM Wait a moment for frontend to start
timeout /t 3 /nobreak > nul

REM Start backend
echo Starting analysis service...
cd /d %~dp0analysis-service
python run.py run

echo Services stopped.
pause
