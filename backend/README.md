# Dream Destiny Backend

FastAPI backend for the Dream Destiny travel planning application.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

#### Windows:
```bash
# Double-click or run in Command Prompt
start_server.bat
```

#### Linux/Mac:
```bash
# Make executable and run
chmod +x start_server.sh
./start_server.sh
```

#### Cross-platform Python script:
```bash
python start_server.py
```

### Option 2: Manual Setup

#### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 2. Set up Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your API keys
# Required: GEMINI_API_KEY, GOOGLE_PLACES_API_KEY
```

#### 3. Start the Server
```bash
# Method 1 (Recommended)
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Method 2 (If uvicorn is in PATH)
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## 🔧 Troubleshooting

### "uvicorn is not recognized as command"

This happens when uvicorn is not in your system PATH. Try these solutions:

#### Solution 1: Use Python module syntax
```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### Solution 2: Reinstall uvicorn
```bash
pip uninstall uvicorn
pip install uvicorn
```

#### Solution 3: Use virtual environment
```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### Solution 4: Check Python installation
```bash
# Check Python version (should be 3.8+)
python --version

# Check pip
pip --version

# Upgrade pip
python -m pip install --upgrade pip
```

### Environment Variables Issues

Make sure your `.env` file contains:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
GOOGLE_PLACES_API_KEY=your_actual_google_places_api_key
```

### Port Already in Use
If port 8000 is busy, change the port:
```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

## 📋 Requirements

- Python 3.8 or higher
- pip (Python package manager)
- Internet connection for API calls

## 🔑 API Keys Required

1. **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Google Places API Key**: Get from [Google Cloud Console](https://console.cloud.google.com/)

## 🌐 API Endpoints

Once running, the server provides:

- **Base URL**: http://127.0.0.1:8000
- **API Documentation**: http://127.0.0.1:8000/docs
- **Interactive API**: http://127.0.0.1:8000/redoc

### Main Endpoints:
- `POST /routers/generate-itinerary` - Generate travel itinerary
- `GET /places/autocomplete` - Get place suggestions
- `POST /chat/followup` - Modify existing itinerary

## 🐛 Common Issues

### 1. Module Not Found Errors
```bash
# Install missing modules
pip install fastapi uvicorn requests python-multipart
```

### 2. Permission Errors (Linux/Mac)
```bash
# Make scripts executable
chmod +x start_server.sh
chmod +x start_server.py
```

### 3. Python Version Issues
```bash
# Check Python version
python --version

# Use python3 if needed
python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 4. Firewall/Antivirus Blocking
- Allow Python through Windows Firewall
- Add exception in antivirus software

## 📞 Support

If you're still having issues:

1. Check the console output for specific error messages
2. Ensure all requirements are installed: `pip list`
3. Try running in a virtual environment
4. Check if the port is available: `netstat -an | findstr 8000`

## 🔄 Development

For development with auto-reload:
```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The `--reload` flag automatically restarts the server when code changes.
