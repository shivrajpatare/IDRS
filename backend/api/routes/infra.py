from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
from models.database import get_db
from models.recovery import InfraStatus
from core.websocket import manager
from core.auth import get_current_user, role_required

router = APIRouter()

class InfraUpdate(BaseModel):
    road_status: str
    bridge_status: str
    water_status: str
    power_status: str
    telecom_status: str

@router.get("/{zone_id}")
def get_infra_status(zone_id: int, db: Session = Depends(get_db)):
    status = db.query(InfraStatus).filter(InfraStatus.zone_id == zone_id).first()
    return status

@router.post("/{zone_id}")
async def update_infra_status(zone_id: int, update: InfraUpdate, db: Session = Depends(get_db), current_user = Depends(role_required(["operator", "admin"]))):
    status = db.query(InfraStatus).filter(InfraStatus.zone_id == zone_id).first()
    if not status:
        status = InfraStatus(zone_id=zone_id)
        db.add(status)
        
    status.road_status = update.road_status
    status.bridge_status = update.bridge_status
    status.water_status = update.water_status
    status.power_status = update.power_status
    status.telecom_status = update.telecom_status
    
    db.commit()
    
    await manager.broadcast(json.dumps({
        "channel": f"zone:{zone_id}:facility-status", # Using facility-status channel as per spec or similar
        "payload": { "zone_id": zone_id, "road_status": status.road_status, "power_status": status.power_status, "water_status": status.water_status }
    }))
    return status
