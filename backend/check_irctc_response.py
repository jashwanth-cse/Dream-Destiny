import requests
import json

headers = {
    'X-RapidAPI-Key': 'c4d5f061f5msh00b15bd331eba13p13d8efjsn566b5b49447d',
    'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
}

url = 'https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations'
params = {
    'fromStationCode': 'RPM',
    'toStationCode': 'MAS',
    'dateOfJourney': '2025-08-22'
}

response = requests.get(url, headers=headers, params=params)
data = response.json()

print(f"Status: {response.status_code}")
print(f"Response keys: {list(data.keys())}")

if 'data' in data and len(data['data']) > 0:
    print(f"Number of trains: {len(data['data'])}")
    print("\nFirst train structure:")
    print(json.dumps(data['data'][0], indent=2))
    print(f"\nAvailable fields: {list(data['data'][0].keys())}")
else:
    print("No train data found")
    print(f"Full response: {json.dumps(data, indent=2)}")
