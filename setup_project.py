#!/usr/bin/env python3
"""
Dream Destiny Project Setup Script
This script sets up both frontend and backend for the Dream Destiny project
"""

import sys
import subprocess
import os
import shutil
from pathlib import Path

def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f"🌟 {title}")
    print("=" * 60)

def print_step(step):
    """Print a step"""
    print(f"\n📋 {step}")

def run_command(command, cwd=None, shell=False):
    """Run a command and return success status"""
    try:
        if isinstance(command, str):
            command = command.split() if not shell else command
        
        result = subprocess.run(
            command, 
            cwd=cwd, 
            shell=shell, 
            capture_output=True, 
            text=True
        )
        
        if result.returncode == 0:
            print(f"✅ Success: {' '.join(command) if isinstance(command, list) else command}")
            return True
        else:
            print(f"❌ Failed: {' '.join(command) if isinstance(command, list) else command}")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def check_python():
    """Check Python installation"""
    print_step("Checking Python installation")
    
    if sys.version_info < (3, 8):
        print(f"❌ Python 3.8+ required. Current: {sys.version}")
        return False
    
    print(f"✅ Python {sys.version}")
    return True

def check_node():
    """Check Node.js installation"""
    print_step("Checking Node.js installation")
    
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js {result.stdout.strip()}")
            return True
        else:
            print("❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found")
        return False

def setup_backend():
    """Set up the backend"""
    print_header("Setting up Backend")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    # Install Python requirements
    print_step("Installing Python requirements")
    requirements_file = backend_dir / "requirements.txt"
    
    if requirements_file.exists():
        success = run_command([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)])
        if not success:
            print("❌ Failed to install Python requirements")
            return False
    else:
        print("⚠️  requirements.txt not found, installing basic packages")
        packages = ["fastapi", "uvicorn", "requests", "python-multipart", "sqlalchemy", "python-dotenv"]
        for package in packages:
            run_command([sys.executable, "-m", "pip", "install", package])
    
    # Check .env file
    print_step("Checking environment configuration")
    env_file = backend_dir / ".env"
    env_example = backend_dir / ".env.example"
    
    if not env_file.exists():
        if env_example.exists():
            print("📝 Copying .env.example to .env")
            shutil.copy(env_example, env_file)
            print("⚠️  Please edit .env file with your API keys")
        else:
            print("⚠️  No .env file found. Please create one with your API keys")
    else:
        print("✅ .env file exists")
    
    return True

def setup_frontend():
    """Set up the frontend"""
    print_header("Setting up Frontend")
    
    frontend_dir = Path("frontend/client")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Install npm dependencies
    print_step("Installing npm dependencies")
    success = run_command(["npm", "install"], cwd=frontend_dir)
    if not success:
        print("❌ Failed to install npm dependencies")
        return False
    
    # Check .env file
    print_step("Checking frontend environment configuration")
    env_file = frontend_dir / ".env"
    env_example = frontend_dir / ".env.example"
    
    if not env_file.exists():
        if env_example.exists():
            print("📝 Copying .env.example to .env")
            shutil.copy(env_example, env_file)
            print("⚠️  Please edit .env file with your Firebase configuration")
        else:
            print("⚠️  No .env file found. Please create one with your configuration")
    else:
        print("✅ .env file exists")
    
    return True

def create_start_scripts():
    """Create convenient start scripts"""
    print_header("Creating Start Scripts")
    
    # Create start_all script for Windows
    start_all_bat = """@echo off
echo Starting Dream Destiny Application...
echo.

echo Starting Backend...
start "Backend" cmd /k "cd backend && python start_server.py"

timeout /t 5 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend/client && npm start"

echo.
echo ✅ Both servers are starting...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
pause
"""
    
    with open("start_all.bat", "w") as f:
        f.write(start_all_bat)
    
    # Create start_all script for Linux/Mac
    start_all_sh = """#!/bin/bash
echo "Starting Dream Destiny Application..."
echo ""

echo "Starting Backend..."
cd backend
python3 start_server.py &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo "Starting Frontend..."
cd ../frontend/client
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo "Backend: http://127.0.0.1:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
"""
    
    with open("start_all.sh", "w") as f:
        f.write(start_all_sh)
    
    # Make executable on Unix systems
    if os.name != 'nt':
        os.chmod("start_all.sh", 0o755)
    
    print("✅ Created start_all scripts")

def main():
    """Main setup function"""
    print_header("Dream Destiny Project Setup")
    
    # Check prerequisites
    if not check_python():
        print("\n❌ Please install Python 3.8+ and try again")
        return
    
    if not check_node():
        print("\n❌ Please install Node.js and try again")
        print("Download from: https://nodejs.org/")
        return
    
    # Setup backend
    if not setup_backend():
        print("\n❌ Backend setup failed")
        return
    
    # Setup frontend
    if not setup_frontend():
        print("\n❌ Frontend setup failed")
        return
    
    # Create start scripts
    create_start_scripts()
    
    # Final instructions
    print_header("Setup Complete! 🎉")
    print("\n📋 Next Steps:")
    print("1. Edit backend/.env with your API keys (Gemini, Google Places)")
    print("2. Edit frontend/client/.env with your Firebase configuration")
    print("\n🚀 To start the application:")
    print("Windows: Double-click start_all.bat")
    print("Linux/Mac: ./start_all.sh")
    print("\n🌐 URLs:")
    print("Frontend: http://localhost:3000")
    print("Backend: http://127.0.0.1:8000")
    print("API Docs: http://127.0.0.1:8000/docs")

if __name__ == "__main__":
    main()
