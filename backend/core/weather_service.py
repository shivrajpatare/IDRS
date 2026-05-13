import httpx
import logging
from datetime import datetime, timedelta
from .settings import settings

logger = logging.getLogger(__name__)

# Cache for weather data
_weather_cache = {}
CACHE_TTL = timedelta(minutes=15)

async def get_weather_data(lat: float, lon: float):
    """
    Fetch current weather and 5-day forecast from OpenWeatherMap.
    """
    cache_key = f"{lat}:{lon}"
    now = datetime.utcnow()
    
    if cache_key in _weather_cache:
        data, expiry = _weather_cache[cache_key]
        if now < expiry:
            return data

    api_key = settings.openweather_api_key
    if not api_key:
        logger.warning("OPENWEATHER_API_KEY not found. Returning mock data.")
        return get_mock_weather(lat, lon)

    try:
        async with httpx.AsyncClient() as client:
            # Current Weather
            current_url = "https://api.openweathermap.org/data/2.5/weather"
            current_res = await client.get(current_url, params={
                "lat": lat, "lon": lon, "appid": api_key, "units": "metric"
            })
            
            # 5-day Forecast
            forecast_url = "https://api.openweathermap.org/data/2.5/forecast"
            forecast_res = await client.get(forecast_url, params={
                "lat": lat, "lon": lon, "appid": api_key, "units": "metric"
            })

            if current_res.status_code == 200:
                curr_data = current_res.json()
                fore_data = forecast_res.json() if forecast_res.status_code == 200 else {"list": []}
                
                weather_info = {
                    "temp": curr_data["main"]["temp"],
                    "condition": curr_data["weather"][0]["main"],
                    "humidity": curr_data["main"]["humidity"],
                    "wind": f"{curr_data['wind']['speed']} m/s",
                    "forecast": fore_data.get("list", [])[:8], # Next 24 hours (3h intervals)
                    "source": "OpenWeatherMap",
                    "updated_at": now.isoformat()
                }
                
                _weather_cache[cache_key] = (weather_info, now + CACHE_TTL)
                return weather_info
                
    except Exception as e:
        logger.error(f"OpenWeatherMap API error: {e}")
    
    return get_mock_weather(lat, lon)

def get_mock_weather(lat: float, lon: float):
    return {
        "temp": 30.5,
        "condition": "Partly Cloudy",
        "humidity": 70,
        "wind": "5 m/s",
        "source": "Mock System (Fallback)",
        "updated_at": datetime.utcnow().isoformat()
    }
