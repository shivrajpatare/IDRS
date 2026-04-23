import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, MapPin, Activity, WifiOff } from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

export default function CitizenSOS() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'assigned'>('idle');
  const { isOffline, queueRequest } = useOfflineSync();

  const triggerSOS = () => {
    setStatus('pending');
    
    if (isOffline) {
      queueRequest({ lat: 13, lng: 80, injury_level: 'minor', zone_id: 1, event_id: 1 });
      setTimeout(() => setStatus('assigned'), 5000); // Simulate local state change
      return;
    }

    // Simulate websocket assign after 5s
    setTimeout(() => {
      setStatus('assigned');
    }, 5000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden relative">
      {isOffline && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-orange-600 text-white text-sm font-bold p-2 flex justify-center items-center gap-2">
          <WifiOff size={16} /> You are offline — SOS will queue and sync when reconnected.
        </div>
      )}
      <div className="absolute inset-0 bg-[url('https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/13/6000/3800.png')] opacity-30 bg-cover bg-center pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center justify-center flex-1 p-6">
        <h1 className="text-3xl font-bold mb-2">Emergency SOS</h1>
        <p className="text-gray-400 mb-12 text-center">Triggering SOS will alert the command center with your location.</p>

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.button
              key="sos-btn"
              onClick={triggerSOS}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-48 h-48 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.6)] relative"
            >
              <div className="absolute inset-0 rounded-full border-4 border-red-400 opacity-50 animate-ping" />
              <ShieldAlert size={64} className="text-white" />
            </motion.button>
          )}

          {status === 'pending' && (
            <motion.div
              key="sos-pending"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-48 h-48 rounded-full border-4 border-yellow-500 flex items-center justify-center relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-yellow-500/20"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(234, 179, 8, 0.8) 100%)' }}
                />
                <Activity size={48} className="text-yellow-500 z-10 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-500 mt-6">Locating Responders...</h2>
              <p className="text-gray-400 mt-2 text-center">Your distress signal has been received. Please stay in a safe location.</p>
            </motion.div>
          )}

          {status === 'assigned' && (
            <motion.div
              key="sos-assigned"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-gray-800 p-8 rounded-2xl border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)] flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
                <MapPin size={40} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-blue-400">Help is on the way</h2>
              <p className="text-gray-300 mt-2 text-center">NDRF Unit Alpha has been assigned.</p>
              <div className="mt-6 w-full bg-gray-900 rounded-lg p-4 flex justify-between items-center">
                <span className="text-gray-400">ETA</span>
                <span className="text-xl font-bold text-white">12 mins</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {status !== 'idle' && (
        <motion.div 
          initial={{ y: 100 }} animate={{ y: 0 }}
          className="z-10 bg-gray-900 border-t border-gray-800 p-6 flex gap-4 overflow-x-auto"
        >
          <div className="min-w-[250px] bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h3 className="text-blue-400 font-bold mb-1">Nearest Hospital</h3>
            <p className="text-white text-lg">Govt General Hospital</p>
            <p className="text-gray-400 text-sm mt-1">2.4 km away • 45 beds available</p>
          </div>
          <div className="min-w-[250px] bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h3 className="text-green-400 font-bold mb-1">Nearest Shelter</h3>
            <p className="text-white text-lg">Velachery Relief Camp</p>
            <p className="text-gray-400 text-sm mt-1">0.8 km away • 120 spots open</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
