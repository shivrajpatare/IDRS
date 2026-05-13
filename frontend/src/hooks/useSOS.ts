import { useState, useEffect } from 'react';
import api from '../lib/axios';

export interface SOSRequest {
  id: number;
  citizen_id: number;
  lat: number;
  lng: number;
  injury_level: string;
  priority_score: number;
  status: string;
  reported_at: string;
  message?: string;
}

export function useSOS() {
  const [sosQueue, setSosQueue] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSOS = async () => {
    try {
      const res = await api.get('/command/sos');
      setSosQueue(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch SOS queue", err);
      setError("Failed to sync SOS queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOS(); // Initial fetch
    
    // Connect to WebSocket for real-time updates
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/global';
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.channel && data.channel.includes('sos')) {
          const newSos = data.payload;
          setSosQueue(prev => {
            // Avoid duplicates
            if (prev.find(s => s.id === newSos.id)) return prev;
            // Add to top of queue and sort by priority
            const updated = [newSos, ...prev];
            return updated.sort((a, b) => b.priority_score - a.priority_score);
          });
        }
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    ws.onclose = () => {
      console.log("WS connection closed. Fallback to polling.");
      // Fallback polling if WS drops
      const interval = setInterval(fetchSOS, 10000);
      return () => clearInterval(interval);
    };

    return () => {
      ws.close();
    };
  }, []);

  return { sosQueue, loading, error, refetch: fetchSOS };
}
