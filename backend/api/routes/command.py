from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
from models.database import get_db
from models.operations import SOSRequest, Assignment, ResourceUnit
from core.audit import log_event
from core.websocket import manager
from core.auth import get_current_user, role_required

router = APIRouter()

class AssignUnit(BaseModel):
    unit_id: int

class ResolveNote(BaseModel):
    resolution_note: str

@router.get("/sos")
def get_sos_queue(db: Session = Depends(get_db), current_user = Depends(role_required(["operator", "admin"]))):
    queue = db.query(SOSRequest).filter(SOSRequest.status != "resolved").order_by(SOSRequest.priority_score.desc()).all()
    return queue

@router.get("/sos/heatmap")
def get_sos_heatmap(db: Session = Depends(get_db)):
    soses = db.query(SOSRequest).filter(SOSRequest.status != "resolved").all()
    # Return simple GeoJSON FeatureCollection
    features = []
    for s in soses:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [s.lng, s.lat]},
            "properties": {"priority_score": s.priority_score}
        })
    return {"type": "FeatureCollection", "features": features}

@router.post("/sos/{id}/assign")
async def assign_sos(id: int, assign_data: AssignUnit, db: Session = Depends(get_db), current_user = Depends(role_required(["operator", "admin"]))):
    sos = db.query(SOSRequest).filter(SOSRequest.id == id).first()
    if not sos:
        raise HTTPException(status_code=404)
        
    unit = db.query(ResourceUnit).filter(ResourceUnit.id == assign_data.unit_id).first()
    
    assignment = Assignment(resource_unit_id=unit.id, target_type="sos_request", target_id=sos.id, assigned_by=current_user.id)
    sos.status = "assigned"
    unit.availability_status = "deployed"
    
    db.add(assignment)
    db.commit()
    
    log_event(db, "sos.assigned", actor_id=current_user.id, target_id=sos.id, details={"unit_id": unit.id})
    log_event(db, "assignment.created", actor_id=current_user.id, target_id=unit.id, details={"target_id": sos.id})
    
    await manager.broadcast(json.dumps({
        "channel": f"user:{sos.citizen_id}:notifications",
        "payload": { "message": "Help is on the way", "team_name": unit.name, "eta": "15 mins" }
    }))
    
    await manager.broadcast(json.dumps({
        "channel": f"event:{sos.event_id}:sos",
        "payload": { "sos_id": sos.id, "assigned_unit": unit.name, "status": "assigned" }
    }))
    
    return {"status": "assigned", "assignment_id": assignment.id}

@router.post("/sos/{id}/resolve")
async def resolve_sos(id: int, resolve_data: ResolveNote, db: Session = Depends(get_db), current_user = Depends(role_required(["operator", "admin"]))):
    sos = db.query(SOSRequest).filter(SOSRequest.id == id).first()
    if not sos:
        raise HTTPException(status_code=404)
    
    sos.status = "resolved"
    db.commit()
    
    log_event(db, "sos.resolved", actor_id=current_user.id, target_id=sos.id, details={"resolution_note": resolve_data.resolution_note})
    return {"status": "resolved"}
