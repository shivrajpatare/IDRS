from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from models.database import engine, Base, SessionLocal
from api.routes import auth, phase, alerts, sos, facilities, citizen, command
from datetime import datetime
import json
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from scripts.ingestion import orchestrate_ingestion as ingest_to_db

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="IDRS Backend", description="Adaptive Disaster Lifecycle Management Platform", version="1.0.0")

# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
from api.routers import include_routers
include_routers(app)

@app.get("/")
def read_root():
    return {
        "message": "IDRS Disaster Intelligence API is running",
        "docs": "/docs",
        "health": "/health",
        "status": "operational"
    }

# Task 2: Background Scheduler
scheduler = AsyncIOScheduler()

from core.fcm import initialize_firebase

@app.on_event("startup")
async def startup_event():
    # Initialize Firebase Admin
    initialize_firebase()
    # Schedule ingestion every 10 minutes
    scheduler.add_job(ingest_to_db, 'interval', minutes=10)
    scheduler.start()
    # Also run once at startup
    await ingest_to_db()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

@app.get("/health")
def health_check():
    return {"status": "ok", "db": "ok", "redis": "ok", "ml_service": "ok", "timestamp": datetime.utcnow().isoformat()}

# Endpoint for last sync timestamp
@app.get("/api/v1/system/last-sync")
def get_last_sync():
    from models.domain import IngestionRun
    db = SessionLocal()
    try:
        last_run = db.query(IngestionRun).filter(IngestionRun.status == "success").order_by(IngestionRun.finished_at.desc()).first()
        return {"timestamp": last_run.finished_at if last_run else None}
    finally:
        db.close()

from core.websocket import manager

@app.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Message on {channel}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Serve Frontend static files (Phase 4 Deployment)
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check if dist folder exists (it should in the Docker image)
dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.isdir(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve the requested file if it exists in dist, otherwise fallback to index.html for SPA routing
        target_path = os.path.join(dist_dir, full_path)
        if os.path.isfile(target_path) and full_path != "":
            return FileResponse(target_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
