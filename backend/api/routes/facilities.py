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
def get_facilities(db: Session = Depends(get_db)):
    return db.query(Facility).all()

@router.get("/{id}/status")
def get_facility_status(id: int, db: Session = Depends(get_db)):
    status = db.query(FacilityStatus).filter(FacilityStatus.facility_id == id).first()
    if not status:
        raise HTTPException(status_code=404)
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
