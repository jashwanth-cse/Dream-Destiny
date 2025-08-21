import os
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AmadeusService:
    def __init__(self):
        self.api_key = os.getenv('AMADEUS_API_KEY')
        self.api_secret = os.getenv('AMADEUS_API_SECRET')
        self.base_url = os.getenv('AMADEUS_BASE_URL', 'https://api.amadeus.com')
        self.access_token = None
        self.token_expires_at = None
        
        if not self.api_key or not self.api_secret:
            logger.warning("Amadeus API credentials not found. Using mock data.")
            self.use_mock_data = True
        else:
            self.use_mock_data = False
    
    def get_access_token(self) -> str:
        """Get or refresh Amadeus API access token"""
        if self.use_mock_data:
            return "mock_token"
            
        # Check if token is still valid
        if self.access_token and self.token_expires_at and datetime.now() < self.token_expires_at:
            return self.access_token
        
        # Get new token
        url = f"{self.base_url}/v1/security/oauth2/token"
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        data = {
            'grant_type': 'client_credentials',
            'client_id': self.api_key,
            'client_secret': self.api_secret
        }
        
        try:
            response = requests.post(url, headers=headers, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data['access_token']
            expires_in = token_data.get('expires_in', 3600)  # Default 1 hour
            self.token_expires_at = datetime.now() + timedelta(seconds=expires_in - 60)  # Refresh 1 min early
            
            logger.info("Successfully obtained Amadeus access token")
            return self.access_token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get Amadeus access token: {e}")
            self.use_mock_data = True
            return "mock_token"
    
    def make_api_request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make authenticated request to Amadeus API"""
        if self.use_mock_data:
            return self._get_mock_response(endpoint, params)
        
        token = self.get_access_token()
        if token == "mock_token":
            return self._get_mock_response(endpoint, params)
        
        url = f"{self.base_url}{endpoint}"
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Amadeus API request failed: {e}")
            return self._get_mock_response(endpoint, params)
    
    def _get_mock_response(self, endpoint: str, params: Dict = None) -> Dict:
        """Return mock data when API is not available"""
        logger.info(f"Using mock data for endpoint: {endpoint}")
        
        if 'flight-offers' in endpoint:
            return self._mock_flight_data(params)
        elif 'hotel-offers' in endpoint:
            return self._mock_hotel_data(params)
        elif 'points-of-interest' in endpoint:
            return self._mock_poi_data(params)
        elif 'rail-station' in endpoint or 'train' in endpoint:
            return self._mock_train_data(params)
        else:
            return {"data": [], "meta": {"count": 0}}
    
    def _mock_flight_data(self, params: Dict = None) -> Dict:
        """Mock flight data"""
        return {
            "data": [
                {
                    "type": "flight-offer",
                    "id": "1",
                    "source": "GDS",
                    "instantTicketingRequired": False,
                    "nonHomogeneous": False,
                    "oneWay": False,
                    "lastTicketingDate": "2025-08-22",
                    "numberOfBookableSeats": 9,
                    "itineraries": [
                        {
                            "duration": "PT6H15M",
                            "segments": [
                                {
                                    "departure": {
                                        "iataCode": "TUV",
                                        "terminal": "1",
                                        "at": "2025-08-22T08:30:00"
                                    },
                                    "arrival": {
                                        "iataCode": "MAA",
                                        "terminal": "1",
                                        "at": "2025-08-22T14:45:00"
                                    },
                                    "carrierCode": "AI",
                                    "number": "542",
                                    "aircraft": {
                                        "code": "320"
                                    },
                                    "operating": {
                                        "carrierCode": "AI"
                                    },
                                    "duration": "PT6H15M",
                                    "id": "1",
                                    "numberOfStops": 0,
                                    "blacklistedInEU": False
                                }
                            ]
                        }
                    ],
                    "price": {
                        "currency": "INR",
                        "total": "3400.00",
                        "base": "2800.00",
                        "fees": [
                            {
                                "amount": "600.00",
                                "type": "SUPPLIER"
                            }
                        ],
                        "grandTotal": "3400.00"
                    }
                }
            ],
            "meta": {
                "count": 1,
                "links": {
                    "self": "https://test.api.amadeus.com/v2/shopping/flight-offers"
                }
            }
        }
    
    def _mock_train_data(self, params: Dict = None) -> Dict:
        """Mock train data"""
        return {
            "data": [
                {
                    "type": "train-offer",
                    "id": "train_1",
                    "trainNumber": "12635",
                    "trainName": "Vaigai Express",
                    "departure": {
                        "station": "Rajapalayam",
                        "time": "2025-08-22T08:30:00",
                        "platform": "1"
                    },
                    "arrival": {
                        "station": "Chennai Central",
                        "time": "2025-08-22T14:45:00",
                        "platform": "3"
                    },
                    "duration": "6h 15m",
                    "class": "Sleeper",
                    "price": {
                        "currency": "INR",
                        "total": "850.00",
                        "perPerson": "212.50"
                    },
                    "availability": "Available"
                },
                {
                    "type": "train-offer",
                    "id": "train_2",
                    "trainNumber": "16128",
                    "trainName": "Guruvayur Express",
                    "departure": {
                        "station": "Rajapalayam",
                        "time": "2025-08-22T15:20:00",
                        "platform": "2"
                    },
                    "arrival": {
                        "station": "Chennai Central",
                        "time": "2025-08-22T22:10:00",
                        "platform": "5"
                    },
                    "duration": "6h 50m",
                    "class": "3AC",
                    "price": {
                        "currency": "INR",
                        "total": "1200.00",
                        "perPerson": "300.00"
                    },
                    "availability": "Available"
                }
            ],
            "meta": {
                "count": 2
            }
        }
    
    def _mock_hotel_data(self, params: Dict = None) -> Dict:
        """Mock hotel data"""
        return {
            "data": [
                {
                    "type": "hotel-offers",
                    "hotel": {
                        "type": "hotel",
                        "hotelId": "ADCHENNAI",
                        "chainCode": "AD",
                        "dupeId": "700027640",
                        "name": "The Residency Towers",
                        "rating": "4",
                        "cityCode": "MAA",
                        "latitude": 13.0827,
                        "longitude": 80.2707,
                        "address": {
                            "lines": ["T. Nagar"],
                            "postalCode": "600017",
                            "cityName": "CHENNAI",
                            "countryCode": "IN"
                        },
                        "contact": {
                            "phone": "+91-44-28154444"
                        },
                        "description": {
                            "lang": "en",
                            "text": "Located in the heart of Chennai's shopping district"
                        },
                        "amenities": [
                            "SWIMMING_POOL",
                            "SPA",
                            "FITNESS_CENTER",
                            "RESTAURANT",
                            "ROOM_SERVICE",
                            "WIFI",
                            "PARKING"
                        ]
                    },
                    "available": True,
                    "offers": [
                        {
                            "id": "offer_1",
                            "checkInDate": "2025-08-22",
                            "checkOutDate": "2025-08-24",
                            "rateCode": "RAC",
                            "rateFamilyEstimated": {
                                "code": "SRS",
                                "type": "P"
                            },
                            "room": {
                                "type": "A1K",
                                "typeEstimated": {
                                    "category": "SUPERIOR_ROOM",
                                    "beds": 1,
                                    "bedType": "KING"
                                },
                                "description": {
                                    "text": "Superior King Room",
                                    "lang": "en"
                                }
                            },
                            "guests": {
                                "adults": 4
                            },
                            "price": {
                                "currency": "INR",
                                "base": "2200.00",
                                "total": "2596.00",
                                "taxes": [
                                    {
                                        "amount": "396.00",
                                        "code": "TOTAL_TAX",
                                        "percentage": "18.00",
                                        "included": True,
                                        "description": "TOTAL TAX",
                                        "pricingFrequency": "PER_NIGHT",
                                        "pricingMode": "PER_PRODUCT"
                                    }
                                ]
                            },
                            "policies": {
                                "paymentType": "guarantee",
                                "cancellation": {
                                    "deadline": "2025-08-21T18:00:00.000+05:30"
                                }
                            }
                        }
                    ]
                }
            ],
            "meta": {
                "count": 1
            }
        }
    
    def _mock_poi_data(self, params: Dict = None) -> Dict:
        """Mock points of interest data"""
        return {
            "data": [
                {
                    "type": "location",
                    "subType": "POINT_OF_INTEREST",
                    "id": "poi_1",
                    "self": {
                        "href": "https://test.api.amadeus.com/v1/reference-data/locations/poi_1",
                        "methods": ["GET"]
                    },
                    "name": "Marina Beach",
                    "category": "BEACH",
                    "rank": "5",
                    "tags": ["beach", "relaxation", "sunset", "walking"],
                    "geoCode": {
                        "latitude": 13.0475,
                        "longitude": 80.2824
                    },
                    "address": {
                        "cityName": "Chennai",
                        "countryCode": "IN"
                    }
                },
                {
                    "type": "location",
                    "subType": "POINT_OF_INTEREST",
                    "id": "poi_2",
                    "name": "Fort St. George",
                    "category": "HISTORICAL_SITE",
                    "rank": "4",
                    "tags": ["history", "culture", "museum", "colonial"],
                    "geoCode": {
                        "latitude": 13.0836,
                        "longitude": 80.2889
                    },
                    "address": {
                        "cityName": "Chennai",
                        "countryCode": "IN"
                    }
                },
                {
                    "type": "location",
                    "subType": "POINT_OF_INTEREST",
                    "id": "poi_3",
                    "name": "Kapaleeshwarar Temple",
                    "category": "RELIGIOUS_SITE",
                    "rank": "5",
                    "tags": ["temple", "culture", "spiritual", "architecture"],
                    "geoCode": {
                        "latitude": 13.0339,
                        "longitude": 80.2619
                    },
                    "address": {
                        "cityName": "Chennai",
                        "countryCode": "IN"
                    }
                }
            ],
            "meta": {
                "count": 3
            }
        }

    def search_flights(self, origin: str, destination: str, departure_date: str,
                      return_date: str = None, adults: int = 1) -> Dict:
        """Search for flight offers"""
        params = {
            'originLocationCode': self._get_airport_code(origin),
            'destinationLocationCode': self._get_airport_code(destination),
            'departureDate': departure_date,
            'adults': adults,
            'max': 10
        }

        if return_date:
            params['returnDate'] = return_date

        return self.make_api_request('/v2/shopping/flight-offers', params)

    def search_trains(self, origin: str, destination: str, departure_date: str,
                     passengers: int = 1) -> Dict:
        """Search for train options (using mock data as Amadeus doesn't have Indian trains)"""
        params = {
            'origin': origin,
            'destination': destination,
            'departureDate': departure_date,
            'passengers': passengers
        }

        # Always use mock data for trains as Amadeus doesn't cover Indian railways
        return self._mock_train_data(params)

    def search_hotels(self, city_code: str, check_in: str, check_out: str,
                     adults: int = 1, rooms: int = 1) -> Dict:
        """Search for hotel offers"""
        params = {
            'cityCode': self._get_city_code(city_code),
            'checkInDate': check_in,
            'checkOutDate': check_out,
            'adults': adults,
            'rooms': rooms,
            'max': 10
        }

        return self.make_api_request('/v3/shopping/hotel-offers', params)

    def search_points_of_interest(self, latitude: float, longitude: float,
                                 radius: int = 5, categories: List[str] = None) -> Dict:
        """Search for points of interest"""
        params = {
            'latitude': latitude,
            'longitude': longitude,
            'radius': radius,
            'radiusUnit': 'KM'
        }

        if categories:
            params['categories'] = ','.join(categories)

        return self.make_api_request('/v1/reference-data/locations/pois', params)

    def get_travel_restrictions(self, origin_country: str, destination_country: str) -> Dict:
        """Get travel restrictions (mock for domestic travel)"""
        if origin_country == destination_country == 'IN':
            return {
                "data": {
                    "type": "travel-restrictions",
                    "restrictions": "No COVID-19 or visa restrictions for domestic travel within India in 2025.",
                    "requirements": [],
                    "lastUpdated": "2025-08-21"
                }
            }

        # For international travel, would use real API
        return self.make_api_request('/v1/duty-of-care/diseases/covid19-area-report', {
            'countryCode': destination_country
        })

    def _get_airport_code(self, city: str) -> str:
        """Get IATA airport code for city"""
        airport_codes = {
            'chennai': 'MAA',
            'mumbai': 'BOM',
            'delhi': 'DEL',
            'bangalore': 'BLR',
            'hyderabad': 'HYD',
            'kolkata': 'CCU',
            'pune': 'PNQ',
            'ahmedabad': 'AMD',
            'kochi': 'COK',
            'goa': 'GOI',
            'rajapalayam': 'TUV'  # Nearest airport (Tuticorin)
        }
        return airport_codes.get(city.lower(), 'MAA')  # Default to Chennai

    def _get_city_code(self, city: str) -> str:
        """Get city code for hotels"""
        city_codes = {
            'chennai': 'MAA',
            'mumbai': 'BOM',
            'delhi': 'DEL',
            'bangalore': 'BLR',
            'hyderabad': 'HYD',
            'kolkata': 'CCU',
            'pune': 'PNQ',
            'ahmedabad': 'AMD',
            'kochi': 'COK',
            'goa': 'GOI',
            'rajapalayam': 'MAA'  # Use Chennai for nearby hotels
        }
        return city_codes.get(city.lower(), 'MAA')

    def get_comprehensive_travel_data(self, source: str, destination: str,
                                    start_date: str, end_date: str,
                                    transport_mode: str, num_persons: int,
                                    interests: List[str] = None) -> Dict:
        """Get all travel data in one call"""
        result = {
            "transportOptions": [],
            "hotels": [],
            "pointsOfInterest": [],
            "restrictions": ""
        }

        try:
            # Get transport options based on mode
            if transport_mode.lower() == 'flight':
                transport_data = self.search_flights(
                    source, destination, start_date, end_date, num_persons
                )
                result["transportOptions"] = self._format_flight_options(transport_data)
            elif transport_mode.lower() == 'train':
                transport_data = self.search_trains(
                    source, destination, start_date, num_persons
                )
                result["transportOptions"] = self._format_train_options(transport_data)
            else:
                # For bus/car, use train data as fallback
                transport_data = self.search_trains(
                    source, destination, start_date, num_persons
                )
                result["transportOptions"] = self._format_train_options(transport_data)

            # Get hotels
            hotel_data = self.search_hotels(
                destination, start_date, end_date, num_persons, 1
            )
            result["hotels"] = self._format_hotel_options(hotel_data)

            # Get points of interest
            dest_coords = self._get_city_coordinates(destination)
            if dest_coords:
                poi_data = self.search_points_of_interest(
                    dest_coords['lat'], dest_coords['lng'], 10, interests
                )
                result["pointsOfInterest"] = self._format_poi_options(poi_data)

            # Get travel restrictions
            restrictions_data = self.get_travel_restrictions('IN', 'IN')
            result["restrictions"] = restrictions_data.get("data", {}).get("restrictions", "No restrictions found.")

        except Exception as e:
            logger.error(f"Error getting comprehensive travel data: {e}")
            result["error"] = str(e)

        return result

    def _format_flight_options(self, data: Dict) -> List[Dict]:
        """Format flight data for frontend"""
        options = []
        for offer in data.get("data", []):
            for itinerary in offer.get("itineraries", []):
                for segment in itinerary.get("segments", []):
                    options.append({
                        "mode": "Flight",
                        "provider": f"{segment.get('carrierCode', 'AI')} {segment.get('number', '')}",
                        "departure": segment.get("departure", {}).get("at", ""),
                        "arrival": segment.get("arrival", {}).get("at", ""),
                        "duration": itinerary.get("duration", ""),
                        "price": f"₹{offer.get('price', {}).get('total', '0')} total",
                        "pricePerPerson": f"₹{float(offer.get('price', {}).get('total', '0')) / 4:.0f} per person"
                    })
        return options

    def _format_train_options(self, data: Dict) -> List[Dict]:
        """Format train data for frontend"""
        options = []
        for train in data.get("data", []):
            options.append({
                "mode": "Train",
                "provider": f"{train.get('trainName', '')} ({train.get('trainNumber', '')})",
                "departure": train.get("departure", {}).get("time", ""),
                "arrival": train.get("arrival", {}).get("time", ""),
                "duration": train.get("duration", ""),
                "price": f"₹{train.get('price', {}).get('total', '0')} total",
                "pricePerPerson": f"₹{train.get('price', {}).get('perPerson', '0')} per person",
                "class": train.get("class", ""),
                "availability": train.get("availability", "")
            })
        return options

    def _format_hotel_options(self, data: Dict) -> List[Dict]:
        """Format hotel data for frontend"""
        options = []
        for hotel_offer in data.get("data", []):
            hotel = hotel_offer.get("hotel", {})
            offers = hotel_offer.get("offers", [])

            if offers:
                offer = offers[0]  # Take first offer
                options.append({
                    "name": hotel.get("name", ""),
                    "location": hotel.get("address", {}).get("lines", [""])[0],
                    "rating": float(hotel.get("rating", "0")),
                    "price": f"₹{offer.get('price', {}).get('total', '0')}/night",
                    "amenities": hotel.get("amenities", []),
                    "description": hotel.get("description", {}).get("text", ""),
                    "contact": hotel.get("contact", {}).get("phone", "")
                })
        return options

    def _format_poi_options(self, data: Dict) -> List[Dict]:
        """Format points of interest data for frontend"""
        options = []
        for poi in data.get("data", []):
            options.append({
                "name": poi.get("name", ""),
                "type": poi.get("category", "").replace("_", " ").title(),
                "tags": poi.get("tags", []),
                "rank": poi.get("rank", "0"),
                "coordinates": poi.get("geoCode", {}),
                "address": poi.get("address", {}).get("cityName", "")
            })
        return options

    def _get_city_coordinates(self, city: str) -> Dict:
        """Get coordinates for city"""
        coordinates = {
            'chennai': {'lat': 13.0827, 'lng': 80.2707},
            'mumbai': {'lat': 19.0760, 'lng': 72.8777},
            'delhi': {'lat': 28.7041, 'lng': 77.1025},
            'bangalore': {'lat': 12.9716, 'lng': 77.5946},
            'hyderabad': {'lat': 17.3850, 'lng': 78.4867},
            'kolkata': {'lat': 22.5726, 'lng': 88.3639},
            'rajapalayam': {'lat': 9.4500, 'lng': 77.5500}
        }
        return coordinates.get(city.lower())
