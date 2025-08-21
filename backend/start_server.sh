#!/bin/bash

echo "============================================================"
echo "🌟 Dream Destiny Backend Startup Script (Linux/Mac)"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}❌ Error: Python is not installed${NC}"
    echo "Please install Python from https://python.org"
    exit 1
fi

# Use python3 if available, otherwise python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

echo -e "${GREEN}✅ Python is installed${NC}"

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    if [ -f ".env.example" ]; then
        echo "Please copy .env.example to .env and fill in your API keys"
        echo "Example: cp .env.example .env"
    else
        echo "Please create .env file with your API keys"
    fi
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Install requirements
echo -e "${BLUE}📦 Installing requirements...${NC}"
$PYTHON_CMD -m pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error installing requirements${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Requirements installed${NC}"

# Start the server
echo -e "${BLUE}🚀 Starting Dream Destiny Backend Server...${NC}"
echo "Server will be available at: http://127.0.0.1:8000"
echo "API Documentation: http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Try different methods to start uvicorn
$PYTHON_CMD -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
if [ $? -ne 0 ]; then
    echo ""
    echo -e "${YELLOW}❌ Failed to start with $PYTHON_CMD -m uvicorn${NC}"
    echo "Trying alternative method..."
    uvicorn main:app --reload --host 127.0.0.1 --port 8000
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "${RED}❌ All methods failed. Please try manual installation:${NC}"
        echo "1. pip install uvicorn"
        echo "2. python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"
        exit 1
    fi
fi
