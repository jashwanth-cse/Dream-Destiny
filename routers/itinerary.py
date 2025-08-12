from fastapi import APIRouter, Depends
from backend.database import get_db
from sqlalchemy.orm import Session
from backend.services.recommender import generate_trip_plan

router = APIRouter()

@router.post("/generate")
def generate_itinerary(preferences: dict, db: Session = Depends(get_db)):
    # preferences is expected to be a dict from frontend
    plan = generate_trip_plan(preferences)
    return {"status": "success", "itinerary": plan}
