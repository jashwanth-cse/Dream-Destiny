#!/usr/bin/env python3
"""
Test IRCTC API response to understand the format
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_irctc_api_response():
    """Test the actual IRCTC API response"""
    print("🔍 Testing IRCTC API Response")
    print("=" * 50)
    
    rapidapi_key = os.getenv('RAPIDAPI_IRCTC_KEY', 'c4d5f061f5msh00b15bd331eba13p13d8efjsn566b5b49447d')
    
    headers = {
        'X-RapidAPI-Key': rapidapi_key,
        'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
    }
    
    # Test different station codes
    test_cases = [
        {'from': 'RPM', 'to': 'MAS', 'route': 'Rajapalayam → Chennai'},
        {'from': 'BVI', 'to': 'NDLS', 'route': 'Borivali → New Delhi (your working example)'},
        {'from': 'MDU', 'to': 'MAS', 'route': 'Madurai → Chennai'},
        {'from': 'CBE', 'to': 'MAS', 'route': 'Coimbatore → Chennai'}
    ]
    
    for case in test_cases:
        print(f"\n🚂 Testing: {case['route']}")
        print(f"📍 Station codes: {case['from']} → {case['to']}")
        
        url = "https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations"
        params = {
            'fromStationCode': case['from'],
            'toStationCode': case['to']
        }
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=15)
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"📄 Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                print(f"📝 Full response: {json.dumps(data, indent=2)}")
                
                # Check for errors
                if 'errors' in data:
                    print(f"❌ API Errors: {data['errors']}")
                
                # Check for train data
                if 'data' in data:
                    trains = data['data']
                    print(f"✅ Found {len(trains) if isinstance(trains, list) else 0} trains")
                    if isinstance(trains, list) and len(trains) > 0:
                        print(f"🚂 First train sample: {json.dumps(trains[0], indent=2)}")
                
                break  # Stop after first successful response
                
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")
    
    print("\n" + "=" * 50)
    print("💡 Analysis:")
    print("- If you see 'errors' in response, check station codes")
    print("- Station codes might need to be different format")
    print("- API might require different parameters")
    print("- Check RapidAPI documentation for exact format")

def test_station_code_formats():
    """Test different station code formats"""
    print("\n🏢 Testing Station Code Formats")
    print("=" * 50)
    
    # Common station codes for Chennai
    chennai_codes = ['MAS', 'MS', 'CHENNAI', 'CHENNAI CENTRAL', 'CHENNAI EGMORE']
    rajapalayam_codes = ['RPM', 'RAJAPALAYAM', 'RJP']
    
    print("📍 Chennai station codes to try:")
    for code in chennai_codes:
        print(f"   - {code}")
    
    print("\n📍 Rajapalayam station codes to try:")
    for code in rajapalayam_codes:
        print(f"   - {code}")
    
    print("\n💡 Suggestion: Try the working example (BVI → NDLS) first")
    print("   Then experiment with different station codes for your route")

if __name__ == "__main__":
    test_irctc_api_response()
    test_station_code_formats()
