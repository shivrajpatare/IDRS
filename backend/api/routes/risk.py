from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db
from core.risk_calculator import RiskCalculator
import math, random

router = APIRouter(prefix="/api/v1/risk", tags=["Risk"])

@router.get("/location")
async def get_location_risk(lat: float = 13.0827, lon: float = 80.2707, db: Session = Depends(get_db)):
    """
    Compute the risk score for a specific location.
    Returns score (0-100) and level (LOW/MODERATE/HIGH/CRITICAL).
    """
    return await RiskCalculator.compute_location_risk(db, lat, lon)


@router.get("/heatmap")
async def get_risk_heatmap(
    center_lat: float = 13.0827,
    center_lon: float = 80.2707,
    grid_size: int = 8,
    spread_km: float = 15.0,
    db: Session = Depends(get_db)
):
    """
    Generate a grid of risk points for the MapLibre heatmap layer.
    Each point has lat, lon, and a risk weight (0-1).
    """
    from models.domain import Alert
    from models.operations import SOSRequest

    active_alerts = db.query(Alert).filter(Alert.is_active == True).count()
    pending_sos = db.query(SOSRequest).filter(SOSRequest.status == "pending").count()

    base_risk = min((active_alerts * 10 + pending_sos * 15), 80)

    step = spread_km / grid_size / 111.32  # degrees per step

    points = []
    for i in range(-grid_size, grid_size + 1):
        for j in range(-grid_size, grid_size + 1):
            pt_lat = center_lat + i * step
            pt_lon = center_lon + j * step

            dist = math.sqrt(i**2 + j**2) * step * 111.32  # km from center
            decay = max(0, 1 - (dist / spread_km))
            risk_weight = round(decay * (base_risk / 100) + random.uniform(0, 0.1), 3)
            risk_weight = min(1.0, max(0, risk_weight))

            if risk_weight > 0.05:
                points.append({
                    "lat": round(pt_lat, 6),
                    "lon": round(pt_lon, 6),
                    "weight": risk_weight
                })

    return {
        "center": {"lat": center_lat, "lon": center_lon},
        "point_count": len(points),
        "points": points
    }
