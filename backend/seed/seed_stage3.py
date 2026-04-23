import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from models.database import SessionLocal, engine, Base
from models.reports import IncidentReport, VerificationResult
from models.recovery import AidClaim, MissingPersonCase, InfraStatus, ReliefDistribution
from core.verification import compute_credibility
from core.fraud import compute_fraud_score

def seed_stage3_data(db: Session):
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Seeding Stage 3 Data...")
    
    # 20 Reports (12 credible, 5 moderate, 3 flagged)
    reports = [
        # Credible
        {"zone_id": 1, "source": "gov", "desc": "Flood depth 4ft near Adyar bridge. Needs immediate evacuation.", "has_ev": True},
        {"zone_id": 1, "source": "ndma", "desc": "Road blocked at Mount Road.", "has_ev": True},
        {"zone_id": 2, "source": "verified_ngo", "desc": "Stranded families near coastal area.", "has_ev": True},
        {"zone_id": 3, "source": "gov", "desc": "Power lines down in sector 4.", "has_ev": True},
        # ... extending to 12
    ]
    
    for i in range(12):
        r = IncidentReport(event_id=1, reporter_id=1, zone_id=(i%3)+1, source_type="gov", description=f"Credible report {i}", lat=13.0, lng=80.2, has_evidence=True)
        db.add(r)
        db.commit()
        db.refresh(r)
        compute_credibility(db, r)
        
    for i in range(5):
        r = IncidentReport(event_id=1, reporter_id=1, zone_id=(i%3)+1, source_type="social", description=f"Moderate report {i}", lat=13.0, lng=80.2, has_evidence=False)
        db.add(r)
        db.commit()
        db.refresh(r)
        compute_credibility(db, r)
        
    for i in range(3):
        r = IncidentReport(event_id=1, reporter_id=1, zone_id=(i%3)+1, source_type="anonymous", description=f"Fake evacuation center location {i}", lat=13.0, lng=80.2, has_evidence=False)
        db.add(r)
        db.commit()
        db.refresh(r)
        compute_credibility(db, r)
        
    # Aid Claims (15 total)
    for i in range(15):
        claim = AidClaim(claimant_id=1, event_id=1, claim_type="Property Damage", amount_requested=5000, status="pending")
        db.add(claim)
        db.commit()
        db.refresh(claim)
        compute_fraud_score(db, claim, citizen_zone_id=1)
        
    # Missing Persons
    for i in range(6):
        mp = MissingPersonCase(reporter_id=1, event_id=1, name=f"Missing Person {i}", age=30, gender="M", status="missing")
        db.add(mp)
    for i in range(2):
        mp = MissingPersonCase(reporter_id=1, event_id=1, name=f"Found Person {i}", age=25, gender="F", status="found")
        db.add(mp)
        
    # Infra Status
    infra = [
        InfraStatus(event_id=1, zone_id=1, road_status="Damaged", power_status="Operational", water_status="Damaged", telecom_status="Operational"),
        InfraStatus(event_id=1, zone_id=2, road_status="Damaged", power_status="Damaged", water_status="Damaged", telecom_status="Damaged"),
        InfraStatus(event_id=1, zone_id=3, road_status="Operational", power_status="Restored", water_status="Damaged", telecom_status="Operational")
    ]
    db.add_all(infra)
    
    # Relief Distribution
    relief = [
        ReliefDistribution(event_id=1, zone_id=1, aid_type="food", quantity_delivered=60, quantity_needed=100),
        ReliefDistribution(event_id=1, zone_id=1, aid_type="medical", quantity_delivered=80, quantity_needed=100),
        ReliefDistribution(event_id=1, zone_id=2, aid_type="water", quantity_delivered=20, quantity_needed=100),
        ReliefDistribution(event_id=1, zone_id=3, aid_type="food", quantity_delivered=70, quantity_needed=100),
    ]
    db.add_all(relief)
    db.commit()
    
    print("Stage 3 Data Seeded Successfully!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_stage3_data(db)
    finally:
        db.close()
