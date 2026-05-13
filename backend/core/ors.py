import os
import httpx
from typing import Dict, Any, Tuple
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

ORS_BASE_URL = os.getenv("ORS_BASE_URL", "https://api.openrouteservice.org")
ORS_API_KEY = os.getenv("ORS_API_KEY")

async def get_route(origin: Tuple[float, float], destination: Tuple[float, float], profile: str = "driving-car") -> Dict[str, Any]:
    """
    Fetch routing data from OpenRouteService.
    Origin and destination must be tuples of (lng, lat) for GeoJSON standards, 
    but we take them as (lat, lng) and convert for ORS.
    """
    if not ORS_API_KEY:
        logger.error("ORS_API_KEY is not set.")
        raise HTTPException(status_code=503, detail="Routing service configuration error.")

    # ORS expects coordinates in [lng, lat] format
    ors_coords = [
        [origin[1], origin[0]],
        [destination[1], destination[0]]
    ]
    
    url = f"{ORS_BASE_URL}/v2/directions/{profile}/geojson"
    headers = {
        "Authorization": ORS_API_KEY,
        "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        "Content-Type": "application/json; charset=utf-8"
    }
    payload = {
        "coordinates": ors_coords
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                if "features" in data and len(data["features"]) > 0:
                    feature = data["features"][0]
                    # We return the route geometry and summary
                    return {
                        "geometry": feature.get("geometry"),
                        "distanceMeters": feature.get("properties", {}).get("summary", {}).get("distance", 0),
                        "durationSeconds": feature.get("properties", {}).get("summary", {}).get("duration", 0)
                    }
                else:
                    raise HTTPException(status_code=404, detail="No route found between coordinates.")
            elif response.status_code == 429:
                logger.warning("ORS API rate limit exceeded.")
                raise HTTPException(status_code=429, detail="Routing service rate limited. Try again later.")
            else:
                logger.error(f"ORS API error {response.status_code}: {response.text}")
                raise HTTPException(status_code=503, detail="Routing service unavailable.")
        except httpx.RequestError as e:
            logger.error(f"ORS Request Error: {e}")
            raise HTTPException(status_code=503, detail="Routing service unreachable.")
