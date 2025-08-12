DreamDestiny backend (fixed) - usage:

1. Copy the 'backend' folder into your project root (DreamDestiny/backend)
2. Create and activate a virtual environment:
   python -m venv venv
   venv\Scripts\activate

3. Install dependencies:
   pip install -r requirements.txt

4. Run the server from project root:
   uvicorn backend.main:app --reload

5. Test endpoints:
   GET http://127.0.0.1:8000/
   POST http://127.0.0.1:8000/itinerary/generate with JSON payload (preferences dict)
