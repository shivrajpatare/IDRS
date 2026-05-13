import { useState, useEffect } from 'react';
import api from '../lib/axios';

export type DisasterPhase = 'PRE_DISASTER' | 'MID_DISASTER' | 'POST_DISASTER';

export interface PhaseMetrics {
  active_alerts: number;
  pending_sos: number;
  active_events: number;
}

export interface PhaseContext {
  current_phase: DisasterPhase;
  timestamp: string;
  metrics: PhaseMetrics;
}

export function usePhase() {
  const [context, setContext] = useState<PhaseContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhase = async () => {
    try {
      const res = await api.get('/phase');
      setContext(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch phase context", err);
      setError("Network error fetching system state.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhase();
    const interval = setInterval(fetchPhase, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  return { 
    phase: context?.current_phase || 'PRE_DISASTER', 
    metrics: context?.metrics,
    context, 
    loading, 
    error, 
    refetch: fetchPhase 
  };
}
