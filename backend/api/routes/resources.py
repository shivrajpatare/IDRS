from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db
from models.operations import ResourceUnit, Assignment

router = APIRouter()

@router.get("/")
def get_resources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List resource units with pagination"""
    return db.query(ResourceUnit).offset(skip).limit(limit).all()

@router.get("/recommendations")
def get_recommendations(sos_lat: float, sos_lng: float, db: Session = Depends(get_db)):
    # Mocking call to ML service
    units = db.query(ResourceUnit).filter(ResourceUnit.availability_status == "available").all()
    units.sort(key=lambda u: (u.current_lat - sos_lat)**2 + (u.current_lng - sos_lng)**2)
    if units:
        return {"recommended_unit_id": units[0].id, "distance_km": 2.5, "eta_minutes": 10}
    return {}

@router.get("/assignments")
def get_assignments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List assignments with pagination"""
    return db.query(Assignment).offset(skip).limit(limit).all()
