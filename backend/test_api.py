#!/usr/bin/env python3
"""
Test script for the API endpoints
"""

import requests
import json

def test_travel_data_endpoint():
    """Test the /api/travel-data endpoint"""
    print("🧪 Testing /api/travel-data endpoint...")
    
    url = "http://localhost:8000/api/travel-data"
    data = {
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
    
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        result = response.json()
        print("✅ Travel data endpoint working!")
        print(f"📊 Response: {json.dumps(result, indent=2)}")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_enhanced_itinerary_endpoint():
    """Test the /api/generate-itinerary-with-amadeus endpoint"""
    print("\n🧪 Testing /api/generate-itinerary-with-amadeus endpoint...")
    
    url = "http://localhost:8000/api/generate-itinerary-with-amadeus"
    data = {
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
    
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        result = response.json()
        print("✅ Enhanced itinerary endpoint working!")
        print(f"📊 Success: {result.get('success')}")
        print(f"📝 Message: {result.get('message')}")
        if result.get('itinerary'):
            print(f"📋 Itinerary preview: {result['itinerary'][:200]}...")
        return True
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error: {e}")
        if e.response:
            print(f"📄 Response: {e.response.text}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing API Endpoints")
    print("=" * 50)
    
    # Test travel data endpoint
    travel_data_success = test_travel_data_endpoint()
    
    # Test enhanced itinerary endpoint
    enhanced_itinerary_success = test_enhanced_itinerary_endpoint()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Travel Data API: {'✅ PASS' if travel_data_success else '❌ FAIL'}")
    print(f"   Enhanced Itinerary API: {'✅ PASS' if enhanced_itinerary_success else '❌ FAIL'}")
    
    if travel_data_success and enhanced_itinerary_success:
        print("\n🎉 All tests passed! Your Amadeus integration is working perfectly!")
    elif travel_data_success:
        print("\n⚠️  Travel data is working, but enhanced itinerary may have issues (likely Gemini API)")
    else:
        print("\n💥 Tests failed. Check the server logs for more details.")
