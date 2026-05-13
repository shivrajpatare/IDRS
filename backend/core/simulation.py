from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from models.domain import SimulationRecord, SimulationFrame, Zone, Facility

class DisasterSimulation:
    """
    Heuristic-based simulation engine for disaster spread.
    Creates realistic propagation animations without heavy ML training.
    """
    
    @staticmethod
    async def simulate_flood_spread(
        db: Session,
        epicenter_lat: float,
        epicenter_lon: float,
        intensity: str = "moderate",
        duration_hours: int = 24
    ) -> List[Dict[str, Any]]:
        frames = []
        
        # Heuristic spread rates (km/hour)
        rates = {"low": 2, "moderate": 5, "high": 10}
        spread_rate = rates.get(intensity.lower(), 5)
        
        for hour in range(duration_hours):
            radius = spread_rate * hour
            
            # Simplified impact logic
            # In a real app, we'd query the DB for zones within radius
            # For the prototype, we generate heuristic stats
            pop_affected = int(radius * 1500) # heuristic: 1500 people per km
            capacity_needed = int(pop_affected * 0.05) # 5% need shelter
            
            frame_data = {
                "hour": hour,
                "timestamp": (datetime.utcnow() + timedelta(hours=hour)).isoformat(),
                "spread_radius_km": radius,
                "impact": {
                    "pop_affected": pop_affected,
                    "capacity_needed": capacity_needed,
                    "intensity": intensity
                }
            }
            frames.append(frame_data)
            
        return frames

    @staticmethod
    async def simulate_cyclone_path(
        db: Session,
        start_lat: float,
        start_lon: float,
        duration_hours: int = 48
    ) -> List[Dict[str, Any]]:
        frames = []
        curr_lat, curr_lon = start_lat, start_lon
        
        for hour in range(duration_hours):
            # Heuristic movement: slightly North-West
            curr_lat += 0.05
            curr_lon -= 0.03
            
            intensity = max(1, 5 - (hour / 12)) # Intensity fades
            radius = 20 * (intensity / 5)
            
            frame_data = {
                "hour": hour,
                "timestamp": (datetime.utcnow() + timedelta(hours=hour)).isoformat(),
                "center": {"lat": curr_lat, "lon": curr_lon},
                "radius_km": radius,
                "intensity": intensity,
                "wind_speed_kmh": int(intensity * 45)
            }
            frames.append(frame_data)
            
        return frames
