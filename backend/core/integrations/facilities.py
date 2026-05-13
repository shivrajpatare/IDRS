import httpx
import logging
from sqlalchemy.orm import Session
from models.domain import Facility, FacilityStatus
from datetime import datetime

logger = logging.getLogger(__name__)

async def fetch_facilities_from_overpass(db: Session, bbox: str):
    """
    Fetch hospitals, shelters, and emergency points from OpenStreetMap via Overpass API.
    bbox format: "south,west,north,east"
    """
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="hospital"]({bbox});
      node["amenity"="shelter"]({bbox});
      node["emergency"="assembly_point"]({bbox});
    );
    out body;
    """
    
    url = "https://overpass-api.de/api/interpreter"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=query, timeout=30.0)
            if response.status_code == 200:
                elements = response.json().get("elements", [])
                for el in elements:
                    # Upsert facility
                    osm_id = str(el["id"])
                    name = el.get("tags", {}).get("name", f"Facility {osm_id}")
                    f_type = el.get("tags", {}).get("amenity") or el.get("tags", {}).get("emergency") or "unknown"
                    
                    # Basic mapping to internal types
                    if "hospital" in f_type: f_type = "hospital"
                    elif "shelter" in f_type: f_type = "shelter"
                    
                    # Check if exists
                    facility = db.query(Facility).filter(Facility.name == name).first()
                    if not facility:
                        facility = Facility(
                            name=name,
                            type=f_type,
                            lat=el["lat"],
                            lng=el["lon"],
                            ownership_type="public"
                        )
                        db.add(facility)
                        db.flush()
                        
                        # Add status
                        status = FacilityStatus(
                            facility_id=facility.id,
                            operational_status="operational",
                            capacity_total=100, # Default
                            capacity_available=100,
                            occupancy_count=0
                        )
                        db.add(status)
                
                db.commit()
                return len(elements)
    except Exception as e:
        logger.error(f"Overpass API error: {e}")
        return 0
