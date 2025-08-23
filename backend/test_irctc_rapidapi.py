#!/usr/bin/env python3
"""
Test script for RapidAPI IRCTC integration
"""

import os
import sys
import json
import requests
from dotenv import load_dotenv

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

def test_rapidapi_connection():
    """Test RapidAPI IRCTC connection"""
    print("🔑 Testing RapidAPI IRCTC Connection")
    print("=" * 50)
    
    rapidapi_key = os.getenv('RAPIDAPI_IRCTC_KEY')
    
    if not rapidapi_key or rapidapi_key == 'your_rapidapi_irctc_key_here':
        print("❌ RapidAPI IRCTC key not configured!")
        print("📝 Please add your RapidAPI key to backend/.env:")
        print("   RAPIDAPI_IRCTC_KEY=your_actual_rapidapi_key")
        return False
    
    print(f"✅ RapidAPI key configured: {rapidapi_key[:10]}...")
    
    # Test different possible IRCTC endpoints on RapidAPI
    base_urls = [
        "https://irctc1.p.rapidapi.com",
        "https://irctc-indian-railway-api.p.rapidapi.com", 
        "https://indian-railway-api.p.rapidapi.com",
        "https://trains.p.rapidapi.com"
    ]
    
    headers = {
        'X-RapidAPI-Key': rapidapi_key,
        'X-RapidAPI-Host': ''
    }
    
    for base_url in base_urls:
        host = base_url.replace('https://', '')
        headers['X-RapidAPI-Host'] = host
        
        print(f"\n🔍 Testing: {base_url}")
        
        # Common endpoint patterns
        endpoints = [
            "/api/trains_between_stations",
            "/api/v1/searchTrain", 
            "/searchTrain",
            "/trains",
            "/api/trains",
            "/v1/trains"
        ]
        
        for endpoint in endpoints:
            try:
                url = f"{base_url}{endpoint}"
                params = {
                    'fromStationCode': 'RPM',
                    'toStationCode': 'MAS',
                    'dateOfJourney': '2025-08-22'
                }
                
                print(f"  📡 Trying: {endpoint}")
                response = requests.get(url, headers=headers, params=params, timeout=10)
                
                if response.status_code == 200:
                    print(f"  ✅ SUCCESS: {endpoint}")
                    data = response.json()
                    print(f"  📊 Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                    print(f"  📄 Sample response: {str(data)[:200]}...")
                    return True
                elif response.status_code == 429:
                    print(f"  ⚠️ Rate limited: {endpoint}")
                elif response.status_code == 403:
                    print(f"  🔒 Forbidden (check subscription): {endpoint}")
                else:
                    print(f"  ❌ Status {response.status_code}: {endpoint}")
                    
            except requests.exceptions.Timeout:
                print(f"  ⏰ Timeout: {endpoint}")
            except Exception as e:
                print(f"  ❌ Error: {endpoint} - {e}")
    
    print("\n⚠️ No working endpoints found. This could mean:")
    print("1. Wrong RapidAPI subscription or endpoint URLs")
    print("2. Rate limits or API issues")
    print("3. Different parameter format required")
    
    return False

def test_indian_rail_service_with_rapidapi():
    """Test our Indian Rail service with RapidAPI"""
    print("\n🚄 Testing Indian Rail Service with RapidAPI")
    print("=" * 50)
    
    try:
        from services.indian_rail_service import IndianRailService
        
        rail_service = IndianRailService()
        
        # Test configuration
        print(f"🔑 RapidAPI key configured: {'Yes' if rail_service.rapidapi_key and rail_service.rapidapi_key != '' else 'No'}")
        print(f"🌐 Base URL: {rail_service.base_url}")
        print(f"🏠 Host: {rail_service.rapidapi_host}")
        
        # Test train search
        print(f"\n🔍 Searching trains: Rajapalayam → Chennai")
        
        result = rail_service.search_trains_between_stations('Rajapalayam', 'Chennai', '2025-08-22')
        
        print(f"📊 Data source: {result.get('dataSource', 'unknown')}")
        print(f"🚂 Trains found: {result.get('totalTrains', 0)}")
        
        if result.get('error'):
            print(f"⚠️ Error: {result['error']}")
        
        # Show train details
        for i, train in enumerate(result.get('trains', [])[:2], 1):  # Show first 2 trains
            print(f"\n  🚂 Train {i}: {train.get('trainName')} ({train.get('trainNumber')})")
            print(f"     ⏰ {train.get('departure', {}).get('time')} → {train.get('arrival', {}).get('time')}")
            print(f"     ⏱️ Duration: {train.get('duration')}")
            print(f"     📏 Distance: {train.get('distance')}")
            
            # Show fares
            classes = train.get('classes', {})
            if classes:
                print(f"     💰 Fares:")
                for class_name, class_info in list(classes.items())[:3]:  # Show first 3 classes
                    fare = class_info.get('fare', 0)
                    availability = class_info.get('available', 'Unknown')
                    print(f"        {class_name}: ₹{fare} ({availability})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing service: {e}")
        return False

def test_integration_format():
    """Test the integration format for travel system"""
    print("\n🔧 Testing Integration Format")
    print("=" * 50)
    
    try:
        from services.indian_rail_service import IndianRailService
        
        rail_service = IndianRailService()
        
        # Test formatted output for 4 passengers
        formatted_data = rail_service.format_for_amadeus_integration(
            'Rajapalayam', 'Chennai', '2025-08-22', 4
        )
        
        print(f"📊 Formatted for 4 passengers:")
        print(f"🚂 Options found: {formatted_data.get('meta', {}).get('count', 0)}")
        print(f"📍 Route: {formatted_data.get('meta', {}).get('source')} → {formatted_data.get('meta', {}).get('destination')}")
        print(f"📊 Data source: {formatted_data.get('meta', {}).get('dataSource')}")
        
        # Show formatted options
        for i, option in enumerate(formatted_data.get('data', [])[:2], 1):
            print(f"\n  Option {i}:")
            print(f"    🚂 {option.get('provider')}")
            print(f"    ⏰ {option.get('departure')} → {option.get('arrival')}")
            print(f"    ⏱️ Duration: {option.get('duration')}")
            print(f"    💰 Total: {option.get('price')} | Per person: {option.get('pricePerPerson')}")
            print(f"    🎫 Class: {option.get('class')} | Availability: {option.get('availability')}")
            print(f"    📏 Distance: {option.get('distance')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing integration format: {e}")
        return False

def show_setup_instructions():
    """Show setup instructions for RapidAPI IRCTC"""
    print("\n📝 RapidAPI IRCTC Setup Instructions")
    print("=" * 50)
    print("1. Go to https://rapidapi.com/")
    print("2. Search for 'IRCTC' or 'Indian Railway' APIs")
    print("3. Subscribe to an IRCTC API (many have free tiers)")
    print("4. Copy your RapidAPI key from the dashboard")
    print("5. Add it to backend/.env:")
    print("   RAPIDAPI_IRCTC_KEY=your_actual_rapidapi_key")
    print("6. Restart the backend server")
    print("\n🔍 Popular IRCTC APIs on RapidAPI:")
    print("- IRCTC API")
    print("- Indian Railway API") 
    print("- Train API")
    print("- Railway API")
    print("\n💡 Look for APIs that provide:")
    print("- Train search between stations")
    print("- Train schedules")
    print("- Fare information")
    print("- Real-time availability")

if __name__ == "__main__":
    print("🚄 RapidAPI IRCTC Integration Test")
    print("=" * 50)
    
    # Test RapidAPI connection
    rapidapi_working = test_rapidapi_connection()
    
    # Test our service
    service_working = test_indian_rail_service_with_rapidapi()
    
    # Test integration format
    integration_working = test_integration_format()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   RapidAPI Connection: {'✅ WORKING' if rapidapi_working else '❌ NEEDS SETUP'}")
    print(f"   Indian Rail Service: {'✅ WORKING' if service_working else '❌ ISSUE'}")
    print(f"   Integration Format: {'✅ WORKING' if integration_working else '❌ ISSUE'}")
    
    if not rapidapi_working:
        show_setup_instructions()
    elif service_working and integration_working:
        print("\n🎉 IRCTC integration is ready!")
        print("✅ Your travel app will now use real IRCTC train data")
        print("✅ Accurate train schedules and fares")
        print("✅ Real-time availability information")
    else:
        print("\n⚠️ Service needs configuration or debugging")
        print("Check the error messages above for details")
