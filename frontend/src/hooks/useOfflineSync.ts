import { useState, useEffect } from 'react';

export function useOfflineSync() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [queuedSos, setQueuedSos] = useState<any[]>([]);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      syncQueue();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Load queue from IndexedDB/localStorage
    const stored = localStorage.getItem('idrs-sos-queue');
    if (stored) {
      setQueuedSos(JSON.parse(stored));
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const queueRequest = (request: any) => {
    const newQueue = [...queuedSos, request];
    setQueuedSos(newQueue);
    localStorage.setItem('idrs-sos-queue', JSON.stringify(newQueue));
  };

  const syncQueue = async () => {
    const queue = JSON.parse(localStorage.getItem('idrs-sos-queue') || '[]');
    if (queue.length === 0) return;

    for (const req of queue) {
      try {
        await fetch('http://localhost:8000/api/v1/citizen/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req)
        });
      } catch (e) {
        console.error("Failed to sync", e);
        return; // Stop if still failing
      }
    }
    
    // Clear queue if all succeeded
    setQueuedSos([]);
    localStorage.removeItem('idrs-sos-queue');
    // Ideally emit a toast notification here
  };

  return { isOffline, queueRequest, queuedSosCount: queuedSos.length };
}
