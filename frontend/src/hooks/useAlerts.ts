import { useState, useEffect } from 'react';
import api from '../lib/axios';

export interface Alert {
  id: number;
  headline: string;
  message: string;
  severity: string;
  source: string;
  status: string;
  published_at?: string;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'live' | 'cached' | 'delayed'>('live');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts/');
      setAlerts(res.data);
      const now = new Date();
      setLastSyncedAt(now);
      setSyncStatus('live');
      setError(null);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
      setError("Connection error. Showing last known data.");
      setSyncStatus('cached');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkDelay = () => {
      if (lastSyncedAt && (new Date().getTime() - lastSyncedAt.getTime() > 900000)) { // 15 mins
        setSyncStatus('delayed');
      }
    };
    const interval = setInterval(checkDelay, 60000);
    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Poll every 10s for real-time feel
    return () => clearInterval(interval);
  }, []);

  return { alerts, loading, error, syncStatus, lastSyncedAt, refetch: fetchAlerts };
}
