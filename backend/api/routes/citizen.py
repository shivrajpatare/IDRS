from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
from models.database import get_db
from models.operations import SOSRequest
from models.domain import Facility
from core.scoring import compute_priority_score
from core.audit import log_event
from core.websocket import manager
from core.auth import get_current_user

router = APIRouter()

class SOSCreate(BaseModel):
    lat: float
    lng: float
    injury_level: str
    event_id: int
    zone_id: int

@router.post("/sos")
async def create_sos(sos_in: SOSCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    sos = SOSRequest(
        citizen_id=current_user.id,
        event_id=sos_in.event_id,
        zone_id=sos_in.zone_id,
        lat=sos_in.lat,
        lng=sos_in.lng,
        injury_level=sos_in.injury_level,
        status="pending"
    )
    db.add(sos)
    db.commit()
    db.refresh(sos)
    
    # Compute score
    sos.priority_score = compute_priority_score(db, sos)
    db.commit()
    db.refresh(sos)
    
    log_event(db, "sos.created", actor_id=current_user.id, target_id=sos.id, details={"lat": sos.lat, "lng": sos.lng, "priority_score": sos.priority_score})
    
    await manager.broadcast(json.dumps({
        "channel": f"event:{sos.event_id}:sos",
        "payload": { "id": sos.id, "lat": sos.lat, "lng": sos.lng, "priority_score": sos.priority_score, "status": sos.status, "created_at": str(sos.reported_at) }
    }))
    
    return sos

@router.get("/sos/{id}")
def get_sos_status(id: int, db: Session = Depends(get_db)):
    sos = db.query(SOSRequest).filter(SOSRequest.id == id).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS not found")
    return sos

@router.get("/nearby-hospitals")
def get_nearby_hospitals(lat: float, lng: float, db: Session = Depends(get_db)):
    # Mock PostGIS sort with simple calculation for MVP if PostGIS not enabled.
    # In a real app: order_by(Facility.geometry.distance_centroid(...))
    facilities = db.query(Facility).filter(Facility.type == "hospital").all()
    # Sort in memory for the scaffold
    facilities.sort(key=lambda f: (f.lat - lat)**2 + (f.lng - lng)**2)
    return facilities

@router.get("/nearby-shelters")
def get_nearby_shelters(lat: float, lng: float, db: Session = Depends(get_db)):
    facilities = db.query(Facility).filter(Facility.type == "shelter").all()
    facilities.sort(key=lambda f: (f.lat - lat)**2 + (f.lng - lng)**2)
    return facilities
