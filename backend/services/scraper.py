def scrape_hotels(destination: str, check_in: str=None, check_out: str=None):
    # Stubbed sample results; replace with real scraping logic
    return [
        {"name": "Hotel Paradise", "price": 2500, "rating": 4.5, "type": "Deluxe AC"},
        {"name": "Green Valley Inn", "price": 1800, "rating": 4.0, "type": "Standard Non-AC"}
    ]

def scrape_restaurants(destination: str, veg_only: bool=False):
    return [
        {"name": "Tandoori Treats", "speciality": "North Indian", "veg_friendly": True},
        {"name": "Sea Breeze", "speciality": "Seafood", "veg_friendly": False}
    ]
