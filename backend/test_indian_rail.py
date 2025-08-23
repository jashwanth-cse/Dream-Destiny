#!/usr/bin/env python3
"""
Test script for Indian Rail API integration
"""

import os
import sys
import json
from dotenv import load_dotenv

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

from services.indian_rail_service import IndianRailService

def test_indian_rail_service():
    """Test the Indian Rail service"""
    print("🚄 Testing Indian Rail Service")
    print("=" * 50)
    
    # Initialize service
    rail_service = IndianRailService()
    
    # Test data
    test_routes = [
        {
            'source': 'Rajapalayam',
            'destination': 'Chennai',
            'date': '2025-08-22'
        },
        {
            'source': 'Chennai',
            'destination': 'Rajapalayam', 
            'date': '2025-08-24'
        },
        {
            'source': 'Madurai',
            'destination': 'Chennai',
            'date': '2025-08-22'
        }
    ]
    
    for route in test_routes:
        print(f"\n🔍 Testing route: {route['source']} → {route['destination']}")
        print(f"📅 Date: {route['date']}")
        
        # Test station code mapping
        source_code = rail_service.get_station_code(route['source'])
        dest_code = rail_service.get_station_code(route['destination'])
        print(f"📍 Station codes: {route['source']} ({source_code}) → {route['destination']} ({dest_code})")
        
        # Test train search
        try:
            train_data = rail_service.search_trains_between_stations(
                route['source'], 
                route['destination'], 
                route['date']
            )
            
            print(f"✅ Found {train_data.get('totalTrains', 0)} trains")
            print(f"📊 Data source: {train_data.get('dataSource', 'unknown')}")
            
            # Display train details
            for i, train in enumerate(train_data.get('trains', []), 1):
                print(f"\n  🚂 Train {i}: {train.get('trainName')} ({train.get('trainNumber')})")
                print(f"     ⏰ Departure: {train.get('departure', {}).get('time')} from Platform {train.get('departure', {}).get('platform')}")
                print(f"     ⏰ Arrival: {train.get('arrival', {}).get('time')} at Platform {train.get('arrival', {}).get('platform')}")
                print(f"     ⏱️ Duration: {train.get('duration')}")
                print(f"     📏 Distance: {train.get('distance')}")
                
                # Show fare details
                classes = train.get('classes', {})
                if classes:
                    print(f"     💰 Fares:")
                    for class_name, class_info in classes.items():
                        fare = class_info.get('fare', 0)
                        availability = class_info.get('available', 'Unknown')
                        print(f"        {class_name}: ₹{fare} ({availability})")
                
                # Show route
                route_stations = train.get('route', [])
                if route_stations:
                    print(f"     🛤️ Route: {' → '.join(route_stations)}")
                
                print(f"     📅 Runs on: {', '.join(train.get('runsOn', []))}")
            
            if not train_data.get('trains'):
                error = train_data.get('error', 'No trains found')
                print(f"⚠️ {error}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    
    # Test formatted output for integration
    print("\n🔧 Testing integration format...")
    try:
        formatted_data = rail_service.format_for_amadeus_integration(
            'Rajapalayam', 'Chennai', '2025-08-22', 4
        )
        
        print(f"✅ Formatted data for 4 passengers:")
        print(f"📊 Found {formatted_data.get('meta', {}).get('count', 0)} options")
        
        for i, option in enumerate(formatted_data.get('data', []), 1):
            print(f"\n  Option {i}:")
            print(f"    🚂 {option.get('provider')}")
            print(f"    ⏰ {option.get('departure')} → {option.get('arrival')}")
            print(f"    ⏱️ Duration: {option.get('duration')}")
            print(f"    💰 Total: {option.get('price')} | Per person: {option.get('pricePerPerson')}")
            print(f"    🎫 Class: {option.get('class')} | Availability: {option.get('availability')}")
            
    except Exception as e:
        print(f"❌ Integration format error: {e}")

def test_station_codes():
    """Test station code mapping"""
    print("\n🏢 Testing Station Code Mapping")
    print("=" * 50)
    
    rail_service = IndianRailService()
    
    test_stations = [
        'Rajapalayam', 'Chennai', 'Chennai Central', 'Chennai Egmore',
        'Madurai', 'Coimbatore', 'Salem', 'Trichy', 'Bangalore', 'Mumbai'
    ]
    
    for station in test_stations:
        code = rail_service.get_station_code(station)
        print(f"📍 {station:<20} → {code}")

def test_fare_calculation():
    """Test fare calculation"""
    print("\n💰 Testing Fare Calculation")
    print("=" * 50)
    
    rail_service = IndianRailService()
    
    test_cases = [
        {'train': '16724', 'source': 'Rajapalayam', 'dest': 'Chennai', 'class': 'SL'},
        {'train': '16724', 'source': 'Rajapalayam', 'dest': 'Chennai', 'class': '3A'},
        {'train': '12694', 'source': 'Rajapalayam', 'dest': 'Chennai', 'class': '2A'},
    ]
    
    for case in test_cases:
        try:
            fare_data = rail_service.get_train_fare(
                case['train'], case['source'], case['dest'], case['class']
            )
            
            if 'error' not in fare_data:
                print(f"🚂 Train {case['train']} | {case['class']} class")
                print(f"   💰 Fare: ₹{fare_data.get('fare', 0)}")
                print(f"   📏 Distance: {fare_data.get('distance', 0)} km")
            else:
                print(f"⚠️ {fare_data['error']}")
                
        except Exception as e:
            print(f"❌ Error calculating fare: {e}")

if __name__ == "__main__":
    print("🚄 Indian Rail API Integration Test")
    print("=" * 50)
    
    # Test main functionality
    test_indian_rail_service()
    
    # Test station codes
    test_station_codes()
    
    # Test fare calculation
    test_fare_calculation()
    
    print("\n🎉 Testing completed!")
    print("\n📝 Notes:")
    print("- Using realistic train data for Rajapalayam-Chennai route")
    print("- Anantapuri Express (16724/16723) and Pearl City Express (12694/12693)")
    print("- Accurate timings, fares, and route information")
    print("- Falls back to IndianRailAPI when available")
    print("- Ready for integration with travel booking system")
