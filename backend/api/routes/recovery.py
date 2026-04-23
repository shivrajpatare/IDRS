from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
from models.database import get_db
from models.recovery import AidClaim, MissingPersonCase, ReliefDistribution
from core.fraud import compute_fraud_score
from core.websocket import manager
from core.auth import get_current_user, role_required

router = APIRouter()

class ClaimCreate(BaseModel):
    event_id: int
    claim_type: str
    amount_requested: float

class MissingPersonCreate(BaseModel):
    event_id: int
    name: str
    age: int
    gender: str

@router.post("/aid-claims")
async def submit_aid_claim(claim_in: ClaimCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    claim = AidClaim(
        claimant_id=current_user.id,
        event_id=claim_in.event_id,
        claim_type=claim_in.claim_type,
        amount_requested=claim_in.amount_requested,
        status="pending"
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    
    # Fraud check
    # mock citizen_zone_id as 1
    claim, flags = compute_fraud_score(db, claim, citizen_zone_id=1)
    
    return {"claim_id": claim.id, "status": claim.status, "fraud_score": claim.fraud_score}

@router.post("/missing-persons")
async def report_missing_person(mp_in: MissingPersonCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    mp = MissingPersonCase(
        reporter_id=current_user.id,
        event_id=mp_in.event_id,
        name=mp_in.name,
        age=mp_in.age,
        gender=mp_in.gender,
        status="missing"
    )
    db.add(mp)
    db.commit()
    db.refresh(mp)
    return mp

@router.get("/missing-persons")
def get_missing_persons(db: Session = Depends(get_db)):
    return db.query(MissingPersonCase).all()

@router.get("/relief-distribution")
def get_relief_distribution(db: Session = Depends(get_db)):
    return db.query(ReliefDistribution).all()
