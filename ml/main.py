from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import random

app = FastAPI(title="IDRS ML Service")

class SOSScoreInput(BaseModel):
    injury_level: str
    zone_id: int
    lat: float
    lng: float
    created_at: str

class CredibilityInput(BaseModel):
    text: str
    source_type: str
    lat: float
    lng: float
    reported_at: str
    has_evidence: bool

class FraudInput(BaseModel):
    citizen_id: int
    zone_id: int
    claim_type: str
    lat: float
    lng: float
    submitted_at: str

class ReportItem(BaseModel):
    id: int
    lat: float
    lng: float
    reported_at: str
    text: str

class ClusterInput(BaseModel):
    reports: List[ReportItem]

class MatchInput(BaseModel):
    name: str
    age: int
    gender: str
    last_seen_zone: int

@app.post("/score/sos-priority")
def score_sos(input_data: SOSScoreInput):
    base = 2.0
    if input_data.injury_level.lower() == "critical":
        base += 2.0
    return {
        "priority_score": min(5.0, base + random.uniform(0.1, 0.9)),
        "reasoning": "High injury severity detected."
    }

@app.post("/score/credibility")
def score_credibility(input_data: CredibilityInput):
    score = 0.5
    if input_data.source_type in ["gov", "ndma"]:
        score = 0.9
    elif input_data.has_evidence:
        score += 0.2
    
    score = min(1.0, score + random.uniform(-0.1, 0.1))
    return {
        "credibility_score": score,
        "is_flagged": score < 0.35,
        "explanation": "Scored based on source reputation and evidence."
    }

@app.post("/score/fraud")
def score_fraud(input_data: FraudInput):
    score = random.uniform(0.1, 0.8)
    flags = []
    if score > 0.5:
        flags.append("cluster_anomaly")
    return {
        "fraud_score": score,
        "flags": flags,
        "requires_review": score > 0.5
    }

@app.post("/cluster/reports")
def cluster_reports(input_data: ClusterInput):
    # Mock clustering
    if not input_data.reports:
        return {"clusters": []}
    return {
        "clusters": [{
            "cluster_id": "C-001",
            "report_ids": [r.id for r in input_data.reports],
            "center": [input_data.reports[0].lat, input_data.reports[0].lng],
            "severity": "high"
        }]
    }

@app.post("/match/missing-person")
def match_missing_person(input_data: MatchInput):
    # Mock matching
    return {
        "matches": [{
            "person_id": random.randint(1, 100),
            "confidence": random.uniform(0.6, 0.99),
            "found_location": "Relief Camp Alpha"
        }]
    }
