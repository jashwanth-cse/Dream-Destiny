from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from sqlalchemy.orm import Session
from backend import models, schemas
from jose import jwt

router = APIRouter()
SECRET_KEY = "CHANGE_THIS_TO_A_SECURE_RANDOM_VALUE"
ALGORITHM = "HS256"

def get_current_user(token: str, db: Session):
    from jose import JWTError
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username==username).first()
    if user is None:
        raise credentials_exception
    return user

@router.get("/me", response_model=schemas.UserOut)
def read_me(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    return user
