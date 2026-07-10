from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from database import get_db
from schemas import LoginRequest, SessionResponse
from services.auth_service import authenticate_user, create_session, delete_session
from dependencies import get_current_session
from models import Session as SessionModel

router = APIRouter()

@router.post("/login")
def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.username, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    
    session = create_session(db, user.id)
    
    response.set_cookie(
        key="session_token",
        value=session.token,
        httponly=True,
        samesite="lax",
        max_age=86400, # 24 hours
        secure=False, # Set to True in production with HTTPS
    )
    
    return {"message": "Logged in successfully"}

@router.post("/logout")
def logout(response: Response, session: SessionModel = Depends(get_current_session), db: Session = Depends(get_db)):
    delete_session(db, session.token)
    response.delete_cookie("session_token")
    return {"message": "Logged out successfully"}

@router.get("/session", response_model=SessionResponse)
def get_session(session: SessionModel = Depends(get_current_session)):
    return session
