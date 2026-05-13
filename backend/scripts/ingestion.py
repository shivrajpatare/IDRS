import asyncio
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from models.database import SessionLocal
from models.domain import IngestionRun, DisasterEvent, Alert
from core.sachet_feed_service import fetch_alert_identifiers
from core.sachet_cap_service import fetch_and_upsert_cap

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def orchestrate_ingestion():
    start_time = datetime.utcnow()
    db: Session = SessionLocal()
    
    # 1. Log Ingestion Start
    run_log = IngestionRun(source="SACHET_NDMA", started_at=start_time, status="running")
    db.add(run_log)
    db.commit()
    db.refresh(run_log)

    try:
        # 2. Find/Create Active Event
        event = db.query(DisasterEvent).filter(DisasterEvent.status == "active").first()
        if not event:
            event = DisasterEvent(title="Active Monitoring Cycle", disaster_type="General", severity="Moderate")
            db.add(event)
            db.commit()
            db.refresh(event)

        # 3. Discover New Identifiers
        identifiers = await fetch_alert_identifiers()
        
        # --- FALLBACK LOGIC ---
        if not identifiers:
            logger.warning("No official alerts found from SACHET. Generating synthetic demo alerts...")
            from datetime import timedelta
            now = datetime.utcnow()
            
            # Create a synthetic demo alert if none exist in the last hour
            last_alert = db.query(Alert).order_by(Alert.published_at.desc()).first()
            if not last_alert or (now - last_alert.published_at) > timedelta(hours=1):
                demo_alert = Alert(
                    event_id=event.id,
                    headline="Simulated Flash Flood Warning: Sector 4",
                    message="Heavy localized rainfall detected via synthetic monitoring. Potential for flooding in Adyar basin.",
                    severity_raw="Severe",
                    severity_normalized="Critical",
                    source="IDRS_SIMULATOR",
                    source_type="fallback",
                    status="published",
                    published_at=now,
                    expires_at=now + timedelta(hours=6),
                    certainty="Likely",
                    lat=13.01,
                    lng=80.25,
                    is_active=True
                )
                db.add(demo_alert)
                db.commit()
                logger.info("Synthetic demo alert injected.")
        # ----------------------

        run_log.fetched_count = len(identifiers)
        logger.info(f"Discovered {len(identifiers)} alert identifiers from SACHET.")

        # 4. Process Each Alert (Sequential to avoid rate limits, or use limited Semaphore)
        for identifier in identifiers:
            await fetch_and_upsert_cap(identifier, db, event.id)

        # 5. Expire Old Alerts
        # Any alert not updated/seen in the last hour and whose expires_at is in the past
        now = datetime.utcnow()
        expired_count = db.query(Alert).filter(
            Alert.is_active == True,
            Alert.expires_at < now
        ).update({"is_active": False, "status": "expired"})
        
        logger.info(f"Marked {expired_count} alerts as expired.")

        # 6. Finalize Log
        run_log.status = "success"
        run_log.finished_at = datetime.utcnow()
        db.commit()
        
    except Exception as e:
        logger.error(f"Ingestion Orchestration Failed: {e}")
        db.rollback()
        run_log.status = "failed"
        run_log.error_message = str(e)
        run_log.finished_at = datetime.utcnow()
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(orchestrate_ingestion())
