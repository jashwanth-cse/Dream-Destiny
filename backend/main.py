from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from services.amadeus_service import AmadeusService
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

load_dotenv()

app = FastAPI()
api = APIRouter(prefix="/api")
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production with ngrok
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Amadeus service
amadeus_service = AmadeusService()

# ✅ Store your API keys securely
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# Google Places API configuration
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")  # Use same key or different one
GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=paris&key=GOOGLE_PLACES_API_KEY"

# Schema for incoming request
class TripRequest(BaseModel):
    source: str
    destination: str = None  # Optional for multi-destination trips
    destinations: list[str] = None  # For multi-destination trips
    numberOfPersons: str
    transportMode: str
    budget: str  # Changed to str to handle frontend input
    days: str = None    # Changed to str to handle frontend input
    totalDays: str = None  # For multi-destination trips
    startDate: str
    endDate: str
    interests: list[str] = []
    foodPreference: str
    accessibilityNeeds: list[str] = []
    journeyType: str = "single"  # "single" or "multi"

@app.post("/routers/generate-itinerary")
def generate_itinerary(trip: TripRequest):
    try:
        print(f"Received trip data: {trip}")  # Debug logging

        # Convert string values to integers where needed
        days = int(trip.days) if trip.days else 3
        budget = int(trip.budget) if trip.budget else 5000

        prompt = f"""
        Create a detailed {days}-day travel itinerary from {trip.source} to {trip.destination}.
        Number of travelers: {trip.numberOfPersons} person(s).
        Mode of transport: {trip.transportMode}.
        Budget: ₹{budget} INR (total for {trip.numberOfPersons} person(s)).
        Dates: {trip.startDate} to {trip.endDate}.
        Interests: {', '.join(trip.interests) if trip.interests else 'general sightseeing'}.
        Food preference: {trip.foodPreference}.
        Accessibility needs: {', '.join(trip.accessibilityNeeds) if trip.accessibilityNeeds else 'None'}.

        👉 Please provide ONLY the itinerary in this EXACT format (no extra text, introductions, or conclusions):

        Day 1: Departure from {trip.source} to {trip.destination}
        Morning: [Travel arrangements and departure activities for {trip.numberOfPersons} person(s)]
        Afternoon: [Arrival and initial activities in {trip.destination}]
        Evening: [Evening activities and settling in]
        Meals: [Restaurant suggestions with cuisine type for {trip.numberOfPersons} person(s)]
        Accommodation: [Hotel/stay suggestion for {trip.numberOfPersons} person(s)]

        Day 2: Exploring {trip.destination}
        Morning: [Activity with time and location for {trip.numberOfPersons} person(s)]
        Afternoon: [Activity with time and location for {trip.numberOfPersons} person(s)]
        Evening: [Activity with time and location for {trip.numberOfPersons} person(s)]
        Meals: [Restaurant suggestions with cuisine type for {trip.numberOfPersons} person(s)]
        Accommodation: [Hotel/stay suggestion for {trip.numberOfPersons} person(s)]

        Continue this format for all {days} days. Include return journey planning if needed.
        Be specific with timings, locations, and costs in INR for {trip.numberOfPersons} person(s).
        Consider group discounts and family-friendly options when applicable.
        """

        print(f"Generated prompt: {prompt[:200]}...")  # Debug logging

        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={"contents": [{"parts": [{"text": prompt}]}]},
        )

        print(f"Gemini API response status: {response.status_code}")  # Debug logging

        if response.status_code != 200:
            print(f"Gemini API error: {response.text}")  # Debug logging
            raise HTTPException(status_code=500, detail=f"Gemini API failed: {response.text}")

        data = response.json()
        text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "No response.")
        )

        print(f"Generated itinerary length: {len(text)}")  # Debug logging
        return {"itinerary": text}

    except ValueError as e:
        print(f"Value error: {e}")  # Debug logging
        raise HTTPException(status_code=400, detail=f"Invalid input data: {str(e)}")
    except Exception as e:
        print(f"Unexpected error: {e}")  # Debug logging
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/places/autocomplete")
def get_places_autocomplete(query: str):
    """
    Get place suggestions from Google Places API
    """
    try:
        if not query or len(query.strip()) < 2:
            return {"predictions": []}

        params = {
            "input": query,
            "key": GOOGLE_PLACES_API_KEY,
            "types": "(cities)",  # Focus on cities and places
            "language": "en"
        }

        print(f"Fetching places for query: {query}")  # Debug logging

        response = requests.get(GOOGLE_PLACES_URL, params=params)

        if response.status_code != 200:
            print(f"Google Places API error: {response.text}")
            raise HTTPException(status_code=500, detail="Places API failed")

        data = response.json()

        # Extract and format the predictions
        predictions = []
        for prediction in data.get("predictions", [])[:5]:  # Limit to 5 suggestions
            predictions.append({
                "place_id": prediction.get("place_id"),
                "description": prediction.get("description"),
                "main_text": prediction.get("structured_formatting", {}).get("main_text", ""),
                "secondary_text": prediction.get("structured_formatting", {}).get("secondary_text", "")
            })

        return {"predictions": predictions}

    except Exception as e:
        print(f"Places autocomplete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/followup")
def chat_followup(request: dict):
    """
    Handle follow-up questions and modify the itinerary
    """
    try:
        message = request.get("message", "")
        original_itinerary = request.get("originalItinerary", "")

        if not message:
            raise HTTPException(status_code=400, detail="Message is required")

        print(f"Received follow-up message: {message[:100]}...")  # Debug logging

        # Create a prompt that modifies the existing itinerary
        modification_prompt = f"""
        Here is the current itinerary:
        {original_itinerary}

        User's modification request: {message}

        Please provide a MODIFIED version of the COMPLETE itinerary incorporating the user's request.

        👉 Provide ONLY the updated itinerary in this EXACT format (no explanations or chat responses):

        Day 1: [Brief day title]
        Morning: [Activity with time and location]
        Afternoon: [Activity with time and location]
        Evening: [Activity with time and location]
        Meals: [Restaurant suggestions with cuisine type]
        Accommodation: [Hotel/stay suggestion]

        Day 2: [Brief day title]
        Morning: [Activity with time and location]
        Afternoon: [Activity with time and location]
        Evening: [Activity with time and location]
        Meals: [Restaurant suggestions with cuisine type]
        Accommodation: [Hotel/stay suggestion]

        Continue for all days. Make the requested changes while keeping the rest of the itinerary intact.
        Use INR currency for all costs.
        """

        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={"contents": [{"parts": [{"text": modification_prompt}]}]},
        )

        print(f"Gemini API response status: {response.status_code}")  # Debug logging

        if response.status_code != 200:
            print(f"Gemini API error: {response.text}")  # Debug logging
            raise HTTPException(status_code=500, detail=f"Gemini API failed: {response.text}")

        data = response.json()
        modified_itinerary = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "I'm sorry, I couldn't process your request. Please try again.")
        )

        print(f"Generated modified itinerary length: {len(modified_itinerary)}")  # Debug logging

        return {
            "type": "itinerary_update",
            "modified_itinerary": modified_itinerary,
            "chat_response": f"I've updated your itinerary based on your request: '{message}'"
        }

    except Exception as e:
        print(f"Chat followup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Schema for multi-destination request
class MultiTripRequest(BaseModel):
    source: str
    destinations: list[str]
    numberOfPersons: str
    transportMode: str
    budget: str
    totalDays: str
    startDate: str
    endDate: str
    interests: list[str]
    foodPreference: str
    accessibilityNeeds: list[str]

@app.post("/routers/generate-multi-itinerary")
def generate_multi_itinerary(trip: MultiTripRequest):
    """
    Generate multi-destination itinerary
    """
    try:
        print(f"Received multi-trip data: {trip}")  # Debug logging

        # Convert string values to integers where needed
        days = int(trip.totalDays) if trip.totalDays else 7
        budget = int(trip.budget) if trip.budget else 10000

        # Create destinations string
        destinations_str = " → ".join(trip.destinations)

        prompt = f"""
        Create a detailed {days}-day multi-destination travel itinerary.
        Journey: {trip.source} → {destinations_str}
        Number of travelers: {trip.numberOfPersons} person(s).
        Mode of transport: {trip.transportMode}.
        Total Budget: ₹{budget} INR (total for {trip.numberOfPersons} person(s)).
        Dates: {trip.startDate} to {trip.endDate}.
        Interests: {', '.join(trip.interests) if trip.interests else 'general sightseeing'}.
        Food preference: {trip.foodPreference}.
        Accessibility needs: {', '.join(trip.accessibilityNeeds) if trip.accessibilityNeeds else 'None'}.

        👉 Please provide ONLY the itinerary in this EXACT format (no extra text, introductions, or conclusions):

        Day 1: {trip.source} to {trip.destinations[0] if trip.destinations else 'First Destination'}
        Morning: [Travel and arrival activities with time and location for {trip.numberOfPersons} person(s)]
        Afternoon: [Activity with time and location for {trip.numberOfPersons} person(s)]
        Evening: [Activity with time and location for {trip.numberOfPersons} person(s)]
        Meals: [Restaurant suggestions with cuisine type for {trip.numberOfPersons} person(s)]
        Accommodation: [Hotel/stay suggestion for {trip.numberOfPersons} person(s)]

        Day 2: Exploring {trip.destinations[0] if trip.destinations else 'First Destination'}
        Morning: [Activity with time and location for {trip.numberOfPersons} person(s)]
        Afternoon: [Activity with time and location for {trip.numberOfPersons} person(s)]
        Evening: [Activity with time and location for {trip.numberOfPersons} person(s)]
        Meals: [Restaurant suggestions with cuisine type for {trip.numberOfPersons} person(s)]
        Accommodation: [Hotel/stay suggestion for {trip.numberOfPersons} person(s)]

        Continue this format for all {days} days, including travel days between destinations.
        Distribute time appropriately across all destinations: {destinations_str}.
        Include travel time and transportation details between cities.
        Be specific with timings, locations, and costs in INR for {trip.numberOfPersons} person(s).
        Consider group discounts and family-friendly options when applicable.
        """

        print(f"Generated prompt: {prompt[:200]}...")  # Debug logging

        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={"contents": [{"parts": [{"text": prompt}]}]},
        )

        print(f"Gemini API response status: {response.status_code}")  # Debug logging

        if response.status_code != 200:
            print(f"Gemini API error: {response.text}")  # Debug logging
            raise HTTPException(status_code=500, detail=f"Gemini API failed: {response.text}")

        data = response.json()
        text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "No response.")
        )

        print(f"Generated multi-itinerary length: {len(text)}")  # Debug logging
        return {"itinerary": text}

    except ValueError as e:
        print(f"Value error: {e}")  # Debug logging
        raise HTTPException(status_code=400, detail=f"Invalid input data: {str(e)}")
    except Exception as e:
        print(f"Unexpected error: {e}")  # Debug logging
        raise HTTPException(status_code=500, detail=str(e))

# ✅ New Amadeus Travel Data Endpoint
@api.post("/travel-data")
async def get_travel_data(trip: TripRequest):
    """
    Get comprehensive travel data using Amadeus APIs
    Returns real-time flights, trains, hotels, and points of interest
    """
    try:
        print(f"🔍 Fetching travel data for: {trip.source} → {trip.destination}")

        # Get comprehensive travel data from Amadeus
        travel_data = amadeus_service.get_comprehensive_travel_data(
            source=trip.source,
            destination=trip.destination,
            start_date=trip.startDate,
            end_date=trip.endDate,
            transport_mode=trip.transportMode,
            num_persons=int(trip.numberOfPersons),
            interests=trip.interests if trip.interests else []
        )

        print(f"✅ Travel data fetched successfully")
        print(f"📊 Transport options: {len(travel_data.get('transportOptions', []))}")
        print(f"🏨 Hotels found: {len(travel_data.get('hotels', []))}")
        print(f"📍 POIs found: {len(travel_data.get('pointsOfInterest', []))}")

        return {
            "success": True,
            "data": travel_data,
            "message": "Travel data fetched successfully"
        }

    except Exception as e:
        print(f"❌ Error fetching travel data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch travel data: {str(e)}")

# ✅ Enhanced Itinerary Generation with Amadeus Data
@app.post("/api/generate-itinerary-with-amadeus")
async def generate_itinerary_with_amadeus(trip: TripRequest):
    """
    Generate itinerary using both Amadeus real-time data and Gemini AI
    """
    try:
        print(f"🚀 Generating enhanced itinerary with Amadeus data")
        print(f"📊 Journey type: {trip.journeyType}")

        # Handle multi-destination vs single destination
        if trip.journeyType == "multi" and trip.destinations:
            print(f"🗺️ Multi-destination trip: {trip.source} → {' → '.join(trip.destinations)}")
            destinations = trip.destinations
            days = int(trip.totalDays) if trip.totalDays else int(trip.days) if trip.days else 7
        else:
            print(f"🎯 Single destination trip: {trip.source} → {trip.destination}")
            destinations = [trip.destination] if trip.destination else []
            days = int(trip.days) if trip.days else int(trip.totalDays) if trip.totalDays else 3

        # Step 1: Get real-time travel data from Amadeus
        # For multi-destination, get data for the first destination
        primary_destination = destinations[0] if destinations else trip.destination

        travel_data = amadeus_service.get_comprehensive_travel_data(
            source=trip.source,
            destination=primary_destination,
            start_date=trip.startDate,
            end_date=trip.endDate,
            transport_mode=trip.transportMode,
            num_persons=int(trip.numberOfPersons),
            interests=trip.interests if trip.interests else []
        )

        # Step 2: Create enhanced prompt with real-time data
        budget = int(trip.budget)

        # Format transport options for prompt
        transport_info = ""
        if travel_data.get("transportOptions"):
            transport_info = "\n".join([
                f"- {opt['provider']}: {opt['departure']} → {opt['arrival']} ({opt['duration']}) - {opt['price']}"
                for opt in travel_data["transportOptions"][:3]  # Top 3 options
            ])

        # Format hotel options for prompt
        hotel_info = ""
        if travel_data.get("hotels"):
            hotel_info = "\n".join([
                f"- {hotel['name']} ({hotel['location']}): {hotel['price']} - Rating: {hotel['rating']}/5"
                for hotel in travel_data["hotels"][:3]  # Top 3 options
            ])

        # Format POI options for prompt
        poi_info = ""
        if travel_data.get("pointsOfInterest"):
            poi_info = "\n".join([
                f"- {poi['name']} ({poi['type']}): {', '.join(poi.get('tags', [])[:3])}"
                for poi in travel_data["pointsOfInterest"][:5]  # Top 5 options
            ])

        # Create destination string for prompt
        if trip.journeyType == "multi" and destinations:
            destination_str = f"multiple destinations: {trip.source} → {' → '.join(destinations)}"
            journey_description = f"multi-destination journey covering {len(destinations)} cities"
        else:
            destination_str = f"{trip.source} to {primary_destination}"
            journey_description = "single destination trip"

        enhanced_prompt = f"""
        Create a detailed {days}-day travel itinerary for a {journey_description}.
        Route: {destination_str}
        Number of travelers: {trip.numberOfPersons} person(s).
        Mode of transport: {trip.transportMode}.
        Budget: ₹{budget} INR (total for {trip.numberOfPersons} person(s)).
        Dates: {trip.startDate} to {trip.endDate}.
        Interests: {', '.join(trip.interests) if trip.interests else 'general sightseeing'}.
        Food preference: {trip.foodPreference}.
        Accessibility needs: {', '.join(trip.accessibilityNeeds) if trip.accessibilityNeeds else 'None'}.

        🚄 AVAILABLE TRANSPORT OPTIONS:
        {transport_info if transport_info else "Standard transport options available"}

        🏨 RECOMMENDED HOTELS:
        {hotel_info if hotel_info else "Various accommodation options available"}

        📍 POINTS OF INTEREST:
        {poi_info if poi_info else "Popular attractions and activities available"}

        🛡️ TRAVEL RESTRICTIONS:
        {travel_data.get('restrictions', 'No specific restrictions')}

        👉 Please provide ONLY the itinerary in this EXACT format (no extra text, introductions, or conclusions):

        Day 1: Departure from {trip.source} to {trip.destination}
        Morning: [Travel arrangements using the recommended transport options above for {trip.numberOfPersons} person(s)]
        Afternoon: [Arrival and initial activities in {trip.destination}]
        Evening: [Evening activities and settling in]
        Meals: [Restaurant suggestions with cuisine type for {trip.numberOfPersons} person(s)]
        Accommodation: [Use one of the recommended hotels above for {trip.numberOfPersons} person(s)]

        Day 2: Exploring {trip.destination}
        Morning: [Activity from the points of interest above with time and location for {trip.numberOfPersons} person(s)]
        Afternoon: [Activity from the points of interest above with time and location for {trip.numberOfPersons} person(s)]
        Evening: [Activity from the points of interest above with time and location for {trip.numberOfPersons} person(s)]
        Meals: [Restaurant suggestions with cuisine type for {trip.numberOfPersons} person(s)]
        Accommodation: [Hotel/stay suggestion for {trip.numberOfPersons} person(s)]

        Continue this format for all {days} days. Include return journey planning if needed.
        Be specific with timings, locations, and costs in INR for {trip.numberOfPersons} person(s).
        Use the real-time data provided above for accurate recommendations.
        Consider group discounts and family-friendly options when applicable.
        """

        # Step 3: Generate itinerary with Gemini using enhanced prompt
        headers = {
            "Content-Type": "application/json",
        }

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": enhanced_prompt
                        }
                    ]
                }
            ]
        }

        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Gemini API error: {response.text}")

        data = response.json()
        itinerary_text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "No response.")
        )

        print(f"✅ Enhanced itinerary generated successfully")

        return {
            "success": True,
            "itinerary": itinerary_text,
            "travelData": travel_data,
            "message": "Enhanced itinerary generated with real-time data"
        }

    except Exception as e:
        print(f"❌ Error generating enhanced itinerary: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate enhanced itinerary: {str(e)}")
frontend_build_path = os.path.join(os.path.dirname(__file__), "../frontend/client/build")

app.mount("/static", StaticFiles(directory=os.path.join(frontend_build_path, "static")), name="static")

app.include_router(api)
@app.get("/{full_path:path}")
async def serve_react(full_path: str):
    index_file = os.path.join(frontend_build_path, "index.html")
    return FileResponse(index_file)
