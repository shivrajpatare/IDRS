from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from datetime import datetime
from .database import Base

class AidClaim(Base):
    __tablename__ = "aid_claims"
    id = Column(Integer, primary_key=True, index=True)
    claimant_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("disaster_events.id"))
    claim_type = Column(String)
    amount_requested = Column(Float)
    status = Column(String, default="pending")
    fraud_score = Column(Float, nullable=True)

class MissingPersonCase(Base):
    __tablename__ = "missing_person_cases"
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("disaster_events.id"))
    name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    status = Column(String, default="missing") # missing, found
    found_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index('idx_missing_persons_status_event', status, event_id),
    )

class InfraStatus(Base):
    __tablename__ = "infra_status"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("disaster_events.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"))
    road_status = Column(String, default="Unknown")
    bridge_status = Column(String, default="Unknown")
    water_status = Column(String, default="Unknown")
    power_status = Column(String, default="Unknown")
    telecom_status = Column(String, default="Unknown")

class ReliefDistribution(Base):
    __tablename__ = "relief_distributions"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("disaster_events.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"))
    aid_type = Column(String) # food, medical, water
    quantity_delivered = Column(Integer)
    quantity_needed = Column(Integer)
    delivered_at = Column(DateTime, default=datetime.utcnow)
