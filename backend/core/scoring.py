from datetime import datetime
import math
from models.operations import SOSRequest
from models.domain import Zone
from sqlalchemy.orm import Session

def compute_priority_score(db: Session, sos: SOSRequest):
    score = 0.0
    
    # Injury weight
    injury = (sos.injury_level or "").lower()
    if injury == "critical":
        score += 1.0
    elif injury == "moderate":
        score += 0.6
    else:
        score += 0.3
        
    # Zone severity (simplified mock check)
    if sos.zone_id:
        score += 0.3 # Mocking that zone is active danger zone
        
    # Time decay (+0.1 per 5 mins unassigned)
    if sos.status == "pending" and sos.reported_at:
        delta = datetime.utcnow() - sos.reported_at
        mins = delta.total_seconds() / 60
        score += math.floor(mins / 5) * 0.1
        
    # Duplicate check in radius (simplified without raw postgis ST_Distance for basic SQLite compat)
    # Ideally: SELECT COUNT(*) FROM sos_requests WHERE ST_DWithin(geometry, point, 500)
    # Here we mock by checking same zone
    cluster_count = db.query(SOSRequest).filter(SOSRequest.zone_id == sos.zone_id, SOSRequest.status == "pending").count()
    if cluster_count >= 3:
        score += 0.2
        
    return min(score, 5.0) # Cap score if needed
