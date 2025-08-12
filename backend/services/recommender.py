from backend.services.scraper import scrape_hotels, scrape_restaurants
from backend.services.travel_api import get_flights

def generate_trip_plan(preferences: dict):
    origin = preferences.get("origin", "Delhi")
    destination = preferences.get("destination", "Goa")
    date = preferences.get("travel_date", "2025-08-20")
    flights = get_flights(origin, destination, date)
    hotels = scrape_hotels(destination, date, preferences.get("return_date"))
    restaurants = scrape_restaurants(destination, preferences.get("food_pref") == "veg")
    itinerary = {
        "summary": f"{origin} -> {destination} for {preferences.get('days',3)} days",
        "flights": flights,
        "hotels": hotels,
        "restaurants": restaurants
    }
    return itinerary
