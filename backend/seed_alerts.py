"""
seed_alerts.py — Seeds realistic IDRS demo alerts with the new CAP v1.2 schema.
"""
import sqlite3
from datetime import datetime, timedelta

conn = sqlite3.connect('idrs.db')
c = conn.cursor()

now = datetime.utcnow()

ALERTS = [
    {
        "headline": "Cyclone Amphan — Red Alert Issued",
        "message": "IMD has issued a Red Alert for coastal districts. Extreme wind speeds expected.",
        "severity_raw": "Extreme",
        "severity_normalized": "Critical",
        "source": "SACHET",
        "source_type": "official",
        "external_id": "SACHET-2026-001",
        "instruction": "Evacuate immediately to designated shelters.",
        "status": "published",
        "published_at": (now - timedelta(minutes=5)).isoformat(),
        "expires_at": (now + timedelta(hours=24)).isoformat(),
        "certainty": "Observed",
        "category": "Met",
        "area_desc": "Nagapattinam, Tamil Nadu"
    },
    {
        "headline": "Heavy Rainfall — Orange Alert",
        "message": "Intense precipitation (>15cm) forecasted for Chennai metropolitan area.",
        "severity_raw": "Severe",
        "severity_normalized": "Severe",
        "source": "SACHET",
        "source_type": "official",
        "external_id": "SACHET-2026-002",
        "instruction": "Avoid low-lying areas. Stock 3-day supplies.",
        "status": "published",
        "published_at": (now - timedelta(minutes=15)).isoformat(),
        "expires_at": (now + timedelta(hours=12)).isoformat(),
        "certainty": "Likely",
        "category": "Met",
        "area_desc": "Chennai, Tamil Nadu"
    }
]

c.execute("DELETE FROM alerts")

for a in ALERTS:
    c.execute("""
        INSERT INTO alerts (
            headline, message, severity_raw, severity_normalized, source, source_type, 
            external_id, instruction, status, published_at, expires_at, certainty, 
            category, area_desc, is_active
        ) VALUES (
            :headline, :message, :severity_raw, :severity_normalized, :source, :source_type, 
            :external_id, :instruction, :status, :published_at, :expires_at, :certainty, 
            :category, :area_desc, 1
        )
    """, a)

conn.commit()
print(f"Seeded {len(ALERTS)} alerts with new schema.")
conn.close()
