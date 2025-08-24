# 🔑 API Keys Setup Guide

This guide will help you obtain and configure all the API keys required for Dream Destiny.

## 🚨 Security Notice

**⚠️ NEVER commit API keys to version control!**
- Keep your `.env` files private
- Use environment variables in production
- Rotate keys regularly
- Monitor API usage

## 📋 Required API Keys

### 1. 🤖 Google Gemini AI API Key (REQUIRED)

**Purpose**: AI-powered itinerary generation

**Steps to get the key**:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

**Configuration**:
```env
# In backend/.env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Usage Limits**: 
- Free tier: 60 requests per minute
- Check current quotas in Google AI Studio

---

### 2. 🗺️ Google Places API Key (REQUIRED)

**Purpose**: Location autocomplete and place details

**Steps to get the key**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Places API" service
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Restrict the key to "Places API" for security

**Configuration**:
```env
# In backend/.env
GOOGLE_PLACES_API_KEY=your_actual_places_api_key_here
```

**Usage Limits**:
- Free tier: $200 credit per month
- Monitor usage in Google Cloud Console

---

### 3. 🔥 Firebase Configuration (REQUIRED)

**Purpose**: User authentication and data storage

**Steps to get the configuration**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Copy the configuration object

**Configuration**:
```env
# In frontend/client/.env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Additional Firebase Setup**:
1. Enable Authentication → Sign-in methods → Email/Password and Google
2. Create Firestore Database
3. Set up Storage for file uploads

---

## 📋 Optional API Keys

### 4. 🚂 RapidAPI IRCTC Key (OPTIONAL)

**Purpose**: Real-time Indian train data

**Steps to get the key**:
1. Go to [RapidAPI](https://rapidapi.com/)
2. Create an account
3. Search for "IRCTC" or "Indian Railway"
4. Subscribe to an IRCTC API service
5. Copy your RapidAPI key

**Configuration**:
```env
# In backend/.env
RAPIDAPI_IRCTC_KEY=your_rapidapi_irctc_key_here
```

**Note**: Without this key, the app will use mock train data.

---

### 5. ✈️ Amadeus API Keys (OPTIONAL)

**Purpose**: Flight and hotel data

**Steps to get the keys**:
1. Go to [Amadeus for Developers](https://developers.amadeus.com/)
2. Create an account
3. Create a new application
4. Copy API Key and API Secret

**Configuration**:
```env
# In backend/.env
AMADEUS_API_KEY=your_amadeus_api_key_here
AMADEUS_API_SECRET=your_amadeus_api_secret_here
AMADEUS_BASE_URL=https://test.api.amadeus.com
```

**Note**: Use test environment for development.

---

## 🛠️ Environment Setup

### Backend Environment File
Create `backend/.env`:
```bash
cp backend/.env.template backend/.env
```

Then edit with your actual keys:
```env
# Required
GEMINI_API_KEY=your_actual_gemini_key
GOOGLE_PLACES_API_KEY=your_actual_places_key

# Optional
RAPIDAPI_IRCTC_KEY=your_actual_irctc_key
AMADEUS_API_KEY=your_actual_amadeus_key
AMADEUS_API_SECRET=your_actual_amadeus_secret

# Configuration
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
```

### Frontend Environment File
Create `frontend/client/.env`:
```bash
cp frontend/client/.env.template frontend/client/.env
```

Then edit with your Firebase config:
```env
REACT_APP_FIREBASE_API_KEY=your_actual_firebase_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
```

## 🔒 Security Best Practices

### 1. API Key Restrictions
- **Google APIs**: Restrict by HTTP referrer or IP address
- **Firebase**: Configure authorized domains
- **RapidAPI**: Monitor usage and set limits

### 2. Environment Variables
```bash
# Production deployment
export GEMINI_API_KEY="your_key_here"
export GOOGLE_PLACES_API_KEY="your_key_here"
# ... other keys
```

### 3. Key Rotation
- Rotate keys every 90 days
- Use different keys for development and production
- Monitor for unauthorized usage

### 4. Access Control
- Use service accounts for production
- Implement proper IAM roles
- Log API usage

## 🧪 Testing API Keys

### Test Backend APIs
```bash
cd backend
source venv/bin/activate  # Linux/macOS
# or venv\Scripts\activate  # Windows

python -c "
import os
from dotenv import load_dotenv
load_dotenv()

print('Gemini API Key:', 'SET' if os.getenv('GEMINI_API_KEY') else 'NOT SET')
print('Places API Key:', 'SET' if os.getenv('GOOGLE_PLACES_API_KEY') else 'NOT SET')
print('IRCTC API Key:', 'SET' if os.getenv('RAPIDAPI_IRCTC_KEY') else 'NOT SET')
"
```

### Test Frontend Config
```bash
cd frontend/client
npm start
# Check browser console for Firebase connection
```

## 🐛 Troubleshooting

### Common Issues

1. **"API key not valid" error**
   - Check if key is correctly copied
   - Verify API is enabled in Google Cloud Console
   - Check key restrictions

2. **Firebase connection failed**
   - Verify all Firebase config values
   - Check if authentication methods are enabled
   - Ensure Firestore is created

3. **CORS errors**
   - Add your domain to Firebase authorized domains
   - Check API key restrictions

4. **Rate limiting**
   - Monitor API usage in respective consoles
   - Implement proper error handling
   - Consider upgrading to paid tiers

### Getting Help

1. Check API provider documentation
2. Review error messages in browser console
3. Test with minimal examples
4. Contact API provider support if needed

## 💰 Cost Estimation

### Free Tier Limits
- **Google Gemini**: 60 requests/minute
- **Google Places**: $200 credit/month
- **Firebase**: Generous free tier
- **RapidAPI**: Varies by provider

### Monitoring Usage
- Set up billing alerts
- Monitor usage dashboards
- Implement usage tracking in your app

---

**⚠️ Remember**: Keep your API keys secure and never share them publicly!
