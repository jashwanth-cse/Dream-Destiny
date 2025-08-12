from fastapi import FastAPI
from backend.database import engine, Base
from backend.routers import users, auth, itinerary

# create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DreamDestiny API (Fixed)")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(itinerary.router, prefix="/itinerary", tags=["Itinerary"])

@app.get("/")
def root():
    return {"message": "DreamDestiny backend running (fixed)!"}
