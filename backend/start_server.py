#!/usr/bin/env python3
"""
Startup script for Dream Destiny Backend
This script handles different Python environments and ensures uvicorn runs properly
"""

import sys
import subprocess
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version}")
    return True

def install_requirements():
    """Install required packages"""
    requirements_file = Path(__file__).parent / "requirements.txt"
    if not requirements_file.exists():
        print("❌ Error: requirements.txt not found")
        return False
    
    print("📦 Installing requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)])
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False

def check_env_file():
    """Check if .env file exists"""
    env_file = Path(__file__).parent / ".env"
    env_example = Path(__file__).parent / ".env.example"
    
    if not env_file.exists():
        if env_example.exists():
            print("⚠️  .env file not found. Please copy .env.example to .env and fill in your API keys")
            print("   cp .env.example .env")
        else:
            print("⚠️  .env file not found. Please create one with your API keys")
        return False
    
    print("✅ .env file found")
    return True

def start_server():
    """Start the uvicorn server"""
    print("🚀 Starting Dream Destiny Backend Server...")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Try different ways to run uvicorn
    commands_to_try = [
        [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
        ["uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
        ["python", "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
        ["python3", "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"]
    ]
    
    for i, cmd in enumerate(commands_to_try, 1):
        try:
            print(f"🔄 Attempt {i}: {' '.join(cmd)}")
            subprocess.run(cmd, check=True)
            break
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            print(f"❌ Attempt {i} failed: {e}")
            if i < len(commands_to_try):
                print("   Trying alternative method...")
            else:
                print("\n❌ All attempts failed. Please try manual installation:")
                print("   1. pip install uvicorn")
                print("   2. python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000")
                return False
    
    return True

def main():
    """Main function"""
    print("=" * 60)
    print("🌟 Dream Destiny Backend Startup Script")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        return
    
    # Install requirements
    if not install_requirements():
        return
    
    # Check environment file
    if not check_env_file():
        print("\n📝 Please set up your .env file before starting the server")
        return
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
