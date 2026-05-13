from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db
from core.simulation import DisasterSimulation

router = APIRouter(prefix="/api/v1/simulation", tags=["Simulation"])

@router.get("/flood")
async def get_flood_simulation(lat: float = 13.0827, lon: float = 80.2707, intensity: str = "high", db: Session = Depends(get_db)):
    """
    Returns heuristic-based flood simulation frames for a given location.
    Required for Chennai Flood Simulation demo.
    """
    frames = await DisasterSimulation.simulate_flood_spread(db, lat, lon, intensity)
    return {"status": "success", "event_type": "Flood", "frames": frames}

@router.get("/cyclone")
async def get_cyclone_simulation(start_lat: float = 13.08, start_lon: float = 80.27, db: Session = Depends(get_db)):
    """
    Returns heuristic-based cyclone simulation frames.
    """
    frames = await DisasterSimulation.simulate_cyclone_path(db, start_lat, start_lon)
    return {"status": "success", "event_type": "Cyclone", "frames": frames}
