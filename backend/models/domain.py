from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Index
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime
from .database import Base

class DisasterEvent(Base):
    __tablename__ = "disaster_events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    disaster_type = Column(String) # e.g., 'Flood'
    status = Column(String, default="active")
    current_phase = Column(String, default="PRE_DISASTER")
    severity = Column(String)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)

class Zone(Base):
    __tablename__ = "zones"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    admin_level = Column(String) # e.g., 'District', 'Taluka'
    parent_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    # Using Geometry from GeoAlchemy2 requires PostGIS
    geometry = Column(Geometry('POLYGON'), nullable=True)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("disaster_events.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"))
    category = Column(String)
    severity = Column(String)
    certainty = Column(String)
    headline = Column(String)
    message = Column(String)
    language = Column(String)
    source = Column(String)
    status = Column(String, default="draft")

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
