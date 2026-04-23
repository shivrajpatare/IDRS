from sqlalchemy.orm import Session
from models.audit import AuditLog

def log_event(db: Session, event_type: str, actor_id: int = None, target_id: int = None, details: dict = None):
    audit_entry = AuditLog(
        event_type=event_type,
        actor_id=actor_id,
        target_id=target_id,
        details=details or {}
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry
