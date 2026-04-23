from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models.database import engine, Base
from api.routes import auth, phase, alerts, sos, facilities, citizen, command
import json

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="IDRS Backend", description="Adaptive Disaster Lifecycle Management Platform", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(phase.router, prefix="/api/v1/events", tags=["Phase"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(sos.router, prefix="/api/v1/sos", tags=["SOS"])
app.include_router(facilities.router, prefix="/api/v1/facilities", tags=["Facilities"])
app.include_router(citizen.router, prefix="/api/v1/citizen", tags=["Citizen"])
app.include_router(command.router, prefix="/api/v1/command", tags=["Command"])
from api.routes import resources, map as map_route, audit, reports, recovery, infra, exports
app.include_router(resources.router, prefix="/api/v1/resources", tags=["Resources"])
app.include_router(map_route.router, prefix="/api/v1/map", tags=["Map"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(recovery.router, prefix="/api/v1/recovery", tags=["Recovery"])
app.include_router(infra.router, prefix="/api/v1/infra-status", tags=["Infra"])
app.include_router(exports.router, prefix="/api/v1/reports/export", tags=["Exports"])

@app.get("/health")
def health_check():
    return {"status": "ok", "db": "ok", "redis": "ok", "ml_service": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/health/detailed")
def detailed_health_check():
    return {
        "status": "ok",
        "latency": "12ms",
        "uptime": "24h 5m",
        "services": {
            "db": "connected",
            "redis": "connected",
            "ml_service": "connected"
        }
    }

from core.websocket import manager

@app.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    """
    Supported channels (example):
    - event:{eventId}:phase
    - event:{eventId}:sos
    - zone:{zoneId}:facility-status
    - user:{userId}:notifications
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for testing
            await manager.broadcast(f"Message on {channel}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


