# 📦 Dream Destiny - Complete Dependencies Guide

This document lists all dependencies required for the Dream Destiny project.

## 🐍 Backend Dependencies (Python)

### Core Framework
- **fastapi>=0.104.1** - Modern, fast web framework for building APIs
- **uvicorn[standard]>=0.24.0** - ASGI server for running FastAPI applications

### Database & ORM
- **sqlalchemy>=2.0.23** - SQL toolkit and Object-Relational Mapping library
- **pydantic>=2.5.0** - Data validation using Python type annotations

### Environment & Configuration
- **python-dotenv>=1.0.0** - Load environment variables from .env file

### Authentication & Security
- **passlib[bcrypt]>=1.7.4** - Password hashing library
- **python-jose[cryptography]>=3.3.0** - JWT token handling

### HTTP Requests & API Integration
- **requests>=2.31.0** - HTTP library for making API calls

### Additional Utilities
- **python-multipart>=0.0.6** - Form data parsing

### Installation Command:
```bash
cd backend
pip install -r requirements.txt
```

## ⚛️ Frontend Dependencies (Node.js)

### Core Framework
- **react@^19.1.1** - JavaScript library for building user interfaces
- **react-dom@^19.1.1** - React package for working with the DOM
- **react-router-dom@^7.8.0** - Declarative routing for React

### Build Tools
- **react-scripts@5.0.1** - Configuration and scripts for Create React App

### Authentication & Database
- **firebase@^12.1.0** - Firebase SDK for authentication and database

### Testing
- **@testing-library/react@^16.3.0** - Testing utilities for React components
- **@testing-library/jest-dom@^6.6.4** - Custom Jest matchers for DOM elements
- **@testing-library/user-event@^13.5.0** - User interaction simulation
- **@testing-library/dom@^10.4.1** - DOM testing utilities

### Performance Monitoring
- **web-vitals@^2.1.4** - Library for measuring web performance metrics

### Installation Command:
```bash
cd frontend/client
npm install
```

## 🔧 Development Dependencies

### Python Development
```bash
# Optional development dependencies
pip install pytest>=7.0.0          # Testing framework
pip install black>=23.0.0           # Code formatter
pip install flake8>=6.0.0          # Linting
pip install mypy>=1.0.0            # Type checking
```

### Node.js Development
```bash
# These are included in react-scripts
# - ESLint (linting)
# - Prettier (code formatting)
# - Jest (testing)
# - Webpack (bundling)
```

## 🌐 External API Dependencies

### Required APIs
1. **Google Gemini AI API**
   - Purpose: AI-powered itinerary generation
   - Get from: https://makersuite.google.com/app/apikey

2. **Google Places API**
   - Purpose: Location autocomplete and place details
   - Get from: https://console.cloud.google.com/apis/credentials

3. **Firebase**
   - Purpose: User authentication and data storage
   - Get from: https://console.firebase.google.com/

### Optional APIs
1. **RapidAPI IRCTC**
   - Purpose: Real-time Indian train data
   - Get from: https://rapidapi.com/ (search for IRCTC)

2. **Amadeus API**
   - Purpose: Flight and hotel data (optional)
   - Get from: https://developers.amadeus.com/

## 🖥️ System Requirements

### Minimum Requirements
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher
- **npm**: 8.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space

### Recommended Development Environment
- **OS**: Windows 10/11, macOS 10.15+, or Ubuntu 20.04+
- **IDE**: VS Code, PyCharm, or similar
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## 📋 Installation Checklist

### Backend Setup
- [ ] Python 3.8+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed from requirements.txt
- [ ] .env file configured with API keys
- [ ] Server starts without errors

### Frontend Setup
- [ ] Node.js 16+ installed
- [ ] npm dependencies installed
- [ ] .env file configured with Firebase settings
- [ ] Development server starts without errors

### API Configuration
- [ ] Google Gemini AI API key obtained and configured
- [ ] Google Places API key obtained and configured
- [ ] Firebase project created and configured
- [ ] Optional: RapidAPI IRCTC key configured
- [ ] Optional: Amadeus API keys configured

## 🔍 Dependency Security

### Security Best Practices
1. **Keep dependencies updated** - Regularly update to latest stable versions
2. **Audit dependencies** - Use `npm audit` and `pip-audit` to check for vulnerabilities
3. **Use lock files** - Commit package-lock.json and consider using pip-tools
4. **Environment isolation** - Always use virtual environments for Python

### Update Commands
```bash
# Update Python dependencies
pip list --outdated
pip install --upgrade package_name

# Update Node.js dependencies
npm outdated
npm update
```

## 🐛 Common Dependency Issues

### Python Issues
1. **Virtual environment not activated**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/macOS
   source venv/bin/activate
   ```

2. **Permission errors**
   ```bash
   # Use --user flag if needed
   pip install --user package_name
   ```

### Node.js Issues
1. **Node version conflicts**
   ```bash
   # Use nvm to manage Node versions
   nvm install 16
   nvm use 16
   ```

2. **Cache issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📞 Support

If you encounter dependency issues:
1. Check the troubleshooting section in README.md
2. Verify your Python and Node.js versions
3. Ensure all environment variables are set correctly
4. Create an issue on GitHub with error details

---

**Last Updated**: December 2024
