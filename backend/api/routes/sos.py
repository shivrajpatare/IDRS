from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
from models.database import get_db
from models.operations import SOSRequest
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
    message: str | None = None

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_sos(sos_in: SOSCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Create a new SOS request from a citizen.
    Includes priority scoring and real-time broadcasting.
    """
    sos = SOSRequest(
        citizen_id=current_user.id,
        event_id=sos_in.event_id,
        zone_id=sos_in.zone_id,
        lat=sos_in.lat,
        lng=sos_in.lng,
        injury_level=sos_in.injury_level,
        message=sos_in.message,
        status="pending"
    )
    db.add(sos)
    db.commit()
    db.refresh(sos)
    
    # Compute priority score for the queue
    sos.priority_score = compute_priority_score(db, sos)
    db.commit()
    db.refresh(sos)
    
    # Audit log
    log_event(db, "sos.created", actor_id=current_user.id, target_id=sos.id, 
              details={"lat": sos.lat, "lng": sos.lng, "priority_score": sos.priority_score})
    
    # Broadcast via WebSocket
    await manager.broadcast(json.dumps({
        "channel": f"event:{sos.event_id}:sos",
        "payload": { 
            "id": sos.id, 
            "lat": sos.lat, 
            "lng": sos.lng, 
            "priority_score": sos.priority_score, 
            "status": sos.status, 
            "created_at": str(sos.reported_at) 
        }
    }))
    
    return sos

@router.get("/")
def get_sos_list(db: Session = Depends(get_db)):
    """
    List all SOS requests. (Usually for debugging or public status)
    """
    return db.query(SOSRequest).all()

@router.get("/{id}")
def get_sos_detail(id: int, db: Session = Depends(get_db)):
    sos = db.query(SOSRequest).filter(SOSRequest.id == id).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS request not found")
    return sos

