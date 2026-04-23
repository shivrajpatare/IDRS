from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Index
from datetime import datetime
from .database import Base

class SOSRequest(Base):
    __tablename__ = "sos_requests"
    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("disaster_events.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"))
    lat = Column(Float)
    lng = Column(Float)
    distress_type = Column(String)
    injury_level = Column(String)
    priority_score = Column(Float)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index('idx_sos_priority_status', priority_score.desc(), status),
    )

class ResourceUnit(Base):
    __tablename__ = "resource_units"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String) # 'ambulance', 'rescue_team', etc.
    name = Column(String)
    current_zone_id = Column(Integer, ForeignKey("zones.id"))
    current_lat = Column(Float)
    current_lng = Column(Float)
    availability_status = Column(String, default="available")

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    resource_unit_id = Column(Integer, ForeignKey("resource_units.id"))
    target_type = Column(String) # 'sos_request', 'facility', etc.
    target_id = Column(Integer)
    assigned_by = Column(Integer, ForeignKey("users.id"))
    assigned_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="active")
