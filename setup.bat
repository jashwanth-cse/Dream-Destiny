@echo off
REM =============================================================================
REM DREAM DESTINY - AUTOMATED SETUP SCRIPT (Windows)
REM =============================================================================
REM This script automates the setup process for Dream Destiny on Windows
REM =============================================================================

echo 🌟 Welcome to Dream Destiny Setup!
echo ==================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
) else (
    echo ✅ Python found
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
) else (
    echo ✅ Node.js found
)

echo.
echo ℹ️  Setting up backend...
cd backend

REM Create virtual environment
echo ℹ️  Creating Python virtual environment...
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
echo ℹ️  Installing Python dependencies...
pip install -r requirements.txt

REM Setup environment file
if not exist .env (
    echo ℹ️  Creating backend environment file...
    copy .env.template .env
    echo ⚠️  Please edit backend\.env with your API keys!
) else (
    echo ✅ Backend .env file already exists
)

cd ..
echo ✅ Backend setup complete!

echo.
echo ℹ️  Setting up frontend...
cd frontend\client

REM Install dependencies
echo ℹ️  Installing Node.js dependencies...
npm install

REM Setup environment file
if not exist .env (
    echo ℹ️  Creating frontend environment file...
    copy .env.template .env
    echo ⚠️  Please edit frontend\client\.env with your Firebase config!
) else (
    echo ✅ Frontend .env file already exists
)

cd ..\..
echo ✅ Frontend setup complete!

echo.
echo 🎉 Setup complete!
echo.
echo ℹ️  Next steps:
echo 1. Edit backend\.env with your API keys
echo 2. Edit frontend\client\.env with your Firebase config
echo 3. Start the backend: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn main:app --reload
echo 4. Start the frontend: cd frontend\client ^&^& npm start
echo.
echo ℹ️  For detailed instructions, see README.md
echo.
pause
