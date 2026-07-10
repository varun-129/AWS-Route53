import bcrypt
from database import SessionLocal
from models import User

def seed():
    db = SessionLocal()
    
    admin_user = db.query(User).filter(User.username == "admin").first()
    if admin_user:
        print("Admin user already exists.")
        db.close()
        return

    password = "admin123"
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    new_admin = User(
        username="admin",
        password_hash=password_hash
    )
    
    db.add(new_admin)
    db.commit()
    print("Admin user created successfully.")
    db.close()

if __name__ == "__main__":
    seed()
