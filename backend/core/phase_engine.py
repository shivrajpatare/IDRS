from enum import Enum
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.domain import DisasterEvent, Alert
from models.operations import SOSRequest

class DisasterPhase(str, Enum):
    PRE = "PRE_DISASTER"
    MID = "MID_DISASTER"
    POST = "POST_DISASTER"

class PhaseEngine:
    """
    Determines current system phase based on live data metrics.
    Does NOT require manual intervention for phase switching.
    """
    
    @staticmethod
    def determine_phase(db: Session) -> DisasterPhase:
        # 1. MID_DISASTER: If there is an active disaster event or pending SOS requests
        active_event = db.query(DisasterEvent).filter(DisasterEvent.status == "active").first()
        if active_event:
            return DisasterPhase.MID
        
        pending_sos = db.query(SOSRequest).filter(SOSRequest.status == "pending").first()
        if pending_sos:
            return DisasterPhase.MID
            
        # 2. POST_DISASTER: If a disaster recently ended (within 48 hours)
        two_days_ago = datetime.utcnow() - timedelta(hours=48)
        recent_ended = db.query(DisasterEvent).filter(
            DisasterEvent.status == "ended", 
            DisasterEvent.end_time >= two_days_ago
        ).first()
        if recent_ended:
            return DisasterPhase.POST

        # 3. PRE_DISASTER: Default state, or if there are active alerts
        return DisasterPhase.PRE

    @staticmethod
    def get_phase_context(db: Session):
        phase = PhaseEngine.determine_phase(db)
        
        # Aggregate context data for the frontend
        return {
            "current_phase": phase,
            "timestamp": datetime.utcnow().isoformat(),
            "metrics": {
                "active_alerts": db.query(Alert).filter(Alert.is_active == True).count(),
                "pending_sos": db.query(SOSRequest).filter(SOSRequest.status == "pending").count(),
                "active_events": db.query(DisasterEvent).filter(DisasterEvent.status == "active").count()
            }
        }
