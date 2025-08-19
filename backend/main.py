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
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    f"?key={GEMINI_API_KEY}"
)

# Google Places API configuration
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "AIzaSyCgc7VyrFErOSwsPn08oc-SAz_Lf0HDORk")  # Use same key or different one
GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=paris&key=GOOGLE_PLACES_API_KEY"

# Schema for incoming request
class TripRequest(BaseModel):
    destination: str
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
        Create a {days}-day travel itinerary for {trip.destination}.
        Mode of transport: {trip.transportMode}.
        Budget: ${budget}.
        Dates: {trip.startDate} to {trip.endDate}.
        Interests: {', '.join(trip.interests) if trip.interests else 'general sightseeing'}.
        Food preference: {trip.foodPreference}.
        Accessibility needs: {', '.join(trip.accessibilityNeeds) if trip.accessibilityNeeds else 'None'}.

        👉 Please give the output strictly in this format:
        Day 1: ...
        Day 2: ...
        (continue day-wise with activities, food, and travel notes)
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
