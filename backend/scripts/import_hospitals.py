import csv
import os
import sys
from sqlalchemy.orm import Session
from datetime import datetime

# Add the parent directory to sys.path so we can import from models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.database import SessionLocal, engine, Base
from models.domain import Facility, FacilityStatus, Zone

def import_hospitals(csv_path: str):
    db = SessionLocal()
    try:
        # We need a fallback zone if district doesn't exist yet
        fallback_zone = db.query(Zone).filter(Zone.name == "Tamil Nadu").first()
        if not fallback_zone:
            fallback_zone = Zone(name="Tamil Nadu", admin_level="State")
            db.add(fallback_zone)
            db.commit()

        # Keep a cache of district zones
        zone_cache = {}

        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                district_name = row['district'].strip()
                
                # Resolve Zone
                if district_name not in zone_cache:
                    zone = db.query(Zone).filter(Zone.name == district_name).first()
                    if not zone:
                        zone = Zone(name=district_name, admin_level="District", parent_id=fallback_zone.id)
                        db.add(zone)
                        db.commit()
                        db.refresh(zone)
                    zone_cache[district_name] = zone.id

                zone_id = zone_cache[district_name]
                
                # Check if facility already exists (simple name check for demo)
                existing = db.query(Facility).filter(Facility.name == row['name'].strip()).first()
                if not existing:
                    facility = Facility(
                        type="hospital",
                        name=row['name'].strip(),
                        zone_id=zone_id,
                        lat=float(row['latitude']),
                        lng=float(row['longitude']),
                        ownership_type=row['type'].strip()
                    )
                    db.add(facility)
                    db.flush() # Get facility ID

                    status = FacilityStatus(
                        facility_id=facility.id,
                        operational_status="operational",
                        capacity_total=int(row['total_beds']),
                        capacity_available=int(row['total_beds']) // 2, # Mock available beds
                        occupancy_count=int(row['total_beds']) // 2
                    )
                    db.add(status)
                    count += 1
            
            db.commit()
            print(f"Successfully imported {count} hospitals.")

    except Exception as e:
        db.rollback()
        print(f"Error importing hospitals: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_hospitals("../data/hospitals_tn.csv")
