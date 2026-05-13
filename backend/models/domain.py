from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Index, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime
from .database import Base

class DisasterEvent(Base):
    __tablename__ = "disaster_events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    disaster_type = Column(String) # e.g., 'Flood'
    status = Column(String, default="active") # active, ended, archived
    current_phase = Column(String, default="PRE_DISASTER") # PRE, MID, POST
    severity = Column(String) # 1-5 or descriptive
    epicenter_lat = Column(Float, nullable=True)
    epicenter_lon = Column(Float, nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)

class Zone(Base):
    __tablename__ = "zones"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    admin_level = Column(String) # e.g., 'District', 'Taluka'
    parent_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    geometry = Column(String, nullable=True) # WKT representation

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("disaster_events.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    
    # Core CAP Fields
    source = Column(String) # e.g., 'SACHET', 'IMD'
    source_type = Column(String, default="official") # e.g., 'official', 'fallback'
    external_id = Column(String, index=True) # SACHET identifier
    headline = Column(String)
    message = Column(String)
    instruction = Column(String, nullable=True)
    
    # Severity & Status
    severity_raw = Column(String) # Extreme, Severe, etc.
    severity_normalized = Column(String) # Critical, Severe, Moderate, Advisory, Info
    certainty = Column(String)
    status = Column(String, default="published") # published, inactive, expired
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    published_at = Column(DateTime, default=datetime.utcnow)
    effective_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    
    # Metadata
    category = Column(String)
    language = Column(String, default="en")
    area_desc = Column(String, nullable=True)
    # Geometry
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    geometry_status = Column(String, default="point")
    
    # Ingestion Metadata
    etag = Column(String, nullable=True)
    raw_payload_json = Column(JSON, nullable=True)

class Facility(Base):
    __tablename__ = "facilities"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String) # 'hospital', 'shelter', etc.
    name = Column(String)
    zone_id = Column(Integer, ForeignKey("zones.id"))
    lat = Column(Float)
    lng = Column(Float)
    ownership_type = Column(String)
    coordinator_id = Column(Integer, ForeignKey("users.id"))
    
    __table_args__ = (
        Index('idx_facilities_zone_type', zone_id, type),
    )

    status_info = relationship("FacilityStatus", back_populates="facility", uselist=False)

class FacilityStatus(Base):
    __tablename__ = "facility_status"
    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"))
    operational_status = Column(String)
    capacity_total = Column(Integer)
    capacity_available = Column(Integer)
    occupancy_count = Column(Integer)
    updated_at = Column(DateTime, default=datetime.utcnow)

    facility = relationship("Facility", back_populates="status_info")

class IngestionRun(Base):
    __tablename__ = "ingestion_runs"
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String)
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    fetched_count = Column(Integer, default=0)
    inserted_count = Column(Integer, default=0)
    updated_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    status = Column(String) # 'success', 'failed', 'running'
    error_message = Column(String, nullable=True)

class NotificationToken(Base):
    __tablename__ = "notification_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    token = Column(String, unique=True, index=True)
    device_type = Column(String, default="web")
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class RiskZone(Base):
    __tablename__ = "risk_zones"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("disaster_events.id"))
    center_lat = Column(Float)
    center_lon = Column(Float)
    radius_km = Column(Float)
    risk_score = Column(Integer) # 0-100
    risk_level = Column(String) # LOW, MODERATE, HIGH, CRITICAL
    computed_at = Column(DateTime, default=datetime.utcnow)

class SimulationRecord(Base):
    __tablename__ = "simulations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    disaster_type = Column(String)
    epicenter_lat = Column(Float)
    epicenter_lon = Column(Float)
    intensity = Column(String)
    duration_hours = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class SimulationFrame(Base):
    __tablename__ = "simulation_frames"
    id = Column(Integer, primary_key=True, index=True)
    simulation_id = Column(Integer, ForeignKey("simulations.id"))
    frame_number = Column(Integer)
    timestamp = Column(DateTime)
    data = Column(JSON) # Spread radius, affected stats, etc.
