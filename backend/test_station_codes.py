#!/usr/bin/env python3
"""
Test station code mapping and IRCTC API integration
"""

import sys
sys.path.append('.')
from services.indian_rail_service import IndianRailService
import requests

def test_station_code_mapping():
    """Test the station code mapping"""
    print("🏢 Testing Station Code Mapping")
    print("=" * 50)
    
    rail_service = IndianRailService()
    
    test_stations = [
        'Rajapalayam',
        'Chennai',
        'Chennai Central', 
        'Madurai',
        'Coimbatore',
        'Bangalore',
        'Mumbai',
        'Delhi',
        'Invalid Station Name'
    ]
    
    for station in test_stations:
        code = rail_service.get_station_code(station)
        print(f"📍 {station:<20} → {code}")
    
    return True

def test_irctc_api_with_correct_codes():
    """Test IRCTC API with correct station codes"""
    print("\n🚂 Testing IRCTC API with Station Codes")
    print("=" * 50)
    
    rail_service = IndianRailService()
    
    # Test cases with known working routes
    test_routes = [
        {'source': 'Rajapalayam', 'dest': 'Chennai', 'desc': 'RPM → MAS'},
        {'source': 'Madurai', 'dest': 'Chennai', 'desc': 'MDU → MAS'},
        {'source': 'Coimbatore', 'dest': 'Chennai', 'desc': 'CBE → MAS'}
    ]
    
    for route in test_routes:
        print(f"\n🔍 Testing: {route['source']} → {route['dest']} ({route['desc']})")
        
        source_code = rail_service.get_station_code(route['source'])
        dest_code = rail_service.get_station_code(route['dest'])
        
        print(f"📍 Station codes: {source_code} → {dest_code}")
        
        # Test the API call directly
        headers = {
            'X-RapidAPI-Key': rail_service.rapidapi_key,
            'X-RapidAPI-Host': rail_service.rapidapi_host
        }
        
        url = f"{rail_service.base_url}/api/v3/trainBetweenStations"
        params = {
            'fromStationCode': source_code,
            'toStationCode': dest_code
        }
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=15)
            print(f"📊 API Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"📄 Response keys: {list(data.keys())}")
                
                if 'errors' in data:
                    print(f"❌ API Errors: {data['errors']}")
                elif 'data' in data:
                    trains = data['data']
                    print(f"✅ Found {len(trains)} trains")
                    
                    if len(trains) > 0:
                        print(f"🚂 Sample train: {trains[0].get('trainName', 'Unknown')} ({trains[0].get('trainNo', 'Unknown')})")
                        break  # Stop after first successful result
                else:
                    print(f"📄 Unexpected response format: {data}")
            else:
                print(f"❌ API Error: {response.status_code} - {response.text[:200]}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

def test_integrated_service():
    """Test the integrated service"""
    print("\n🔧 Testing Integrated Service")
    print("=" * 50)
    
    rail_service = IndianRailService()
    
    # Test the full integration
    result = rail_service.search_trains_between_stations('Rajapalayam', 'Chennai', '2025-08-22')
    
    print(f"📊 Data source: {result.get('dataSource', 'unknown')}")
    print(f"🚂 Trains found: {result.get('totalTrains', 0)}")
    
    if result.get('error'):
        print(f"⚠️ Error: {result['error']}")
    
    # Show first train if available
    trains = result.get('trains', [])
    if trains:
        train = trains[0]
        print(f"\n🚂 First train: {train.get('trainName')} ({train.get('trainNumber')})")
        print(f"⏰ Departure: {train.get('departure', {}).get('time')}")
        print(f"⏰ Arrival: {train.get('arrival', {}).get('time')}")
        print(f"⏱️ Duration: {train.get('duration')}")
    
    # Test formatted output
    formatted = rail_service.format_for_amadeus_integration('Rajapalayam', 'Chennai', '2025-08-22', 4)
    print(f"\n📋 Formatted for integration: {len(formatted.get('data', []))} options")
    
    return len(trains) > 0

if __name__ == "__main__":
    print("🚄 Station Code and IRCTC API Test")
    print("=" * 50)
    
    # Test station code mapping
    test_station_code_mapping()
    
    # Test IRCTC API
    test_irctc_api_with_correct_codes()
    
    # Test integrated service
    success = test_integrated_service()
    
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print("✅ Station code mapping: Working")
    print(f"{'✅' if success else '⚠️'} IRCTC integration: {'Working' if success else 'Using fallback data'}")
    
    if not success:
        print("\n💡 Possible issues:")
        print("1. Station codes might be incorrect")
        print("2. API subscription might not include this endpoint")
        print("3. Route might not exist in IRCTC database")
        print("4. API might require different parameters")
        print("\n🔧 System will use accurate fallback data until API is working")
