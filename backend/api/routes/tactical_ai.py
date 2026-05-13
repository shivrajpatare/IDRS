"""
AI Tactical Advisor — Powered by Gemini 2.5 Flash
Synthesizes live disaster data into real-time tactical recommendations.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

def _get_gemini_url():
    key = os.getenv("GEMINI_API_KEY", "")
    return key, f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"

SYSTEM_PROMPT = """You are IDRS Tactical AI — a military-grade disaster response intelligence system for India's National Disaster Management Authority (NDMA). You analyze real-time disaster data and produce tactical briefings.

RULES:
- Respond ONLY in valid JSON format with exactly this structure:
{
  "threat_level": "LOW|MODERATE|ELEVATED|CRITICAL",
  "briefing": "A 2-3 sentence tactical situational summary",
  "recommendations": [
    {"priority": "CRITICAL|HIGH|MEDIUM|LOW", "action": "Specific tactical action in 1-2 sentences"}
  ],
  "confidence": 85
}
- Generate exactly 3-5 recommendations sorted by priority (CRITICAL first)
- Be specific: mention sector numbers, coordinates, unit types, and time estimates
- Use military-style language: "Deploy", "Evacuate", "Lock down", "Reroute", "Establish perimeter"
- confidence is 0-100 based on data completeness
- Do NOT wrap JSON in markdown code fences. Return raw JSON only."""


class TacticalRequest(BaseModel):
    alerts: list = []
    sos_queue: list = []
    phase: str = "PRE_DISASTER"
    weather: dict | None = None
    asset_count: int = 4
    personnel_count: int = 4


@router.post("/analyze")
async def analyze_situation(req: TacticalRequest):
    api_key, gemini_url = _get_gemini_url()
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    # Build context from live data
    context_parts = []
    context_parts.append(f"SYSTEM PHASE: {req.phase}")
    context_parts.append(f"ACTIVE SOS DISTRESS SIGNALS: {len(req.sos_queue)}")
    
    if req.sos_queue:
        for i, sos in enumerate(req.sos_queue[:5]):
            context_parts.append(
                f"  SOS-{i+1}: Coords ({sos.get('lat', 'N/A')}, {sos.get('lng', 'N/A')}), "
                f"Injury: {sos.get('injury_level', 'unknown')}, Priority: {sos.get('priority_score', 'N/A')}"
            )
    
    context_parts.append(f"ACTIVE WEATHER ALERTS: {len(req.alerts)}")
    if req.alerts:
        for a in req.alerts[:5]:
            context_parts.append(f"  Alert: {a.get('headline', 'N/A')} — Severity: {a.get('severity_normalized', 'N/A')}")
    
    if req.weather:
        context_parts.append(f"WEATHER: {req.weather.get('condition', 'N/A')}, Temp: {req.weather.get('temp', 'N/A')}°C, Wind: {req.weather.get('wind', 'N/A')}")
    
    context_parts.append(f"AVAILABLE ASSETS: {req.asset_count} units")
    context_parts.append(f"PERSONNEL ON DUTY: {req.personnel_count} officers")
    
    data_context = "\n".join(context_parts)
    
    prompt = f"""Analyze this real-time disaster intelligence and produce a tactical briefing:

{data_context}

Produce your tactical analysis now. Remember: respond ONLY in raw JSON, no markdown."""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                gemini_url,
                json={
                    "contents": [
                        {"role": "user", "parts": [{"text": SYSTEM_PROMPT}]},
                        {"role": "model", "parts": [{"text": "Understood. I am IDRS Tactical AI. Send me the situation data and I will respond with a JSON tactical briefing."}]},
                        {"role": "user", "parts": [{"text": prompt}]}
                    ],
                    "generationConfig": {
                        "temperature": 0.1,
                        "maxOutputTokens": 2048
                    }
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Gemini API error: {response.status_code}")
            
            result = response.json()
            text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
            
            # Sanitize: Remove markdown fences if Gemini ignored instructions
            if text.startswith("```"):
                lines = text.splitlines()
                if len(lines) > 2:
                    # Remove first line (```json) and last line (```)
                    text = "\n".join(lines[1:-1]).strip()
            
            try:
                parsed = json.loads(text)
                return parsed
            except json.JSONDecodeError:
                raise
            
    except json.JSONDecodeError:
        # If Gemini returns non-JSON, return a fallback
        return {
            "threat_level": "MODERATE",
            "briefing": "AI analysis temporarily degraded. Using rule-based fallback. Monitor all data streams manually.",
            "recommendations": [
                {"priority": "MEDIUM", "action": "Maintain vigilance on all active SOS signals. Verify satellite uplink stability."},
                {"priority": "LOW", "action": "All systems nominal. Continue standard monitoring protocol."}
            ],
            "confidence": 50
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Tactical AI error: {str(e)}")
