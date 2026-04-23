from sqlalchemy.orm import Session
from models.reports import IncidentReport, VerificationResult
from models.domain import DisasterEvent
import json

def compute_credibility(db: Session, report: IncidentReport):
    score = 0.0
    
    # Source weight
    src = (report.source_type or "").lower()
    if src in ["gov", "ndma"]:
        score += 1.0
    elif src == "verified_ngo":
        score += 0.8
    elif src == "social":
        score += 0.4
    else:
        score += 0.2
        
    # Location match
    if report.zone_id:
        score += 0.2
        
    # Time match
    event = db.query(DisasterEvent).filter(DisasterEvent.id == report.event_id).first()
    if event and event.status == "active":
        score += 0.1
        
    # Evidence bonus
    if report.has_evidence:
        score += 0.15
        
    # Mocking duplicate penalty
    duplicate_check = db.query(IncidentReport).filter(
        IncidentReport.zone_id == report.zone_id,
        IncidentReport.id != report.id
    ).count()
    if duplicate_check > 0:
        score -= 0.1 # Simplified penalty
        
    score = max(0.0, min(1.0, score))
    
    is_flagged = score < 0.35
    
    result = VerificationResult(
        report_id=report.id,
        credibility_score=score,
        is_flagged=is_flagged,
        explanation_json={"base_score": score, "source": src, "flagged": is_flagged}
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    
    return result
