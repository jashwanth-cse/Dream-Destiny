from fastapi import APIRouter, Depends, Header
from auth.firebase_auth import verify_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/me")
def get_current_user(authorization: str = Header(None)):
    if not authorization:
        return {"error": "Authorization header missing"}
    token = authorization.split(" ")[1]  # Expecting "Bearer <idToken>"
    user_info = verify_token(token)
    return {"uid": user_info["uid"], "email": user_info.get("email")}
