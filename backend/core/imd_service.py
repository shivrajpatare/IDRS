import httpx
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Simple In-Memory Cache (Architecture ready for Redis replacement)
_WEATHER_CACHE = {}
CACHE_TTL = 900 # 15 minutes

async def get_imd_weather(station_id: str = "43279"):
    """
    Fetch weather from IMD official API with caching and fallback.
    """
    now = datetime.utcnow()
    
    # 1. Check Cache
    if station_id in _WEATHER_CACHE:
        data, expiry = _WEATHER_CACHE[station_id]
        if now < expiry:
            logger.info(f"Using cached weather for {station_id}")
            return data

    # 2. Try Official IMD API
    # Note: Using the specific URL from the documentation
    url = f"https://mausam.imd.gov.in/api/current_wx_api.php?id={station_id}"
    
    try:
        async with httpx.AsyncClient(verify=False) as client:
            headers = {"User-Agent": "Mozilla/5.0"}
            response = await client.get(url, timeout=10.0, headers=headers)
            
            if response.status_code == 200:
                raw_data = response.json()
                # Transformation logic based on IMD JSON structure
                weather_data = {
                    "temp": float(raw_data.get('temp', 32)),
                    "condition": raw_data.get('weather_desc', 'Partly Cloudy'),
                    "humidity": raw_data.get('humidity', 70),
                    "wind": f"{raw_data.get('wind_speed', 10)} km/h {raw_data.get('wind_dir', 'N')}",
                    "visibility": "10 km",
                    "source": "imd_api",
                    "last_updated": now.isoformat()
                }
                
                # Update Cache
                _WEATHER_CACHE[station_id] = (weather_data, now + timedelta(seconds=CACHE_TTL))
                return weather_data
            else:
                logger.warning(f"IMD API returned {response.status_code}. Using fallback.")
                
    except Exception as e:
        logger.error(f"IMD API Error: {e}")

    # 3. Fallback Logic
    # Return cached value even if expired if API fails
    if station_id in _WEATHER_CACHE:
        data, _ = _WEATHER_CACHE[station_id]
        data["source"] = "cached_imd"
        return data

    # 4. Final Mock Fallback
    return {
        "temp": 32,
        "condition": "Partly Cloudy",
        "humidity": 80,
        "wind": "12 km/h NE",
        "visibility": "8 km",
        "source": "fallback",
        "last_updated": now.isoformat()
    }
