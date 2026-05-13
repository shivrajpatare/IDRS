from sqlalchemy.orm import Session
from models.database import SessionLocal
from models.users import User, Role
from core.auth import get_password_hash

def seed_admin():
    db: Session = SessionLocal()
    admin_role = db.query(Role).filter(Role.name == "Admin").first()
    if not admin_role:
        print("Run seed_base.py first!")
        return
        
    if not db.query(User).filter(User.email == "admin@idrs.gov").first():
        admin = User(
            name="Operations Commander",
            email="admin@idrs.gov",
            phone="9999999999",
            hashed_password=get_password_hash("admin123"),
            role_id=admin_role.id
        )
        db.add(admin)
        db.commit()
        print("Admin user created: admin@idrs.gov / admin123")
    else:
        print("Admin user already exists.")
    db.close()

if __name__ == "__main__":
    seed_admin()
