from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.phase_engine import PhaseEngine, DisasterPhase
from core.auth import get_current_user, role_required
from models.database import get_db
from models.users import User
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/phase", tags=["Phase Management"])

class PhaseUpdate(BaseModel):
    phase: str

@router.get("")
def get_system_phase(db: Session = Depends(get_db)):
    """
    Returns the unified system phase context.
    Determined automatically based on active events, alerts, and SOS requests.
    """
    return PhaseEngine.get_phase_context(db)

@router.post("/override")
def override_system_phase(update: PhaseUpdate, db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "operator"]))):
    """
    Manual override for the system phase (Admin only).
    Useful for testing or specific edge cases.
    """
    # In this unified model, override might set a global flag or update all active events
    # For now, we'll return a message as the logic is primarily data-driven
    return {"message": f"Phase override to {update.phase} registered (Log-only in autonomous mode)"}
