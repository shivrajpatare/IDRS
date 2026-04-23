from sqlalchemy import Column, Integer, String, DateTime, JSON, Index
from datetime import datetime
from .database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True) # e.g., 'sos.created', 'facility.updated'
    actor_id = Column(Integer, nullable=True) # citizen_id or operator_id
    target_id = Column(Integer, nullable=True) # sos_id, facility_id, etc.
    details = Column(JSON) # JSON object containing specific fields (lat, lng, priority_score, etc.)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('idx_audit_created_at', created_at.desc()),
    )
