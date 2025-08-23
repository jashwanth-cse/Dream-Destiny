#!/usr/bin/env python3
"""
Quick test for train data
"""

import sys
sys.path.append('.')
from services.indian_rail_service import IndianRailService

def test_train_data():
    print("Testing Train Data for Rajapalayam to Chennai")
    print("=" * 50)
    
    rail = IndianRailService()
    result = rail.format_for_amadeus_integration('Rajapalayam', 'Chennai', '2025-08-22', 4)
    
    print(f"Found {len(result['data'])} trains")
    print(f"Data source: {result['meta']['dataSource']}")
    print()
    
    for i, train in enumerate(result['data'], 1):
        print(f"{i}. {train['provider']}")
        print(f"   Departure: {train['departure']}")
        print(f"   Arrival: {train['arrival']}")
        print(f"   Duration: {train['duration']}")
        print(f"   Distance: {train['distance']}")
        print(f"   Price: {train['price']} ({train['pricePerPerson']})")
        print(f"   Class: {train['class']}")
        print(f"   Availability: {train['availability']}")
        print()

if __name__ == "__main__":
    test_train_data()
