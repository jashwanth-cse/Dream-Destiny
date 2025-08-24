# 🌟 Dream Destiny - AI-Powered Travel Planner

**Dream Destiny** is an intelligent travel planning application that creates personalized itineraries using AI, real-time travel data, and user preferences. Plan single destinations or multi-city journeys with ease!

## ✨ Features

- 🤖 **AI-Powered Itineraries** - Gemini AI creates detailed, personalized travel plans
- 🚂 **Real Train Data** - IRCTC API integration for accurate Indian railway information
- 🗺️ **Multi-Destination Support** - Plan complex multi-city journeys
- 🔐 **User Authentication** - Firebase Auth with Google Sign-in
- 💾 **Save & Download** - Store itineraries in your dashboard or download as files
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🌍 **Google Places Integration** - Smart location autocomplete

## 🏗️ Architecture

```
Dream Destiny/
├── backend/                 # FastAPI Python backend
│   ├── main.py             # Main application entry
│   ├── services/           # Business logic services
│   └── requirements.txt    # Python dependencies
├── frontend/client/        # React frontend
│   ├── src/               # React components and logic
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **Git**

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/dream-destiny.git
cd dream-destiny
```

### 2. Backend Setup

#### On Windows:
```cmd
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
copy .env.template .env
# Edit .env with your API keys

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### On Linux/macOS:
```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.template .env
# Edit .env with your API keys

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

#### On Windows:
```cmd
# Navigate to frontend (new terminal)
cd frontend\client

# Install dependencies
npm install

# Setup environment
copy .env.template .env
# Edit .env with your Firebase config

# Start development server
npm start
```

#### On Linux/macOS:
```bash
# Navigate to frontend (new terminal)
cd frontend/client

# Install dependencies
npm install

# Setup environment
cp .env.template .env
# Edit .env with your Firebase config

# Start development server
npm start
```

## 🔑 API Keys Setup

### Required API Keys:

1. **Google Gemini AI** (Required)
   - Get from: https://makersuite.google.com/app/apikey
   - Add to `backend/.env` as `GEMINI_API_KEY`

2. **Google Places API** (Required)
   - Get from: https://console.cloud.google.com/apis/credentials
   - Add to `backend/.env` as `GOOGLE_PLACES_API_KEY`

3. **Firebase Configuration** (Required)
   - Get from: https://console.firebase.google.com/
   - Add to `frontend/client/.env` as `REACT_APP_FIREBASE_*`

4. **RapidAPI IRCTC** (Optional - for real train data)
   - Get from: https://rapidapi.com/ (search for IRCTC)
   - Add to `backend/.env` as `RAPIDAPI_IRCTC_KEY`

### Environment File Setup:

```bash
# Backend environment
cp backend/.env.template backend/.env

# Frontend environment  
cp frontend/client/.env.template frontend/client/.env

# Edit both files with your actual API keys
```

## 📦 Dependencies

### Backend (Python)
- **FastAPI** - Modern web framework
- **Uvicorn** - ASGI server
- **Requests** - HTTP client for API calls
- **Python-dotenv** - Environment variable management
- **Pydantic** - Data validation

### Frontend (React)
- **React 19** - UI framework
- **React Router** - Navigation
- **Firebase** - Authentication & database
- **React Scripts** - Build tools

## 🧪 Testing

### Backend Testing:
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing:
```bash
cd frontend/client
npm test
```

## 🚀 Production Deployment

### Backend Deployment:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment:
```bash
cd frontend/client
npm run build
# Deploy build/ folder to your hosting service
```

## 🔧 Configuration

### Environment Variables:

#### Backend (.env):
```env
GEMINI_API_KEY=your_gemini_key
GOOGLE_PLACES_API_KEY=your_places_key
RAPIDAPI_IRCTC_KEY=your_irctc_key
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8000
```

#### Frontend (.env):
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_API_BASE_URL=https://your-backend-url.com
```

## 🐛 Troubleshooting

### Common Issues:

1. **Port already in use**:
   ```bash
   # Kill process on port 3000/8000
   npx kill-port 3000
   npx kill-port 8000
   ```

2. **Module not found**:
   ```bash
   # Reinstall dependencies
   pip install -r requirements.txt
   npm install
   ```

3. **API key errors**:
   - Verify all API keys are correctly set in .env files
   - Check API key permissions and quotas

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@dreamdestiny.com or create an issue on GitHub.

---

**Made with ❤️ by the Dream Destiny Team**
