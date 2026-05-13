from datetime import datetime
from sqlalchemy.orm import Session
from models.domain import Alert, Facility
from .weather_service import get_weather_data # Assuming this exists or will be updated

class RiskCalculator:
    """
    Computes real-time risk scores (0-100) based on multiple factors:
    Alert proximity, weather conditions, and facility capacity.
    """
    
    @staticmethod
    async def compute_location_risk(db: Session, lat: float, lon: float) -> dict:
        # 1. Alert Factor (Max 40 pts)
        # Simplified: check for active alerts in the same lat/lon vicinity
        # In production, use spatial queries
        nearby_alerts = db.query(Alert).filter(Alert.is_active == True).count()
        alert_score = min(nearby_alerts * 10, 40)
        
        # 2. Weather Factor (Max 30 pts)
        # This would call the OWM API in a real scenario
        weather_score = 15 # Mock default
        
        # 3. Facility Scarcity (Max 20 pts)
        nearby_facilities = db.query(Facility).count()
        facility_score = 20 if nearby_facilities < 5 else 10
        
        # 4. Historical Factor (Max 10 pts)
        historical_score = 5 # Mock default
        
        total_score = alert_score + weather_score + facility_score + historical_score
        
        level = "LOW"
        if total_score > 70: level = "CRITICAL"
        elif total_score > 50: level = "HIGH"
        elif total_score > 30: level = "MODERATE"
        
        return {
            "score": total_score,
            "level": level,
            "factors": {
                "alerts": alert_score,
                "weather": weather_score,
                "infrastructure": facility_score,
                "historical": historical_score
            },
            "timestamp": datetime.utcnow().isoformat()
        }
