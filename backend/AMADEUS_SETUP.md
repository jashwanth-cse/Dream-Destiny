# Amadeus API Integration Setup

This document explains how to set up and use the Amadeus API integration for real-time travel data.

## 🔑 Getting Amadeus API Credentials

1. **Sign up for Amadeus for Developers**
   - Go to [https://developers.amadeus.com/](https://developers.amadeus.com/)
   - Create a free account
   - Create a new application

2. **Get your API credentials**
   - After creating an application, you'll get:
     - API Key (Client ID)
     - API Secret (Client Secret)

3. **Add credentials to environment file**
   ```bash
   # Edit backend/.env file
   AMADEUS_API_KEY= 6D7pCiF5C2Oid1XuvZzt9e0aIyljr2ie
   AMADEUS_API_SECRET=jAMfGzRWW05qGOsh
   ```

## 🚀 Features Implemented

### Real-time Data Sources:
- ✅ **Flights**: Real-time flight offers with pricing
- ✅ **Hotels**: Hotel availability and pricing
- ✅ **Points of Interest**: Tourist attractions and activities
- ✅ **Travel Restrictions**: COVID-19 and visa information
- ✅ **Trains**: Mock data (Amadeus doesn't cover Indian railways)

### API Endpoints:

#### 1. `/api/travel-data` (POST)
Get comprehensive travel data without itinerary generation.

**Request:**
```json
{
  "source": "Rajapalayam",
  "destination": "Chennai",
  "numberOfPersons": "4",
  "transportMode": "Train",
  "budget": "2500",
  "days": "2",
  "startDate": "2025-08-22",
  "endDate": "2025-08-24",
  "interests": [],
  "foodPreference": "Non-Veg",
  "accessibilityNeeds": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transportOptions": [...],
    "hotels": [...],
    "pointsOfInterest": [...],
    "restrictions": "..."
  },
  "message": "Travel data fetched successfully"
}
```

#### 2. `/api/generate-itinerary-with-amadeus` (POST)
Generate enhanced itinerary using real-time Amadeus data + Gemini AI.

**Request:** Same as above

**Response:**
```json
{
  "success": true,
  "itinerary": "Day 1: ...",
  "travelData": {
    "transportOptions": [...],
    "hotels": [...],
    "pointsOfInterest": [...],
    "restrictions": "..."
  },
  "message": "Enhanced itinerary generated with real-time data"
}
```

## 🧪 Testing the Integration

### 1. Test without starting the server:
```bash
cd backend
python test_amadeus.py
```

### 2. Test with the server:
```bash
# Start the server
cd backend
python main.py

# Test the endpoint
curl -X POST http://localhost:8000/api/travel-data \
  -H "Content-Type: application/json" \
  -d '{
    "source": "Rajapalayam",
    "destination": "Chennai",
    "numberOfPersons": "4",
    "transportMode": "Train",
    "budget": "2500",
    "days": "2",
    "startDate": "2025-08-22",
    "endDate": "2025-08-24",
    "interests": [],
    "foodPreference": "Non-Veg",
    "accessibilityNeeds": []
  }'
```

## 🔄 Frontend Integration

The frontend automatically uses the enhanced Amadeus endpoints:

### TravelBooking.js:
```javascript
// Set useAmadeusData = true to enable real-time data
const useAmadeusData = true;
const endpoint = useAmadeusData 
  ? `${API_BASE_URL}/api/generate-itinerary-with-amadeus`
  : `${API_BASE_URL}/routers/generate-itinerary`;
```

### MultiDestination.js:
```javascript
// Same configuration for multi-destination trips
const useAmadeusData = true;
```

## 📊 Mock Data vs Real Data

### When Mock Data is Used:
- Amadeus API credentials not configured
- API request fails
- Rate limits exceeded
- Network issues

### Mock Data Includes:
- **Trains**: Vaigai Express, Guruvayur Express with realistic timings
- **Hotels**: The Residency Towers with amenities and pricing
- **POIs**: Marina Beach, Fort St. George, Kapaleeshwarar Temple
- **Restrictions**: Standard domestic travel information

### Real Data Includes:
- **Live flight prices** and availability
- **Real hotel rates** and availability
- **Current POI information** with ratings
- **Up-to-date travel restrictions**

## 🛠️ Configuration Options

### Environment Variables:
```bash
# Required for real data
AMADEUS_API_KEY=your_api_key
AMADEUS_API_SECRET=your_api_secret

# Optional
AMADEUS_BASE_URL=https://api.amadeus.com  # Default
ENVIRONMENT=development  # or production
```

### Service Configuration:
```python
# In amadeus_service.py
class AmadeusService:
    def __init__(self):
        self.use_mock_data = False  # Set to True to force mock data
```

## 🔍 Debugging

### Enable Debug Logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check Service Status:
```python
from services.amadeus_service import AmadeusService
amadeus = AmadeusService()
print(f"Using mock data: {amadeus.use_mock_data}")
```

### Common Issues:

1. **"Using mock data" message**
   - Check if API credentials are set correctly
   - Verify credentials are not placeholder values

2. **API request failures**
   - Check internet connection
   - Verify API credentials are valid
   - Check Amadeus API status

3. **Rate limiting**
   - Amadeus free tier has request limits
   - Implement caching for production use

## 🚀 Production Deployment

### Security:
- Never commit API credentials to git
- Use environment variables or secret management
- Implement request rate limiting
- Add API response caching

### Performance:
- Cache Amadeus responses for 15-30 minutes
- Implement retry logic for failed requests
- Use connection pooling for high traffic

### Monitoring:
- Log API usage and costs
- Monitor response times
- Track success/failure rates
- Set up alerts for API issues

## 📈 Next Steps

1. **Get real Amadeus API credentials**
2. **Test with real data**
3. **Implement caching** for better performance
4. **Add error handling** for production
5. **Monitor API usage** and costs
6. **Optimize for your specific use cases**

## 🆘 Support

- **Amadeus Documentation**: https://developers.amadeus.com/self-service
- **API Reference**: https://developers.amadeus.com/self-service/category/air
- **Community**: https://developers.amadeus.com/support

---

**Note**: The integration is designed to gracefully fall back to mock data when real API access is not available, ensuring your application always works.
