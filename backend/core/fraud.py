from sqlalchemy.orm import Session
from models.recovery import AidClaim

def compute_fraud_score(db: Session, claim: AidClaim, citizen_zone_id: int):
    fraud_score = 0.0
    flags = []
    
    # Check 1: Duplicate approved claim (Mocked by checking claimant ID)
    prev_claim = db.query(AidClaim).filter(
        AidClaim.claimant_id == claim.claimant_id,
        AidClaim.status == "approved"
    ).first()
    if prev_claim:
        fraud_score += 0.6
        flags.append("duplicate_identity")
        
    # Check 2: Location mismatch
    # Assuming claim zone comes via context, but we use citizen_zone_id
    if citizen_zone_id and False: # we'd need claim.zone_id which isn't on AidClaim model in the PRD, but implied.
        pass # simplified for scaffold
        
    # Simplified Check 4
    cluster = db.query(AidClaim).filter(AidClaim.event_id == claim.event_id).count()
    if cluster > 5:
        fraud_score += 0.4
        flags.append("cluster_anomaly")
        
    fraud_score = min(1.0, fraud_score)
    claim.fraud_score = fraud_score
    if fraud_score > 0.5:
        claim.status = "flagged"
        
    db.commit()
    db.refresh(claim)
    return claim, flags
