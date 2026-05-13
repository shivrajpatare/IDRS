from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db
from models.domain import Alert
from typing import List
from pydantic import BaseModel
from datetime import datetime

from core.weather_service import get_weather_data

router = APIRouter()

class AlertOut(BaseModel):
    id: int
    headline: str
    message: str
    source: str
    source_type: str
    severity_raw: str | None = None
    severity_normalized: str | None = None
    certainty: str | None = None
    status: str
    published_at: datetime
    expires_at: datetime | None = None
    external_id: str | None = None
    instruction: str | None = None
    area_desc: str | None = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[AlertOut])
def get_alerts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Fetch all active published alerts with pagination support"""
    return db.query(Alert).filter(Alert.status == "published", Alert.is_active == True).offset(skip).limit(limit).all()

@router.get("/weather")
async def get_weather(lat: float = 13.08, lon: float = 80.27):
    """Fetch live weather from OpenWeatherMap"""
    return await get_weather_data(lat, lon)
