import asyncio
import logging
from sqlalchemy.orm import Session
from models.database import SessionLocal, engine, Base
from models.users import Role, User
from models.domain import Zone, Facility, FacilityStatus, DisasterEvent
from models.operations import ResourceUnit
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_base_infrastructure():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # 1. Roles
        logger.info("Seeding Roles...")
        roles_data = [
            {"name": "Admin", "permissions_json": {"all": True}},
            {"name": "Responder", "permissions_json": {"deploy": True, "view": True}},
            {"name": "Citizen", "permissions_json": {"sos": True, "profile": True}}
        ]
        for r in roles_data:
            if not db.query(Role).filter(Role.name == r["name"]).first():
                db.add(Role(**r))
        db.commit()

        # 2. Zones (Chennai Core)
        logger.info("Seeding Zones...")
        chennai = db.query(Zone).filter(Zone.name == "Chennai").first()
        if not chennai:
            chennai = Zone(name="Chennai", admin_level="District")
            db.add(chennai)
            db.commit()
            db.refresh(chennai)
        
        sectors = ["Sector 1 (North)", "Sector 2 (Central)", "Sector 3 (South)", "Sector 4 (Adyar)"]
        for s in sectors:
            if not db.query(Zone).filter(Zone.name == s).first():
                db.add(Zone(name=s, admin_level="Sector", parent_id=chennai.id))
        db.commit()

        # 3. Facilities
        logger.info("Seeding Facilities...")
        zones = db.query(Zone).filter(Zone.admin_level == "Sector").all()
        facility_types = [
            ("Apollo Hospital", "hospital", 13.06, 80.25),
            ("Fortis Malar", "hospital", 13.01, 80.25),
            ("Central Shelter A", "shelter", 13.08, 80.27),
            ("Adyar Rescue Hub", "shelter", 13.00, 80.25)
        ]
        for name, ftype, lat, lng in facility_types:
            if not db.query(Facility).filter(Facility.name == name).first():
                f = Facility(name=name, type=ftype, lat=lat, lng=lng, zone_id=zones[0].id)
                db.add(f)
                db.commit()
                db.refresh(f)
                # Add initial status
                db.add(FacilityStatus(
                    facility_id=f.id,
                    operational_status="operational",
                    capacity_total=100,
                    capacity_available=80,
                    occupancy_count=20
                ))
        db.commit()

        # 4. Resource Units
        logger.info("Seeding Resource Units...")
        resources = [
            ("Amb-Alpha-01", "ambulance", 13.05, 80.24),
            ("Res-Team-Sigma", "rescue_team", 13.07, 80.26),
            ("Sat-Link-04", "satellite_uplink", 13.10, 80.22)
        ]
        for name, rtype, lat, lng in resources:
            if not db.query(ResourceUnit).filter(ResourceUnit.name == name).first():
                db.add(ResourceUnit(
                    name=name, 
                    type=rtype, 
                    current_lat=lat, 
                    current_lng=lng, 
                    current_zone_id=zones[0].id,
                    availability_status="available"
                ))
        db.commit()

        # 5. Default Disaster Event
        if not db.query(DisasterEvent).filter(DisasterEvent.status == "active").first():
            db.add(DisasterEvent(
                title="Monsoon Monitoring 2026",
                disaster_type="Flood",
                current_phase="PRE_DISASTER",
                severity="Moderate"
            ))
        db.commit()

        logger.info("Base infrastructure seeded successfully.")

    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(seed_base_infrastructure())
