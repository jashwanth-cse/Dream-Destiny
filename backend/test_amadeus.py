#!/usr/bin/env python3
"""
Test script for Amadeus API integration
Run this to test the Amadeus service without starting the full server
"""

import os
import sys
import json
from dotenv import load_dotenv

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

from services.amadeus_service import AmadeusService

def test_amadeus_service():
    """Test the Amadeus service with sample data"""
    print("🧪 Testing Amadeus Service Integration")
    print("=" * 50)
    
    # Initialize service
    amadeus = AmadeusService()
    
    # Test data (same as user's request)
    test_data = {
        'source': 'Rajapalayam',
        'destination': 'Chennai',
        'start_date': '2025-08-22',
        'end_date': '2025-08-24',
        'transport_mode': 'Train',
        'num_persons': 4,
        'interests': []
    }
    
    print(f"📍 Testing route: {test_data['source']} → {test_data['destination']}")
    print(f"📅 Dates: {test_data['start_date']} to {test_data['end_date']}")
    print(f"👥 Travelers: {test_data['num_persons']} persons")
    print(f"🚄 Transport: {test_data['transport_mode']}")
    print()
    
    # Test comprehensive travel data
    print("🔍 Fetching comprehensive travel data...")
    try:
        travel_data = amadeus.get_comprehensive_travel_data(
            source=test_data['source'],
            destination=test_data['destination'],
            start_date=test_data['start_date'],
            end_date=test_data['end_date'],
            transport_mode=test_data['transport_mode'],
            num_persons=test_data['num_persons'],
            interests=test_data['interests']
        )
        
        print("✅ Travel data fetched successfully!")
        print()
        
        # Display results
        print("🚄 TRANSPORT OPTIONS:")
        for i, option in enumerate(travel_data.get('transportOptions', []), 1):
            print(f"  {i}. {option.get('provider', 'N/A')}")
            print(f"     Departure: {option.get('departure', 'N/A')}")
            print(f"     Arrival: {option.get('arrival', 'N/A')}")
            print(f"     Duration: {option.get('duration', 'N/A')}")
            print(f"     Price: {option.get('price', 'N/A')}")
            print()
        
        print("🏨 HOTEL OPTIONS:")
        for i, hotel in enumerate(travel_data.get('hotels', []), 1):
            print(f"  {i}. {hotel.get('name', 'N/A')}")
            print(f"     Location: {hotel.get('location', 'N/A')}")
            print(f"     Rating: {hotel.get('rating', 'N/A')}/5")
            print(f"     Price: {hotel.get('price', 'N/A')}")
            print()
        
        print("📍 POINTS OF INTEREST:")
        for i, poi in enumerate(travel_data.get('pointsOfInterest', []), 1):
            print(f"  {i}. {poi.get('name', 'N/A')} ({poi.get('type', 'N/A')})")
            tags = poi.get('tags', [])
            if tags:
                print(f"     Tags: {', '.join(tags[:3])}")
            print()
        
        print("🛡️ TRAVEL RESTRICTIONS:")
        print(f"  {travel_data.get('restrictions', 'No restrictions found')}")
        print()
        
        # Test individual services
        print("🧪 Testing individual services...")
        print()
        
        # Test train search
        print("🚄 Testing train search...")
        train_data = amadeus.search_trains(
            test_data['source'], 
            test_data['destination'], 
            test_data['start_date'], 
            test_data['num_persons']
        )
        print(f"   Found {len(train_data.get('data', []))} train options")
        
        # Test hotel search
        print("🏨 Testing hotel search...")
        hotel_data = amadeus.search_hotels(
            test_data['destination'], 
            test_data['start_date'], 
            test_data['end_date'], 
            test_data['num_persons']
        )
        print(f"   Found {len(hotel_data.get('data', []))} hotel options")
        
        # Test POI search
        print("📍 Testing POI search...")
        dest_coords = amadeus._get_city_coordinates(test_data['destination'])
        if dest_coords:
            poi_data = amadeus.search_points_of_interest(
                dest_coords['lat'], 
                dest_coords['lng']
            )
            print(f"   Found {len(poi_data.get('data', []))} points of interest")
        
        print()
        print("✅ All tests completed successfully!")
        print()
        
        # Check if using mock data
        if amadeus.use_mock_data:
            print("ℹ️  Note: Using mock data (Amadeus API credentials not configured)")
            print("   To use real data, set AMADEUS_API_KEY and AMADEUS_API_SECRET in .env file")
        else:
            print("🌐 Using real Amadeus API data")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False

def test_api_credentials():
    """Test if API credentials are configured"""
    print("🔑 Checking API credentials...")
    
    amadeus_key = os.getenv('AMADEUS_API_KEY')
    amadeus_secret = os.getenv('AMADEUS_API_SECRET')
    
    if amadeus_key and amadeus_key != 'your_amadeus_api_key_here':
        print("✅ Amadeus API Key: Configured")
    else:
        print("⚠️  Amadeus API Key: Not configured (will use mock data)")
    
    if amadeus_secret and amadeus_secret != 'your_amadeus_api_secret_here':
        print("✅ Amadeus API Secret: Configured")
    else:
        print("⚠️  Amadeus API Secret: Not configured (will use mock data)")
    
    print()

if __name__ == "__main__":
    print("🚀 Amadeus API Integration Test")
    print("=" * 50)
    print()
    
    # Test credentials
    test_api_credentials()
    
    # Test service
    success = test_amadeus_service()
    
    if success:
        print("🎉 All tests passed! Amadeus integration is working.")
    else:
        print("💥 Tests failed. Check the error messages above.")
    
    print()
    print("📝 Next steps:")
    print("1. Add your real Amadeus API credentials to backend/.env")
    print("2. Start the backend server: python backend/main.py")
    print("3. Test the endpoints:")
    print("   - POST /api/travel-data")
    print("   - POST /api/generate-itinerary-with-amadeus")
    print("4. Frontend will automatically use enhanced itinerary generation")
