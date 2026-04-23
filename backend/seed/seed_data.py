from sqlalchemy.orm import Session
from models.database import SessionLocal, engine, Base
from models.users import Role, User, CitizenProfile
from models.domain import Zone, DisasterEvent, Facility, FacilityStatus
from models.operations import SOSRequest
from core.auth import get_password_hash

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Roles
    roles = ["citizen", "operator", "admin", "field_team"]
    role_objs = {}
    for r in roles:
        role = db.query(Role).filter(Role.name == r).first()
        if not role:
            role = Role(name=r, permissions_json={})
            db.add(role)
            db.commit()
            db.refresh(role)
        role_objs[r] = role

    # 2. Users
    users_data = [
        {"email": "admin@tn.gov.in", "role": "admin", "name": "Admin User"},
        {"email": "operator1@tn.gov.in", "role": "operator", "name": "Control Room Op 1"},
        {"email": "field_ndrf1@tn.gov.in", "role": "field_team", "name": "NDRF Unit Alpha"},
        {"email": "citizen_chennai@example.com", "role": "citizen", "name": "Chennai Citizen"}
    ]
    for ud in users_data:
        user = db.query(User).filter(User.email == ud["email"]).first()
        if not user:
            user = User(
                email=ud["email"],
                phone=f"99999{ud['email'][:5]}",
                hashed_password=get_password_hash("password123"),
                role_id=role_objs[ud["role"]].id,
                name=ud["name"]
            )
            db.add(user)
    db.commit()

    # 3. Zones (Tamil Nadu - Chennai, Cuddalore, Nagapattinam)
    # Using simple polygon WKT representation
    zones_data = [
        {"name": "Chennai_Velachery", "level": "Ward", "geom": "POLYGON((80.2 12.9, 80.25 12.9, 80.25 12.95, 80.2 12.95, 80.2 12.9))"},
        {"name": "Chennai_Pallikaranai", "level": "Ward", "geom": "POLYGON((80.1 12.9, 80.15 12.9, 80.15 12.95, 80.1 12.95, 80.1 12.9))"},
        {"name": "Cuddalore_Coastal", "level": "Taluka", "geom": "POLYGON((79.7 11.7, 79.8 11.7, 79.8 11.8, 79.7 11.8, 79.7 11.7))"},
        {"name": "Nagapattinam_Delta", "level": "Taluka", "geom": "POLYGON((79.8 10.7, 79.9 10.7, 79.9 10.8, 79.8 10.8, 79.8 10.7))"},
        {"name": "Chennai_Adyar", "level": "Ward", "geom": "POLYGON((80.25 13.0, 80.3 13.0, 80.3 13.05, 80.25 13.05, 80.25 13.0))"}
    ]
    zone_objs = []
    for zd in zones_data:
        zone = db.query(Zone).filter(Zone.name == zd["name"]).first()
        if not zone:
            zone = Zone(name=zd["name"], admin_level=zd["level"], geometry=zd["geom"])
            db.add(zone)
            db.commit()
            db.refresh(zone)
        zone_objs.append(zone)

    # 4. Disaster Events
    events_data = [
        {"title": "Cyclone Michaung Flood", "type": "Flood", "phase": "MID_DISASTER", "sev": "HIGH"},
        {"title": "Cuddalore Flash Flood", "type": "Flood", "phase": "PRE_DISASTER", "sev": "MEDIUM"},
        {"title": "Nagapattinam Storm Surge", "type": "Flood", "phase": "POST_DISASTER", "sev": "CRITICAL"}
    ]
    event_objs = []
    for ed in events_data:
        ev = db.query(DisasterEvent).filter(DisasterEvent.title == ed["title"]).first()
        if not ev:
            ev = DisasterEvent(title=ed["title"], disaster_type=ed["type"], current_phase=ed["phase"], severity=ed["sev"])
            db.add(ev)
            db.commit()
            db.refresh(ev)
        event_objs.append(ev)

    # 5. Facilities
    # We will seed 10 hospitals and 8 shelters (truncating here for brevity)
    for i in range(1, 11):
        fac = Facility(type="hospital", name=f"TN Govt Hospital {i}", zone_id=zone_objs[i%5].id, lat=13.0+i*0.01, lng=80.0+i*0.01, ownership_type="Govt")
        db.add(fac)
    for i in range(1, 9):
        fac = Facility(type="shelter", name=f"Relief Camp {i}", zone_id=zone_objs[i%5].id, lat=12.9+i*0.01, lng=80.1+i*0.01, ownership_type="NGO")
        db.add(fac)
    db.commit()
    print("Seeding Complete")
    db.close()

if __name__ == "__main__":
    seed()
