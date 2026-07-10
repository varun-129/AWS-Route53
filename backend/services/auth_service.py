import secrets
import bcrypt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import User, Session as SessionModel

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return None
    return user

def create_session(db: Session, user_id: int):
    token = secrets.token_urlsafe(32)
    # Expiry in 24 hours
    expires_at = datetime.utcnow() + timedelta(days=1)
    
    db_session = SessionModel(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_valid_session(db: Session, token: str):
    db_session = db.query(SessionModel).filter(SessionModel.token == token).first()
    if not db_session:
        return None
    if datetime.utcnow() > db_session.expires_at:
        delete_session(db, token)
        return None
    return db_session

def delete_session(db: Session, token: str):
    db_session = db.query(SessionModel).filter(SessionModel.token == token).first()
    if db_session:
        db.delete(db_session)
        db.commit()
