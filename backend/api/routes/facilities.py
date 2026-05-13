from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
from models.database import get_db
from models.domain import Facility, FacilityStatus
from core.audit import log_event
from core.websocket import manager
from core.auth import get_current_user

router = APIRouter()

class StatusUpdate(BaseModel):
    operational_status: str
    capacity_available: int
    occupancy_count: int

@router.get("/")
def get_facilities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Fetch all facilities with pagination support"""
    return db.query(Facility).offset(skip).limit(limit).all()

@router.get("/{id}/status")
def get_facility_status(id: int, db: Session = Depends(get_db)):
    status = db.query(FacilityStatus).filter(FacilityStatus.facility_id == id).first()
    if not status:
        raise HTTPException(status_code=404, detail=f"Status for facility ID {id} not found")
    return status

@router.post("/{id}/status")
async def update_facility_status(id: int, update: StatusUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    status = db.query(FacilityStatus).filter(FacilityStatus.facility_id == id).first()
    if not status:
        status = FacilityStatus(facility_id=id)
        db.add(status)
    
    old_status = status.operational_status
    status.operational_status = update.operational_status
    status.capacity_available = update.capacity_available
    status.occupancy_count = update.occupancy_count
    
    db.commit()
    db.refresh(status)
    
    facility = db.query(Facility).filter(Facility.id == id).first()
    log_event(db, "facility.updated", actor_id=current_user.id, target_id=id, details={"old_status": old_status, "new_status": update.operational_status})
    
    await manager.broadcast(json.dumps({
        "channel": f"zone:{facility.zone_id}:facility-status",
        "payload": { "facility_id": id, "available_beds": status.capacity_available, "occupancy": status.occupancy_count, "status": status.operational_status }
    }))
    
    return status

@router.get("/nearby")
def get_nearby_facilities(lat: float = 13.0827, lng: float = 80.2707, radius_km: float = 20.0, db: Session = Depends(get_db)):
    """
    Find nearby facilities (hospitals, shelters) within a given radius.
    Uses a simple Euclidean approximation for distance.
    """
    import math
    all_facilities = db.query(Facility).all()
    result = []
    for f in all_facilities:
        if f.lat and f.lng:
            dlat = math.radians(f.lat - lat)
            dlng = math.radians(f.lng - lng)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(f.lat)) * math.sin(dlng/2)**2
            dist_km = 6371 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            if dist_km <= radius_km:
                result.append({
                    "id": f.id, "name": f.name, "type": f.type,
                    "lat": f.lat, "lng": f.lng,
                    "ownership_type": f.ownership_type,
                    "distance_km": round(dist_km, 2)
                })
    result.sort(key=lambda x: x["distance_km"])
    return result
