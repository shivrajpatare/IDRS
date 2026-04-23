from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, JSON, Index
from datetime import datetime
from .database import Base

class IncidentReport(Base):
    __tablename__ = "incident_reports"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("disaster_events.id"))
    reporter_id = Column(Integer, ForeignKey("users.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"))
    source_type = Column(String) # gov, verified_ngo, social, anonymous
    description = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    has_evidence = Column(Boolean, default=False)
    evidence_url = Column(String, nullable=True)
    reported_at = Column(DateTime, default=datetime.utcnow)

class VerificationResult(Base):
    __tablename__ = "verification_results"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("incident_reports.id"))
    credibility_score = Column(Float)
    severity_score = Column(Float, nullable=True)
    is_flagged = Column(Boolean, default=False)
    cluster_id = Column(String, nullable=True)
    explanation_json = Column(JSON)
    status = Column(String, default="pending") # pending, dismissed, confirmed, verified

    __table_args__ = (
        Index('idx_verification_credibility', report_id, credibility_score),
    )
