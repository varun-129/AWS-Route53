from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from database import get_db
from services.auth_service import get_valid_session

def get_current_session(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    session = get_valid_session(db, token)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid",
        )
    
    return session
