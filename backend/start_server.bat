@echo off
echo ============================================================
echo 🌟 Dream Destiny Backend Startup Script (Windows)
echo ============================================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo ✅ Python is installed

REM Navigate to backend directory
cd /d "%~dp0"

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found
    if exist ".env.example" (
        echo Please copy .env.example to .env and fill in your API keys
        echo Example: copy .env.example .env
    ) else (
        echo Please create .env file with your API keys
    )
    pause
    exit /b 1
)

echo ✅ .env file found

REM Install requirements
echo 📦 Installing requirements...
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Error installing requirements
    pause
    exit /b 1
)

echo ✅ Requirements installed

REM Start the server
echo 🚀 Starting Dream Destiny Backend Server...
echo Server will be available at: http://127.0.0.1:8000
echo API Documentation: http://127.0.0.1:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

REM Try different methods to start uvicorn
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
if errorlevel 1 (
    echo.
    echo ❌ Failed to start with python -m uvicorn
    echo Trying alternative method...
    uvicorn main:app --reload --host 127.0.0.1 --port 8000
    if errorlevel 1 (
        echo.
        echo ❌ All methods failed. Please try manual installation:
        echo 1. pip install uvicorn
        echo 2. python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
        pause
        exit /b 1
    )
)

pause
