from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
from models.database import get_db
from models.reports import IncidentReport, VerificationResult
from core.verification import compute_credibility
from core.websocket import manager
from core.auth import get_current_user, role_required

router = APIRouter()

class ReportCreate(BaseModel):
    event_id: int
    zone_id: int
    source_type: str
    description: str
    lat: float
    lng: float
    has_evidence: bool = False

@router.post("/")
async def submit_report(report_in: ReportCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    report = IncidentReport(
        event_id=report_in.event_id,
        reporter_id=current_user.id,
        zone_id=report_in.zone_id,
        source_type=report_in.source_type,
        description=report_in.description,
        lat=report_in.lat,
        lng=report_in.lng,
        has_evidence=report_in.has_evidence
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # Auto-score
    result = compute_credibility(db, report)
    
    if result.is_flagged:
        await manager.broadcast(json.dumps({
            "channel": f"event:{report.event_id}:alerts",
            "payload": { "report_id": report.id, "credibility_score": result.credibility_score, "message": "Flagged as misinformation" }
        }))
        
    return {"report_id": report.id, "verification": result}

@router.get("/")
def get_reports(db: Session = Depends(get_db)):
    return db.query(IncidentReport).all()

@router.get("/flagged")
def get_flagged_reports(db: Session = Depends(get_db), current_user = Depends(role_required(["operator", "admin"]))):
    results = db.query(VerificationResult).filter(VerificationResult.is_flagged == True, VerificationResult.status == "pending").all()
    # In a real app we would join with IncidentReport
    return results
