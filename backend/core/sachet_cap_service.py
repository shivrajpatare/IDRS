import httpx
import xml.etree.ElementTree as ET
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from models.domain import Alert, DisasterEvent
from .normalizer import normalize_severity

logger = logging.getLogger(__name__)

CAP_DETAIL_URL = "https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile"

async def fetch_and_upsert_cap(identifier: str, db: Session, event_id: int):
    """
    Fetches CAP XML for a given identifier, handles ETags, and upserts to DB.
    """
    # Get existing alert for ETag
    existing = db.query(Alert).filter(Alert.external_id == identifier).first()
    etag = existing.etag if existing else None
    
    headers = {"User-Agent": "Mozilla/5.0"}
    if etag:
        headers["If-None-Match"] = etag
        
    try:
        async with httpx.AsyncClient(verify=False) as client:
            params = {"identifier": identifier}
            response = await client.get(CAP_DETAIL_URL, params=params, headers=headers, timeout=10.0)
            
            if response.status_code == 304:
                logger.info(f"Alert {identifier} unchanged (304).")
                if existing:
                    existing.last_seen_at = datetime.utcnow()
                    db.commit()
                return
                
            if response.status_code == 200:
                new_etag = response.headers.get("ETag")
                parse_and_save_cap(response.text, identifier, new_etag, db, event_id)
                logger.info(f"Upserted alert {identifier} (200).")
            else:
                logger.error(f"Failed to fetch CAP for {identifier}: HTTP {response.status_code}")
                
    except Exception as e:
        logger.error(f"CAP Detail Service Error for {identifier}: {e}")

def parse_and_save_cap(xml_content: str, identifier: str, etag: str, db: Session, event_id: int):
    """Parses CAP XML and saves to DB."""
    try:
        # Simple CAP v1.2 parsing
        # Note: CAP uses namespaces, but often we can find tags directly or strip NS
        root = ET.fromstring(xml_content)
        
        # Strip namespace for easier access
        for el in root.iter():
            if '}' in el.tag:
                el.tag = el.tag.split('}', 1)[1]
        
        info = root.find("info")
        if info is None: return
        
        headline = info.findtext("headline", "No Headline")
        description = info.findtext("description", "")
        instruction = info.findtext("instruction", "")
        severity_raw = info.findtext("severity", "Unknown")
        certainty = info.findtext("certainty", "Unknown")
        category = info.findtext("category", "General")
        area_desc = info.find("area").findtext("areaDesc", "") if info.find("area") is not None else ""
        
        expires_str = info.findtext("expires")
        expires_at = datetime.fromisoformat(expires_str.replace('Z', '+00:00')) if expires_str else None
        
        effective_str = info.findtext("effective")
        effective_at = datetime.fromisoformat(effective_str.replace('Z', '+00:00')) if effective_str else None

        # Upsert
        existing = db.query(Alert).filter(Alert.external_id == identifier).first()
        
        alert_data = {
            "event_id": event_id,
            "external_id": identifier,
            "source": "SACHET",
            "source_type": "official",
            "headline": headline,
            "message": description,
            "instruction": instruction,
            "severity_raw": severity_raw,
            "severity_normalized": normalize_severity(severity_raw),
            "certainty": certainty,
            "category": category,
            "area_desc": area_desc,
            "effective_at": effective_at,
            "expires_at": expires_at,
            "etag": etag,
            "last_seen_at": datetime.utcnow(),
            "status": "published",
            "is_active": True
        }
        
        if existing:
            for key, value in alert_data.items():
                setattr(existing, key, value)
        else:
            new_alert = Alert(**alert_data)
            db.add(new_alert)
            
        db.commit()
    except Exception as e:
        logger.error(f"Error parsing CAP XML: {e}")
        db.rollback()
