from fastapi import APIRouter, Depends, WebSocket
from sqlalchemy.orm import Session
from core.phase_engine import get_current_phase, set_phase
from core.auth import get_current_user, role_required
from models.database import get_db
from models.users import User
from pydantic import BaseModel

router = APIRouter()

class PhaseUpdate(BaseModel):
    phase: str

@router.get("/{event_id}/phase")
def get_phase(event_id: int, db: Session = Depends(get_db)):
    phase = get_current_phase(db, event_id)
    if not phase:
        return {"error": "Event not found"}
    return {"event_id": event_id, "phase": phase}

@router.post("/{event_id}/phase/override")
def override_phase(event_id: int, update: PhaseUpdate, db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "operator"]))):
    try:
        event = set_phase(db, event_id, update.phase, current_user.id)
        return {"message": "Phase updated successfully", "event_id": event_id, "new_phase": event.current_phase}
    except ValueError as e:
        return {"error": str(e)}
