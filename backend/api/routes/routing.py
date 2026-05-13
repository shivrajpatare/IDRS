from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any, Dict, Optional
from core.ors import get_route
from core.auth import get_current_user
from models.users import User

router = APIRouter()

class Coordinate(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    origin: Coordinate
    destination: Coordinate
    profile: Optional[str] = "driving-car"

class RouteResponse(BaseModel):
    geometry: Dict[str, Any]  # GeoJSON LineString
    distanceMeters: float
    durationSeconds: float

@router.post("/route", response_model=RouteResponse)
async def fetch_route(req: RouteRequest, current_user: User = Depends(get_current_user)):
    """
    Fetch a route between origin and destination.
    Requires authentication to prevent abuse of the backend routing proxy.
    """
    origin_tuple = (req.origin.lat, req.origin.lng)
    dest_tuple = (req.destination.lat, req.destination.lng)
    
    route_data = await get_route(origin_tuple, dest_tuple, req.profile)
    
    return RouteResponse(
        geometry=route_data["geometry"],
        distanceMeters=route_data["distanceMeters"],
        durationSeconds=route_data["durationSeconds"]
    )
