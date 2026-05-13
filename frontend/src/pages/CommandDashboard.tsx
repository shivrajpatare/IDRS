import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, Bell, Users, Truck, Radio, Terminal, Settings, LogOut, ChevronRight, AlertTriangle, Zap, BarChart3, X, Globe, Target, CloudRain } from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';
import { useSOS } from '../hooks/useSOS';
import { usePhase } from '../hooks/usePhase';
import { useRoute } from '../hooks/useRoute';
import api from '../lib/axios';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';
import InteractiveDisasterMap from '../components/InteractiveDisasterMap';

const CHART = [{v:40},{v:55},{v:48},{v:72},{v:65},{v:88},{v:82},{v:95}];
const ASSETS = [
  {name:'Heavy Rescue Unit',status:'Deployed',loc:'Sector 7',bat:'92%',icon:Truck,id:'AS-01'},
  {name:'Mobile Medical',status:'Ready',loc:'Central Hub',bat:'100%',icon:Activity,id:'AS-02'},
  {name:'Satellite Uplink A',status:'Active',loc:'Orbit_04',bat:'N/A',icon:Radio,id:'AS-03'},
  {name:'Emergency Shelter B',status:'Full',loc:'Sector 4',bat:'85%',icon:Shield,id:'AS-04'},
];

const PERSONNEL = [
  {name:'Cmdr. Rajesh Kumar',status:'On-Mission',task:'Sector 7 Lead',time:'2m ago', rank: 'A-1'},
  {name:'Dr. Sarah Chen',status:'Standby',task:'Medical Response',time:'14m ago', rank: 'B-4'},
  {name:'Lt. James Miller',status:'On-Mission',task:'Evac-Alpha',time:'Just now', rank: 'A-2'},
  {name:'Sgt. Priya Nair',status:'On-Mission',task:'Logistics Hub',time:'5m ago', rank: 'C-1'},
];

const Panel = ({title,onClose,children,wide}:{title:string;onClose:()=>void;children:React.ReactNode;wide?:boolean}) => (
  <motion.div
    initial={{opacity:0, x:100}} animate={{opacity:1, x:0}} exit={{opacity:0, x:100}}
    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    className={`absolute top-0 right-0 h-full w-full ${wide?'lg:w-[50vw]':'lg:w-[35vw]'} bg-white border-l border-[#e5e9eb] z-[5000] flex flex-col shadow-2xl`}
  >
    <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e9eb] shrink-0 bg-[#f8fafc]">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 bg-[#00666c] rounded-full" />
        <h2 className="text-sm font-black text-[#2c2f31] uppercase tracking-[0.3em] font-['Space_Grotesk']">{title}</h2>
      </div>
      <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white border border-[#e5e9eb] hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-[#595c5e] transition-all">
        <X size={16} />
      </button>
    </div>
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-6">
        {children}
    </div>
  </motion.div>
);

// ── 🧠 AI Tactical Intelligence Engine (rule-based instant fallback) ──
const getLocalIntelligence = (alerts: any[], sosQueue: any[], phase: string | null) => {
  const criticals = alerts.filter((a: any) => a.severity_normalized === 'Critical').length;
  const sosActive = sosQueue.length;
  const isMid = phase?.includes('MID');
  
  let threatLevel = 'LOW', threatColor = '#10b981', threatPct = 15;
  if (criticals > 0 || sosActive > 2) { threatLevel = 'CRITICAL'; threatColor = '#ef4444'; threatPct = 92; }
  else if (sosActive > 0 || isMid) { threatLevel = 'ELEVATED'; threatColor = '#f59e0b'; threatPct = 65; }
  else if (alerts.length > 0) { threatLevel = 'MODERATE'; threatColor = '#3b82f6'; threatPct = 40; }

  return { threatLevel, threatColor, threatPct };
};

const THREAT_COLORS: Record<string, string> = {
  LOW: '#10b981', 
  MODERATE: '#3b82f6', 
  ELEVATED: '#f59e0b', 
  HIGH: '#f59e0b',
  CRITICAL: '#ef4444',
  EXTREME: '#ef4444',
  MEDIUM: '#3b82f6'
};

const THREAT_PCTS: Record<string, number> = {
  LOW: 15, 
  MODERATE: 40, 
  MEDIUM: 40,
  ELEVATED: 65, 
  HIGH: 75,
  CRITICAL: 92,
  EXTREME: 100
};

export default function CommandDashboard() {
  const {alerts:live, syncStatus} = useAlerts();
  const {sosQueue} = useSOS();
  const {phase: systemPhase} = usePhase();
  const alerts = live;
  const [tab,setTab] = useState<string|null>(null);
  const [time, setTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastSosCount, setLastSosCount] = useState(0);
  const [sosNotification, setSosNotification] = useState<any>(null);

  // 🧠 AI State
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [aiThreat, setAiThreat] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [lastAiTrigger, setLastAiTrigger] = useState('');

  // 🛰️ Tactical Movement & Interception State
  const [rescueUnits, setRescueUnits] = useState([
    { id: 'AS-01', type: 'truck', lat: 13.085, lng: 80.25, targetId: null, speed: 45, status: 'Active' },
    { id: 'AS-02', type: 'heli', lat: 13.11, lng: 80.28, targetId: null, speed: 120, status: 'Patrol' },
    { id: 'AS-03', type: 'truck', lat: 13.06, lng: 80.22, targetId: null, speed: 40, status: 'Ready' }
  ]);
  const [tacticalLogs, setTacticalLogs] = useState<any[]>([
    { id: 1, time: '18:07:01', msg: 'SATELLITE SYNC ESTABLISHED. SCANNING SECTOR 4...', type: 'sys' }
  ]);

  const addLog = (msg: string, type: 'sys' | 'ai' | 'unit' = 'ai') => {
    setTacticalLogs(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString([], { hour12: false }), msg, type }, ...prev].slice(0, 5));
  };

  // 🏥 Realistic Chennai SOS Scenarios
  const realisticSOS = useMemo(() => {
    const scenarios = [
      { msg: "Severe water logging; 3 citizens stranded on rooftop.", loc: "Velachery Main Rd" },
      { msg: "Critical medical emergency; ambulance access blocked by debris.", loc: "T. Nagar" },
      { msg: "Power line down; immediate threat to residential cluster.", loc: "Saidapet" },
      { msg: "Requesting urgent food/water supplies for 50+ displaced persons.", loc: "Madipakkam" }
    ];
    return sosQueue.map((s: any, i: number) => ({
      ...s,
      message: scenarios[i % scenarios.length].msg,
      location_name: scenarios[i % scenarios.length].loc
    }));
  }, [sosQueue]);

  // 🚒 Tactical Dispatch Logic
  const assignResponder = (sosId: string) => {
    const sos = realisticSOS.find(s => s.id === sosId);
    if (!sos) return;

    const availableUnit = rescueUnits.find(u => !u.targetId);
    if (!availableUnit) {
      addLog(`⚠ NO AVAILABLE UNITS FOR SOS #${String(sosId).slice(0,4)}`, 'sys');
      return;
    }

    setRescueUnits(prev => prev.map(u => 
      u.id === availableUnit.id ? { ...u, targetId: sosId, status: 'INTERCEPTING' } : u
    ));

    addLog(`🛰️ UNIT ${availableUnit.id} DISPATCHED TO ${sos.location_name}`, 'unit');
  };

  // 🚀 Full Strategic Mobilization (Mass Deploy)
  const autoDeploy = () => {
    const idleUnits = rescueUnits.filter(u => !u.targetId);
    const unassignedSos = realisticSOS.filter(s => !rescueUnits.some(u => u.targetId === s.id));

    if (idleUnits.length === 0 || unassignedSos.length === 0) {
      addLog(`⚠ STRATEGIC DEPLOYMENT HALTED: NO IDLE ASSETS`, 'sys');
      return;
    }

    addLog(`🚀 STRATEGIC MOBILIZATION INITIATED: DISPATCHING ${Math.min(idleUnits.length, unassignedSos.length)} UNITS`, 'sys');

    setRescueUnits(prev => {
      const next = [...prev];
      let sosIdx = 0;
      next.forEach((unit, idx) => {
        if (!unit.targetId && sosIdx < unassignedSos.length) {
          next[idx] = { ...unit, targetId: unassignedSos[sosIdx].id, status: 'INTERCEPTING' };
          sosIdx++;
        }
      });
      return next;
    });
  };

  // Local rule-based intel (instant)
  const localIntel = useMemo(() => getLocalIntelligence(alerts, sosQueue, systemPhase), [alerts, sosQueue, systemPhase]);

  // ⚡ Auto-Assign Units to SOS Targets
  useEffect(() => {
    if (sosQueue.length > 0) {
      setRescueUnits(prev => prev.map((unit, i) => {
        if (!unit.targetId && sosQueue[i % sosQueue.length]) {
          const target = sosQueue[i % sosQueue.length];
          const targetRef = String(target.id).substring(0, 4);
          addLog(`UNIT ${unit.id} DIVERTED TO SOS-${targetRef}. ETA: 4 MINS`, 'ai');
          return { ...unit, targetId: target.id, status: 'Interception' };
        }
        return unit;
      }));
    }
  }, [sosQueue]);

  // 🔄 Real-time Position Interpolation
  useEffect(() => {
    const t = setInterval(() => {
      setRescueUnits(prev => prev.map(unit => {
        if (!unit.targetId) return unit;
        
        // Find target in realisticSOS using unified string comparison
        const target = realisticSOS.find(s => String(s.id) === String(unit.targetId));
        if (!target) return { ...unit, targetId: null, status: 'Ready' };

        const dLat = target.lat - unit.lat;
        const dLng = target.lng - unit.lng;
        const dist = Math.sqrt(dLat*dLat + dLng*dLng);

        if (dist < 0.001) {
          addLog(`✅ UNIT ${unit.id} REACHED DESTINATION: ${target.location_name}`, 'unit');
          return { ...unit, targetId: null, status: 'EXTRACTING', lat: target.lat, lng: target.lng };
        }

        // Interpolate movement (0.0005 per tick for realistic speed)
        const moveStep = unit.type === 'heli' ? 0.0008 : 0.0004;
        return {
          ...unit,
          lat: unit.lat + (dLat / dist) * moveStep,
          lng: unit.lng + (dLng / dist) * moveStep
        };
      }));
    }, 100);
    return () => clearInterval(t);
  }, [realisticSOS]);

  // Trigger Gemini AI when the intel panel is opened or data changes significantly
  useEffect(() => {
    if (tab !== 'intel') return;
    const triggerKey = `${alerts.length}-${sosQueue.length}-${systemPhase}`;
    if (triggerKey === lastAiTrigger) return; 
    setLastAiTrigger(triggerKey);
    
    const fetchAI = async () => {
      setAiLoading(true);
      setAiError(false);
      try {
        const res = await api.post('/tactical-ai/analyze', {
          alerts: alerts.map(a => ({ headline: a.headline, severity_normalized: a.severity_normalized, source: a.source })),
          sos_queue: sosQueue.map(s => ({ lat: s.lat, lng: s.lng, injury_level: s.injury_level, priority_score: s.priority_score })),
          phase: systemPhase || 'PRE_DISASTER',
          asset_count: 4,
          personnel_count: 4
        });
        if (res.data) {
          setAiBriefing(res.data.briefing || null);
          setAiRecommendations(res.data.recommendations || []);
          setAiThreat(res.data.threat_level || null);
          setAiConfidence(res.data.confidence || 0);
        }
      } catch (e) {
        console.error('Tactical AI error:', e);
        setAiError(true);
      } finally {
        setAiLoading(false);
      }
    };
    fetchAI();
  }, [tab, alerts.length, sosQueue.length, systemPhase]);

  // Computed intel (AI overrides local when available)
  const intel = useMemo(() => {
    const threat = aiThreat || localIntel.threatLevel;
    return {
      threatLevel: threat,
      threatColor: THREAT_COLORS[threat] || localIntel.threatColor,
      threatPct: THREAT_PCTS[threat] || localIntel.threatPct,
      confidence: aiConfidence || 85,
    };
  }, [aiThreat, aiConfidence, localIntel]);

  // Real-time SOS notification — auto-open panel + toast when new SOS arrives
  useEffect(() => {
    if (sosQueue.length > lastSosCount && lastSosCount > 0) {
      const newest = sosQueue[0];
      setSosNotification(newest);
      setTab('sos');
      setTimeout(() => setSosNotification(null), 6000);
    }
    setLastSosCount(sosQueue.length);
  }, [sosQueue.length]);

  const [simulationFrames, setSimulationFrames] = useState<any[]>([]);
  const [simIndex, setSimIndex] = useState(0);
  const { fetchRoute, routeData } = useRoute();

  const runDemo = async () => {
    try {
      const res = await api.get('/simulation/flood');
      if (res.data.frames) {
        setSimulationFrames(res.data.frames.map((f:any)=>({...f, type:'flood'})));
        setSimIndex(0);
        setIsPlaying(true);
      }
      await fetchRoute({ lat: 13.0827, lng: 80.2707 }, { lat: 13.0850, lng: 80.2100 });
    } catch (e) { console.error(e); }
  };

  const runCycloneDemo = async () => {
    try {
      const res = await api.get('/simulation/cyclone?lat=11.0&lon=83.0');
      if (res.data.frames) {
        setSimulationFrames(res.data.frames.map((f:any)=>({...f, type:'cyclone'})));
        setSimIndex(0);
        setIsPlaying(true);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (simulationFrames.length > 0 && isPlaying) {
      const t = setInterval(() => {
        setSimIndex(prev => {
          if (prev >= simulationFrames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [simulationFrames, isPlaying]);

  const currentSimData = simulationFrames[simIndex] ? {
    lat: simulationFrames[simIndex].center?.lat || 13.0827,
    lon: simulationFrames[simIndex].center?.lon || 80.2707,
    radius: simulationFrames[simIndex].spread_radius_km || simulationFrames[simIndex].radius_km,
    intensity: simulationFrames[simIndex].impact?.intensity || simulationFrames[simIndex].intensity,
    type: simulationFrames[simIndex].type
  } : undefined;

  useEffect(()=>{
    const t=setInterval(()=>setTime(new Date()),1000);
    return () => clearInterval(t);
  },[]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f5f7f9] overflow-hidden font-['Inter']">
      
      {/* ── Official NDMA Header (Citizen Dashboard Style) ── */}
      <header className="h-16 lg:h-20 bg-white border-b border-[#e5e9eb] flex items-center justify-between px-6 lg:px-10 z-[2000] shrink-0 relative">
        <div className="flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-4 lg:gap-5 group cursor-pointer">
            <div className="w-10 h-10 lg:w-14 lg:h-14 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img src="/ndma_logo.png" alt="NDMA Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-bold font-['Space_Grotesk'] text-[#2c2f31] uppercase tracking-tight leading-none">NDMA | <span className="text-[#00666c]">COMMAND</span></h1>
              <p className="text-[7px] lg:text-[9px] font-bold text-[#00666c] uppercase tracking-[0.3em] mt-1.5 opacity-70">Strategic Response Nexus</p>
            </div>
          </div>
          
          <div className="hidden sm:block h-10 w-px bg-[#e5e9eb]" />

          <div className="hidden md:flex items-center gap-3 bg-[#f8fafc] px-4 py-2 rounded-xl border border-[#e5e9eb]">
            <span className={`w-2 h-2 rounded-full animate-pulse ${systemPhase === 'MID_DISASTER' ? 'bg-red-500' : systemPhase === 'POST_DISASTER' ? 'bg-emerald-500' : 'bg-[#00666c]'}`} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2c2f31]">{systemPhase?.replace('_', ' ')}</span>
            <span className="text-[9px] font-semibold text-[#abadaf] uppercase tracking-wider">• ACTIVE MONITORING</span>
          </div>
        </div>

        <div className="flex items-center gap-6 lg:gap-8">
          <div className="hidden lg:flex items-center gap-6 pr-6 border-r border-[#e5e9eb]">
            <div className="flex items-center gap-3">
              <CloudRain size={18} className="text-[#00666c]" />
              <div>
                <p className="text-sm font-bold text-[#2c2f31] leading-none uppercase">28°C</p>
                <p className="text-[8px] font-bold text-[#00666c] uppercase tracking-widest mt-1">Light Rain</p>
              </div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-lg font-bold font-['Space_Grotesk'] text-[#2c2f31] tabular-nums tracking-tight leading-none">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            <div className="flex items-center justify-end gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${syncStatus === 'live' ? 'bg-[#006947] animate-pulse glow-emerald' : 'bg-amber-500'}`} />
                <span className="text-[8px] font-bold text-[#abadaf] uppercase tracking-widest">{syncStatus} FEED ACTIVE</span>
            </div>
          </div>
          <button className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl text-[10px] font-bold tracking-[0.3em] shadow-lg shadow-red-100 transition-all active:scale-[0.98] flex items-center gap-3 uppercase group">
            <AlertTriangle size={18} className="group-hover:scale-125 transition-transform" /> COMMAND SOS
          </button>
        </div>
      </header>

      {/* ── Operational Ticker ── */}
      <div className="h-10 bg-[#00666c] flex items-center overflow-hidden relative z-[150] shrink-0 shadow-lg">
         <div className="shrink-0 px-6 bg-black/10 h-full flex items-center border-r border-white/10 z-10">
            <Radio size={14} className="text-white mr-3 animate-pulse" />
            <span className="text-[9px] font-bold tracking-[0.3em] text-white uppercase">Broadcast</span>
         </div>
         <div className="flex-1 overflow-hidden">
            <motion.div initial={{ x: '100%' }} animate={{ x: '-100%' }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.4em] px-8 text-[#00f1fe]">
               {alerts.length > 0 ? alerts.map(a => `⚠ ${a.headline} — SEVERITY: ${a.severity_normalized} | `).join('') : 'SYSTEM NOMINAL — MONITORING SECTOR 7 — SATELLITE SYNC STABLE — NEXUS LUMINOUS v4.2'}
            </motion.div>
         </div>
      </div>

      <main className="flex-1 flex overflow-hidden relative">
        
        {/* ── Left Sidebar ── */}
        <aside className="w-20 lg:w-24 bg-white border-r border-[#e5e9eb] flex flex-col items-center py-8 z-[1500] shrink-0">
          <nav className="flex-1 flex flex-col gap-8">
            {[
              { id: 'sos', icon: AlertTriangle, color: 'text-red-500' },
              { id: 'alerts', icon: Bell, color: 'text-[#00666c]' },
              { id: 'assets', icon: Truck, color: 'text-[#2c2f31]' },
              { id: 'evac', icon: Users, color: 'text-[#2c2f31]' },
              { id: 'intel', icon: Terminal, color: 'text-cyan-600' },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setTab(tab === item.id ? null : item.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative ${tab === item.id ? 'bg-[#f5f7f9] text-[#2c2f31] border border-[#e5e9eb]' : 'text-[#abadaf] hover:text-[#2c2f31]'}`}
              >
                <item.icon size={20} className={tab === item.id ? item.color : ''} />
                {item.id === 'sos' && sosQueue.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-200">{sosQueue.length}</span>
                )}
              </button>
            ))}
          </nav>
          <button className="mt-auto text-[#abadaf] hover:text-[#2c2f31] w-12 h-12 rounded-xl flex items-center justify-center">
            <Settings size={20} />
          </button>
        </aside>

        {/* ── Map Canvas ── */}
        <div className="flex-1 relative bg-[#f8fafc]">
          <InteractiveDisasterMap 
            phase={systemPhase as any} 
            alerts={alerts} 
            sosRequests={sosQueue} 
            simulationData={currentSimData}
            evacuationRoute={routeData?.geometry}
            rescueUnits={rescueUnits}
          />

          {/* 🚨 Real-time SOS Notification Toast */}
          <AnimatePresence>
            {sosNotification && (
              <motion.div
                initial={{ y: -80, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -80, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[3000] bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-red-200 flex items-center gap-4 max-w-md"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle size={22} className="animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">⚡ INCOMING SOS DISTRESS</p>
                  <p className="text-xs font-bold text-red-100 mt-1">
                    Coords: {sosNotification.lat?.toFixed(4)}, {sosNotification.lng?.toFixed(4)} • Priority: {sosNotification.priority_score || 'HIGH'}
                  </p>
                </div>
                <button onClick={() => setSosNotification(null)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {/* ── Docked Control Widgets ── */}
          

          <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3 items-end">
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white px-5 py-3 rounded-xl border border-[#e5e9eb] shadow-lg flex items-center gap-4"
            >
              <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#2c2f31] uppercase tracking-wider">{alerts.filter(a=>a.severity_normalized==='Critical').length} Criticals</p>
                <p className="text-[8px] font-bold text-red-400 uppercase">Immediate</p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white px-5 py-3 rounded-xl border border-[#e5e9eb] shadow-lg flex items-center gap-4"
            >
              <div className="w-8 h-8 bg-cyan-50 text-[#00666c] rounded-lg flex items-center justify-center">
                <Globe size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#2c2f31] uppercase tracking-wider">Sat-Sync</p>
                <p className="text-[8px] font-bold text-[#abadaf] uppercase">Active</p>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] flex gap-3">
             <button onClick={runDemo} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase shadow-xl transition-all border border-white/20">
               Flood Scenario
             </button>
             <button onClick={runCycloneDemo} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase shadow-xl transition-all border border-white/20">
               Cyclone Scenario
             </button>
             <button 
               onClick={autoDeploy}
               className="bg-[#2c2f31] hover:bg-black text-white px-6 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase shadow-xl transition-all flex items-center gap-2 group"
             >
               <Zap size={14} className="text-[#00f1fe] group-hover:scale-125 transition-transform" /> Deploy Assets
             </button>
          </div>

          {/* Overlays */}
          <AnimatePresence>
            {tab && (
              <Panel 
                key={tab} 
                title={tab.toUpperCase()} 
                onClose={() => setTab(null)} 
              >
                {tab === 'sos' && (
                  <div className="space-y-4">
                    {realisticSOS.map((s:any)=>(
                      <div key={s.id} className="p-5 bg-white border border-[#e5e9eb] rounded-2xl hover:border-red-500/30 transition-all shadow-sm group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                            <span className="text-[10px] font-black text-[#abadaf] uppercase tracking-widest">Priority {s.priority_score.toFixed(0)}</span>
                          </div>
                          <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase">{s.location_name}</span>
                        </div>
                        <p className="text-sm font-black text-[#2c2f31] uppercase mb-1">Distress: {s.injury_level}</p>
                        <p className="text-xs text-[#595c5e] mb-5 leading-relaxed">{s.message}</p>
                        
                        {rescueUnits.find(u => u.targetId === s.id) ? (
                          <div className="w-full bg-cyan-50 border border-cyan-100 text-cyan-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                             <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                             Unit {rescueUnits.find(u => u.targetId === s.id)?.id} Intercepting
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              assignResponder(s.id);
                              setSosNotification({ lat: s.lat, lng: s.lng, priority_score: s.priority_score });
                              setTimeout(() => setSosNotification(null), 3000);
                            }}
                            className="w-full bg-[#2c2f31] hover:bg-black hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.97] pointer-events-auto relative z-[6000]"
                          >
                            Assign Nearest Responder
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'alerts' && (
                  <div className="space-y-4">
                    {alerts.map((a:any)=>(
                      <div key={a.id} className="p-4 bg-white border border-[#e5e9eb] rounded-2xl relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${a.severity_normalized==='Critical'?'bg-red-500':'bg-[#00666c]'}`} />
                        <p className="text-xs font-black text-[#2c2f31] uppercase leading-tight mb-2">{a.headline}</p>
                        <span className="text-[8px] font-black text-[#abadaf] uppercase tracking-widest">{a.source}</span>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'assets' && (
                  <div className="space-y-4">
                    {ASSETS.map((a,i)=>(
                      <div key={i} className="p-4 bg-white border border-[#e5e9eb] rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#f8fafc] text-[#2c2f31] rounded-xl flex items-center justify-center shrink-0 border border-[#e5e9eb]"><a.icon size={20}/></div>
                        <div className="flex-1">
                          <h4 className="text-xs font-black text-[#2c2f31] uppercase truncate">{a.name}</h4>
                          <p className="text-[8px] font-bold text-[#abadaf] uppercase mt-1">{a.loc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'evac' && (
                  <div className="space-y-4">
                    {PERSONNEL.map((p,i)=>(
                      <div key={i} className="p-4 bg-white border border-[#e5e9eb] rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#2c2f31] rounded-full flex items-center justify-center text-white text-[10px] font-black">{p.name.split(' ').map(w=>w[0]).join('')}</div>
                        <div className="flex-1">
                          <h4 className="text-xs font-black text-[#2c2f31] uppercase">{p.name}</h4>
                          <p className="text-[8px] font-bold text-[#abadaf] uppercase mt-1">{p.task}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'intel' && (
                  <div className="space-y-6">
                    {/* Threat Level */}
                    <div className="bg-[#f8fafc] rounded-2xl p-5 border border-[#e5e9eb]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: intel.threatColor }} />
                          <span className="text-[10px] font-black text-[#2c2f31] uppercase tracking-[0.3em]">Threat Level</span>
                        </div>
                        <span className="text-lg font-black font-['Space_Grotesk'] uppercase tracking-tight" style={{ color: intel.threatColor }}>{intel.threatLevel}</span>
                      </div>
                      <div className="h-2.5 bg-[#e5e9eb] rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: `${intel.threatPct}%` }} 
                          transition={{ duration: 1 }}
                          className="h-full rounded-full" 
                          style={{ backgroundColor: intel.threatColor }}
                        />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#e5e9eb] text-center">
                        <p className="text-xl font-black text-[#2c2f31] font-['Space_Grotesk'] leading-none">{intel.confidence}%</p>
                        <p className="text-[7px] font-bold text-[#abadaf] uppercase tracking-widest mt-1">Confidence</p>
                      </div>
                      <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#e5e9eb] text-center">
                        <p className="text-xl font-black text-[#2c2f31] font-['Space_Grotesk'] leading-none">{alerts.length + sosQueue.length}</p>
                        <p className="text-[7px] font-bold text-[#abadaf] uppercase tracking-widest mt-1">Data Sources</p>
                      </div>
                      <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#e5e9eb] text-center">
                        <p className="text-xl font-black font-['Space_Grotesk'] leading-none" style={{ color: intel.threatColor }}>
                          {aiRecommendations.filter(r => r.priority === 'CRITICAL').length}
                        </p>
                        <p className="text-[7px] font-bold text-[#abadaf] uppercase tracking-widest mt-1">Critical</p>
                      </div>
                    </div>

                    {/* 🧠 AI Situational Briefing */}
                    <div className="bg-gradient-to-br from-[#0a1628] to-[#1a2744] rounded-2xl p-5 border border-[#2a3a5c] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />
                      <div className="flex items-center gap-2 mb-3">
                        <Terminal size={12} className="text-cyan-400" />
                        <span className="text-[8px] font-black text-cyan-400 uppercase tracking-[0.3em]">Gemini AI • Situational Briefing</span>
                        {aiLoading && <span className="ml-auto text-[8px] font-bold text-cyan-400 animate-pulse uppercase tracking-widest">Analyzing...</span>}
                      </div>
                      {aiLoading ? (
                        <div className="flex items-center gap-3 py-4">
                          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[11px] text-cyan-200/60 font-medium">Processing real-time intelligence through Gemini AI...</span>
                        </div>
                      ) : aiError ? (
                        <p className="text-[11px] text-amber-300/80 font-medium leading-relaxed">
                          ⚠ AI analysis unavailable. Using rule-based fallback. All local threat assessments remain active.
                        </p>
                      ) : aiBriefing ? (
                        <motion.p 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                          className="text-[12px] text-white/80 font-medium leading-relaxed"
                        >
                          {aiBriefing}
                        </motion.p>
                      ) : (
                        <p className="text-[11px] text-white/40 font-medium">Open this panel to trigger AI analysis of current data streams.</p>
                      )}
                    </div>

                    {/* Intel Header */}
                    <div className="flex items-center gap-3 pb-2 border-b border-[#e5e9eb]">
                      <Terminal size={14} className="text-cyan-600" />
                      <span className="text-[9px] font-black text-[#2c2f31] uppercase tracking-[0.3em]">Tactical Recommendations</span>
                      <span className="ml-auto text-[8px] font-bold text-cyan-600 uppercase tracking-widest animate-pulse">● AI LIVE</span>
                    </div>

                    {/* 🎙️ Live Tactical Comms Feed */}
                    <div className="bg-slate-900 rounded-xl p-4 border border-white/10 shadow-2xl overflow-hidden">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-1 items-center h-2">
                          {[1,2,3,4].map(i => <motion.div key={i} animate={{ height: [2, 8, 2] }} transition={{ repeat: Infinity, duration: 0.5, delay: i*0.1 }} className="w-0.5 bg-cyan-400" />)}
                        </div>
                        <span className="text-[7px] font-black text-cyan-400 uppercase tracking-widest">Live Comms Feed</span>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-hidden">
                        {tacticalLogs.map((log) => (
                          <motion.div 
                            key={log.id} 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className="flex gap-2 font-mono text-[8px] leading-relaxed"
                          >
                            <span className="text-slate-500 shrink-0">[{log.time}]</span>
                            <span className={log.type === 'ai' ? 'text-cyan-300' : log.type === 'sys' ? 'text-slate-400' : 'text-amber-400'}>
                              {log.msg}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendations Feed */}
                    <div className="space-y-3">
                      {(aiRecommendations.length > 0 ? aiRecommendations : [
                        { priority: 'LOW', action: 'Awaiting AI analysis. Open panel to trigger Gemini tactical scan.' }
                      ]).map((rec: any, i: number) => {
                        const priorityColors: Record<string, string> = {
                          CRITICAL: 'bg-red-500 text-white',
                          HIGH: 'bg-amber-500 text-white',
                          MEDIUM: 'bg-blue-500 text-white',
                          LOW: 'bg-[#e5e9eb] text-[#595c5e]'
                        };
                        return (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.12 }}
                            className={`p-4 rounded-xl border transition-all ${
                              rec.priority === 'CRITICAL' ? 'bg-red-50 border-red-200' : 'bg-white border-[#e5e9eb]'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${priorityColors[rec.priority] || priorityColors.LOW}`}>
                                {rec.priority}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-[#2c2f31] leading-relaxed">{rec.action || rec.text}</p>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Refresh Button */}
                    <button 
                      onClick={() => { setLastAiTrigger(''); }}
                      disabled={aiLoading}
                      className="w-full py-3 bg-[#f8fafc] hover:bg-cyan-50 border border-[#e5e9eb] hover:border-cyan-300 rounded-xl text-[9px] font-black text-[#2c2f31] uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Zap size={14} className="text-cyan-600" /> Re-Analyze with Gemini AI
                    </button>

                    {/* System Footer */}
                    <div className="pt-4 border-t border-[#e5e9eb] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                      <span className="text-[8px] font-bold text-[#abadaf] uppercase tracking-widest">IDRS Tactical AI v4.2 • Powered by Gemini 2.5 Flash</span>
                    </div>
                  </div>
                )}
              </Panel>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
