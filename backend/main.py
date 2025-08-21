# backend/app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Store your API keys securely
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBh9q8O9CUlQ2ey4RMzLzI8t7kFQxV9JMI")
GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    f"?key={GEMINI_API_KEY}"
)

# Google Places API configuration
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "AIzaSyCgc7VyrFErOSwsPn08oc-SAz_Lf0HDORk")  # Use same key or different one
GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=paris&key=GOOGLE_PLACES_API_KEY"

# Schema for incoming request
class TripRequest(BaseModel):
    source: str
    destination: str
    numberOfPersons: str
    transportMode: str
    budget: str  # Changed to str to handle frontend input
    days: str    # Changed to str to handle frontend input
    startDate: str
    endDate: str
    interests: list[str]
    foodPreference: str
    accessibilityNeeds: list[str]

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
            GEMINI_API_URL,
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
            GEMINI_API_URL,
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
            GEMINI_API_URL,
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
