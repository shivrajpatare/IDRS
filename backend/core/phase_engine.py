from models.domain import DisasterEvent
from sqlalchemy.orm import Session

# Valid phases
PHASES = ["PRE_DISASTER", "MID_DISASTER", "POST_DISASTER"]

def get_current_phase(db: Session, event_id: int):
    event = db.query(DisasterEvent).filter(DisasterEvent.id == event_id).first()
    if not event:
        return None
    return event.current_phase

def set_phase(db: Session, event_id: int, new_phase: str, user_id: int):
    if new_phase not in PHASES:
        raise ValueError(f"Invalid phase. Must be one of {PHASES}")
    
    event = db.query(DisasterEvent).filter(DisasterEvent.id == event_id).first()
    if not event:
        raise ValueError("Event not found")
        
    old_phase = event.current_phase
    event.current_phase = new_phase
    
    # Ideally log to phase_transitions or audit_logs here
    
    db.commit()
    db.refresh(event)
    return event
