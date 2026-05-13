import { useState } from 'react';
import api from '../lib/axios';

interface Coordinate {
  lat: number;
  lng: number;
}

interface RouteResponse {
  geometry: any; // GeoJSON LineString
  distanceMeters: number;
  durationSeconds: number;
}

export function useRoute() {
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoute = async (origin: Coordinate, destination: Coordinate, profile: string = "driving-car") => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<RouteResponse>('/routing/route', {
        origin,
        destination,
        profile
      });
      setRouteData(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching route:', err);
      const errMsg = err.response?.data?.detail || 'Failed to fetch route. Please try again.';
      setError(errMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearRoute = () => {
    setRouteData(null);
    setError(null);
  };

  return { routeData, loading, error, fetchRoute, clearRoute };
}
