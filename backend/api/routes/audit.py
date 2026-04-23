from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db
from models.audit import AuditLog

router = APIRouter()

@router.get("/logs")
def get_audit_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs
