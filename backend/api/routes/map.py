from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db
from models.domain import Zone, Facility, DisasterEvent
from models.operations import ResourceUnit
import json

router = APIRouter()

@router.get("/incidents")
def get_incidents(db: Session = Depends(get_db)):
    events = db.query(DisasterEvent).filter(DisasterEvent.status == "active").all()
    # Mocking as FeatureCollection
    features = []
    for ev in events:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [80.2, 13.0]}, # Mock coordinates
            "properties": {"title": ev.title, "severity": ev.severity}
        })
    return {"type": "FeatureCollection", "features": features}

@router.get("/facilities")
def get_map_facilities(db: Session = Depends(get_db)):
    facilities = db.query(Facility).all()
    features = []
    for f in facilities:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [f.lng, f.lat]},
            "properties": {"name": f.name, "type": f.type}
        })
    return {"type": "FeatureCollection", "features": features}

@router.get("/zones")
def get_zones(db: Session = Depends(get_db)):
    zones = db.query(Zone).all()
    # Returning WKT strings mapped to GeoJSON is complex here without PostGIS `ST_AsGeoJSON`
    # Mocking basic polygons
    features = []
    for z in zones:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Polygon", "coordinates": [[[80.2, 12.9], [80.25, 12.9], [80.25, 12.95], [80.2, 12.9]]]},
            "properties": {"name": z.name}
        })
    return {"type": "FeatureCollection", "features": features}

@router.get("/resources")
def get_map_resources(db: Session = Depends(get_db)):
    units = db.query(ResourceUnit).all()
    features = []
    for u in units:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [u.current_lng, u.current_lat]},
            "properties": {"name": u.name, "status": u.availability_status}
        })
    return {"type": "FeatureCollection", "features": features}
