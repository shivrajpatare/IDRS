import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from models.database import Base, get_db
from models.users import User, Role
from core.auth import get_password_hash
from models.domain import DisasterEvent, Zone, Facility
from models.operations import ResourceUnit, SOSRequest
from models.audit import AuditLog

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_stage2.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create roles and users
    citizen_role = Role(name="citizen", permissions_json={})
    admin_role = Role(name="admin", permissions_json={})
    db.add_all([citizen_role, admin_role])
    db.commit()
    
    cit_user = User(email="cit@test.com", role_id=citizen_role.id, hashed_password=get_password_hash("pass"))
    adm_user = User(email="adm@test.com", role_id=admin_role.id, hashed_password=get_password_hash("pass"))
    db.add_all([cit_user, adm_user])
    db.commit()
    
    # Create zone and event
    zone = Zone(name="TestZone", admin_level="Ward")
    event = DisasterEvent(title="TestFlood", current_phase="MID_DISASTER")
    db.add_all([zone, event])
    db.commit()
    
    # Create resource and facility
    unit = ResourceUnit(name="TestUnit1", type="ambulance", current_zone_id=zone.id, current_lat=13.0, current_lng=80.2)
    fac = Facility(name="TestHosp1", type="hospital", lat=13.01, lng=80.21, zone_id=zone.id)
    db.add_all([unit, fac])
    db.commit()
    
    yield
    Base.metadata.drop_all(bind=engine)

def get_auth_token(email, password="pass"):
    response = client.post("/api/v1/auth/token", data={"username": email, "password": password})
    return response.json()["access_token"]

def test_create_sos():
    token = get_auth_token("cit@test.com")
    response = client.post(
        "/api/v1/citizen/sos",
        headers={"Authorization": f"Bearer {token}"},
        json={"lat": 13.0, "lng": 80.2, "injury_level": "critical", "event_id": 1, "zone_id": 1}
    )
    assert response.status_code == 200 # POST returning 200 is default in FastAPI unless 201 explicit
    data = response.json()
    assert data["priority_score"] >= 1.0
    assert data["status"] == "pending"

def test_command_sos_queue():
    token = get_auth_token("adm@test.com")
    # Make another SOS to ensure sorting
    cit_token = get_auth_token("cit@test.com")
    client.post(
        "/api/v1/citizen/sos",
        headers={"Authorization": f"Bearer {cit_token}"},
        json={"lat": 13.0, "lng": 80.2, "injury_level": "minor", "event_id": 1, "zone_id": 1}
    )
    
    response = client.get("/api/v1/command/sos", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    queue = response.json()
    assert len(queue) == 2
    assert queue[0]["priority_score"] >= queue[1]["priority_score"]

def test_assign_sos():
    token = get_auth_token("adm@test.com")
    response = client.post(
        "/api/v1/command/sos/1/assign",
        headers={"Authorization": f"Bearer {token}"},
        json={"unit_id": 1}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "assigned"
    
    # Check audit log
    db = TestingSessionLocal()
    logs = db.query(AuditLog).filter(AuditLog.event_type == "sos.assigned").all()
    assert len(logs) == 1

def test_nearby_hospitals():
    token = get_auth_token("cit@test.com")
    response = client.get("/api/v1/citizen/nearby-hospitals?lat=13.0&lng=80.2", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_map_incidents():
    response = client.get("/api/v1/map/incidents")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
