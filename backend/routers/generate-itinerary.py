from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from sqlalchemy.orm import Session
from backend.services.recommender import generate_trip_plan
from pydantic import BaseModel
from typing import List

router = APIRouter()

# Schema for incoming request from frontend
class TripRequest(BaseModel):
    destination: str
    transportMode: str
    budget: str
    days: str
    startDate: str
    endDate: str
    interests: List[str]
    foodPreference: str
    accessibilityNeeds: List[str]

@router.post("/generate")
def generate_itinerary(trip: TripRequest, db: Session = Depends(get_db)):
    try:
        # Convert frontend data to format expected by generate_trip_plan
        preferences = {
            "destination": trip.destination,
            "origin": "Delhi",  # Default origin, you might want to add this to frontend
            "travel_date": trip.startDate,
            "return_date": trip.endDate,
            "days": int(trip.days) if trip.days else 3,
            "food_pref": "veg" if trip.foodPreference.lower() in ["vegetarian", "veg"] else "non-veg",
            "transport_mode": trip.transportMode,
            "budget": int(trip.budget) if trip.budget else 5000,
            "interests": trip.interests,
            "accessibility_needs": trip.accessibilityNeeds
        }

        plan = generate_trip_plan(preferences)
        return {"status": "success", "itinerary": plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
