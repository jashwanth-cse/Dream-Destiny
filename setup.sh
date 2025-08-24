#!/bin/bash

# =============================================================================
# DREAM DESTINY - AUTOMATED SETUP SCRIPT (Linux/macOS)
# =============================================================================
# This script automates the setup process for Dream Destiny
# =============================================================================

set -e  # Exit on any error

echo "🌟 Welcome to Dream Destiny Setup!"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Python is installed
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_status "Python $PYTHON_VERSION found"
    else
        print_error "Python 3 is not installed. Please install Python 3.8+ first."
        exit 1
    fi
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js $NODE_VERSION found"
    else
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
}

# Setup backend
setup_backend() {
    print_info "Setting up backend..."
    
    cd backend
    
    # Create virtual environment
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    print_info "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Setup environment file
    if [ ! -f .env ]; then
        print_info "Creating backend environment file..."
        cp .env.template .env
        print_warning "Please edit backend/.env with your API keys!"
    else
        print_status "Backend .env file already exists"
    fi
    
    cd ..
    print_status "Backend setup complete!"
}

# Setup frontend
setup_frontend() {
    print_info "Setting up frontend..."
    
    cd frontend/client
    
    # Install dependencies
    print_info "Installing Node.js dependencies..."
    npm install
    
    # Setup environment file
    if [ ! -f .env ]; then
        print_info "Creating frontend environment file..."
        cp .env.template .env
        print_warning "Please edit frontend/client/.env with your Firebase config!"
    else
        print_status "Frontend .env file already exists"
    fi
    
    cd ../..
    print_status "Frontend setup complete!"
}

# Main setup process
main() {
    echo
    print_info "Checking prerequisites..."
    check_python
    check_node
    
    echo
    print_info "Setting up project..."
    setup_backend
    setup_frontend
    
    echo
    print_status "🎉 Setup complete!"
    echo
    print_info "Next steps:"
    echo "1. Edit backend/.env with your API keys"
    echo "2. Edit frontend/client/.env with your Firebase config"
    echo "3. Start the backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
    echo "4. Start the frontend: cd frontend/client && npm start"
    echo
    print_info "For detailed instructions, see README.md"
}

# Run main function
main
