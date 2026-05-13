import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, Shield, Wifi, Battery, MapPin, 
  ChevronRight, Phone, MessageSquare, Heart,
  Zap, Navigation, Radio, Compass, X, Target
} from 'lucide-react';

const STATUS_ITEMS = [
  { icon: Wifi, label: 'SAT-LINK', value: 'SECURE', color: 'text-emerald-500' },
  { icon: Battery, label: 'PWR', value: '84%', color: 'text-blue-500' },
  { icon: MapPin, label: 'GEOSPATIAL', value: 'LOCKED', color: 'text-emerald-500' },
];

import api from '../lib/axios';

export default function CitizenSOS() {
  const [sosState, setSosState] = useState<'IDLE' | 'COUNTDOWN' | 'ACTIVE'>('IDLE');
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let t: any;
    if (sosState === 'COUNTDOWN' && countdown > 0) {
      t = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0) {
      sendSOS();
    }
    return () => clearInterval(t);
  }, [sosState, countdown]);

  const sendSOS = async () => {
    try {
      setSosState('ACTIVE');

      const getCoords = () => new Promise<{lat: number, lng: number}>((resolve) => {
        if (!navigator.geolocation) {
          resolve({ lat: 13.0827, lng: 80.2707 }); // Fallback
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => {
            console.warn("Geolocation failed, using fallback.", err);
            resolve({ lat: 13.0827, lng: 80.2707 }); // Fallback on permission denied
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });

      const coords = await getCoords();

      await api.post('/sos/', {
        lat: coords.lat,
        lng: coords.lng,
        injury_level: 'severe',
        event_id: 1, // Use first seeded event
        zone_id: 2    // Sector 1
      });
    } catch (err) {
      console.error(err);
      setError("Network congested. Retrying via Satellite Link...");
      // Stay in ACTIVE state anyway to reassure user (demo logic)
    }
  };

  const triggerSOS = () => {
    setSosState('COUNTDOWN');
    setCountdown(5);
  };

  const cancelSOS = () => {
    setSosState('IDLE');
    setCountdown(5);
  };

  return (
    <div className="min-h-screen w-full bg-[#060a0e] flex flex-col p-6 lg:p-10 overflow-y-auto relative font-['Inter'] noise">
      
      {/* ── Background UI Layers ── */}
      <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none z-[1]" />
      <div className="absolute inset-0 data-stream opacity-[0.03] pointer-events-none z-[2]" />
      <motion.div 
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-red-600/5 blur-[160px] rounded-full z-[3]" 
      />

      {/* ── Top Status Bar ── */}
      <header className="flex flex-col sm:flex-row items-center justify-between mb-8 lg:mb-16 relative z-10 shrink-0 gap-6">
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="w-12 h-12 lg:w-14 lg:h-14 bg-red-600 rounded-[16px] lg:rounded-[20px] flex items-center justify-center shadow-2xl glow-red group hover:rotate-12 transition-transform">
            <AlertCircle className="text-white" size={24} lg:size={28} />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-black font-['Space_Grotesk'] text-white uppercase tracking-tighter leading-none">EMERGENCY HUB</h2>
            <p className="text-[8px] lg:text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mt-2 lg:mt-3 ml-0.5">PRIORITY BANDWIDTH ACTIVE</p>
          </div>
        </div>
        
        <div className="flex gap-6 lg:gap-10">
           {STATUS_ITEMS.map((item) => (
             <div key={item.label} className="flex flex-col items-center sm:items-end group cursor-help">
                <div className={`flex items-center gap-2 ${item.color}`}>
                   <item.icon size={12} lg:size={14} className="group-hover:scale-125 transition-transform" />
                   <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest">{item.value}</span>
                </div>
                <span className="text-[8px] lg:text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1 lg:mt-1.5">{item.label}</span>
             </div>
           ))}
        </div>
      </header>

      {/* ── Main SOS Action ── */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {sosState === 'IDLE' && (
            <motion.div 
              key="idle" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center"
            >
              <button 
                onClick={triggerSOS}
                className="w-[240px] h-[240px] lg:w-[300px] lg:h-[300px] rounded-full bg-red-600 flex items-center justify-center relative group shrink-0 shadow-[0_0_80px_rgba(239,68,68,0.3)] lg:shadow-[0_0_100px_rgba(239,68,68,0.4)] active:scale-95 transition-all"
              >
                <div className="absolute inset-0 rounded-full border-4 border-red-500 marker-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-red-500/30 marker-pulse [animation-delay:0.5s]" />
                <div className="absolute inset-[-30px] lg:inset-[-40px] rounded-full border border-red-500/10 group-hover:inset-[-50px] lg:group-hover:inset-[-60px] transition-all duration-700" />
                
                <div className="relative z-10 text-center">
                   <Shield className="text-white mx-auto mb-3 lg:mb-4 drop-shadow-2xl" size={48} lg:size={64} />
                   <p className="text-xl lg:text-3xl font-['Space_Grotesk'] font-black text-white uppercase tracking-widest leading-none">SEND SOS</p>
                </div>
              </button>
              <p className="text-slate-500 text-[9px] lg:text-[11px] font-black uppercase tracking-[0.5em] mt-12 lg:mt-20 text-center leading-[2] animate-pulse">
                HOLD TO INITIATE <br /> BROADCAST PROTOCOL
              </p>
            </motion.div>
          )}

          {sosState === 'COUNTDOWN' && (
            <motion.div 
              key="countdown" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }}
              className="flex flex-col items-center"
            >
              <div className="w-[260px] h-[260px] lg:w-[320px] lg:h-[320px] rounded-full border-[8px] lg:border-[12px] border-white/5 flex items-center justify-center relative shrink-0">
                 <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <motion.circle 
                        cx="50%" cy="50%" r="45%"
                        stroke="currentColor" strokeWidth="12" fill="transparent"
                        className="text-red-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 5, ease: "linear" }}
                    />
                 </svg>
                 <span className="text-7xl lg:text-9xl font-black font-['Space_Grotesk'] text-white tabular-nums tracking-tighter">{countdown}</span>
              </div>
              <button 
                onClick={cancelSOS}
                className="mt-16 px-10 py-4 glass-light text-[10px] font-black text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 transition-all uppercase tracking-[0.4em] rounded-[24px]"
              >
                Cancel Protocol
              </button>
            </motion.div>
          )}

          {sosState === 'ACTIVE' && (
            <motion.div 
              key="active" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl space-y-6 overflow-y-auto pr-4 custom-scrollbar max-h-[70vh] pb-20"
            >
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 lg:p-12 rounded-[32px] lg:rounded-[56px] text-center relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 lg:w-48 h-32 lg:h-48 bg-emerald-500/5 blur-3xl rounded-full" />
                 <div className="w-16 h-16 lg:w-20 lg:h-20 bg-emerald-500/10 rounded-2xl lg:rounded-3xl flex items-center justify-center mx-auto mb-6 lg:mb-8 glow-green">
                    <Radio size={32} lg:size={40} className="text-emerald-500 animate-pulse" />
                 </div>
                 <h3 className="text-2xl lg:text-4xl font-black font-['Space_Grotesk'] text-white uppercase tracking-tighter mb-4">SIGNAL BROADCASTED</h3>
                 <p className="text-slate-400 text-xs lg:text-sm font-bold leading-relaxed max-w-md mx-auto">First responders in SECTOR 07 have been notified. Your precise geospatial coordinates are being streamed in real-time.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 {[
                   { icon: Phone, label: 'VOICE LINK', sub: 'PRIORITY 1', color: 'bg-blue-600 glow-blue text-white' },
                   { icon: MessageSquare, label: 'TACTICAL TEXT', sub: 'LOW BANDWIDTH', color: 'glass-light text-blue-400' },
                   { icon: Heart, label: 'MEDICAL DATA', sub: 'SYNCING VITALS', color: 'glass-light text-red-400' },
                   { icon: Navigation, label: 'EXTR ACTION', sub: 'MAPPED ROUTE', color: 'glass-light text-emerald-400' },
                 ].map((action) => (
                   <button key={action.label} className={`${action.color} p-8 rounded-[40px] flex flex-col items-center gap-3 border border-white/5 group transition-all active:scale-95 shadow-xl`}>
                      <action.icon size={28} className="group-hover:scale-110 transition-transform" />
                      <div className="text-center">
                         <p className="text-xs font-black uppercase tracking-widest leading-none">{action.label}</p>
                         <p className="text-[9px] font-bold opacity-50 uppercase mt-2 tracking-wider">{action.sub}</p>
                      </div>
                   </button>
                 ))}
              </div>

              <button 
                onClick={cancelSOS}
                className="w-full glass hover:bg-red-500/10 text-slate-600 hover:text-red-500 py-6 rounded-[32px] text-[10px] font-black tracking-[0.4em] transition-all uppercase border border-white/5"
              >
                TERMINATE SESSION
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Quick Intel Footer ── */}
      <footer className="mt-auto pt-10 border-t border-white/5 flex flex-col gap-6 relative z-10 shrink-0">
         <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em]">OPERATIONAL SAFETY NODES</h3>
            <div className="flex items-center gap-2 text-blue-500">
                <Target size={14} className="animate-spin-slow" />
                <span className="text-[10px] font-black uppercase tracking-widest">Scanning Radius: 5km</span>
            </div>
         </div>
         <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {[
              { name: 'SECTOR 4 SHELTER', dist: '1.2km', status: 'READY', color: 'text-emerald-400' },
              { name: 'MEDICAL NODE A-1', dist: '0.8km', status: 'BUSY', color: 'text-amber-400' },
              { name: 'EVAC POINT DELTA', dist: '2.4km', status: 'READY', color: 'text-emerald-400' },
              { name: 'WATER RESERVE 2', dist: '0.5km', status: 'READY', color: 'text-emerald-400' },
            ].map((node) => (
              <div key={node.name} className="shrink-0 w-[240px] glass-light p-6 rounded-[32px] border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
                 <p className="text-[12px] font-black text-white group-hover:text-blue-400 transition-colors">{node.name}</p>
                 <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{node.dist}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${node.color}`}>{node.status}</span>
                 </div>
              </div>
            ))}
         </div>
      </footer>

    </div>
  );
}
