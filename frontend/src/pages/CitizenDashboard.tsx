import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, MapPin, Wind, CloudRain, Bell, AlertTriangle,
  Zap, Navigation, Compass, Radio, ShieldAlert, CheckCircle2,
  TrendingUp, Thermometer, Droplets, Eye, EyeOff, ChevronRight, Shield, Globe, Target, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAlerts } from '../hooks/useAlerts';
import { usePhase } from '../hooks/usePhase';
import api from '../lib/axios';

// Stagger Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', damping: 25, stiffness: 120 }
  }
};

const DEMO_COORDS: [number, number][] = [
  [13.0827, 80.2707], [13.1200, 80.3000], [13.0500, 80.2200],
  [12.9800, 80.2500], [13.1500, 80.2100], [13.0100, 80.2900],
];

const INITIAL_FACILITIES = [
  { id: 'f1', name: 'Anna Nagar Shelter', lat: 13.0850, lng: 80.2120, type: 'shelter', capacity_total: 500, capacity_available: 420, accessibility: 'EASY', route_safe: true },
  { id: 'f2', name: 'Kilpauk Medical Node', lat: 13.0780, lng: 80.2450, type: 'hospital', capacity_total: 200, capacity_available: 45, accessibility: 'EASY', route_safe: true },
  { id: 'f3', name: 'Sector 4 Relief Camp', lat: 13.1200, lng: 80.2900, type: 'shelter', capacity_total: 800, capacity_available: 120, accessibility: 'LIMITED', route_safe: true },
  { id: 'f4', name: 'North Delta Center', lat: 13.1500, lng: 80.2100, type: 'shelter', capacity_total: 300, capacity_available: 0, accessibility: 'BLOCKED', route_safe: false },
];

const PHASE_META = {
  PRE:  { accent: 'text-[#00666c]',   text: 'PRE-DISASTER',  sub: 'Preparedness Protocol' },
  MID:  { accent: 'text-red-600',    text: 'EMERGENCY',     sub: 'Response Protocol' },
  POST: { accent: 'text-[#006947]',text: 'RECOVERY',      sub: 'Restoration Protocol' },
};

// ── Wind Particle Component ──
const WindParticles = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: any[] = [];
    const particleCount = 150; 

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 3 + 1, 
        opacity: Math.random() * 0.4 + 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#ffffff'; 
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';

      particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.length, p.y);
        ctx.globalAlpha = p.opacity;
        ctx.stroke();

        p.x += p.speed;
        if (p.x > canvas.width) {
          p.x = -p.length;
          p.y = Math.random() * canvas.height;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);

    if (!active) return null;
    return (
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-[500] mix-blend-screen opacity-40"
      />
    );
};

const PreMapView = ({ alerts, facilities, bestOption, runDemo, demoActive, phase, advancePhase, stopDemo, userCoords }: any) => {
  const [mapStyle, setMapStyle] = useState<'voyager' | 'dark'>('voyager');
  const [activeWeatherLayer, setActiveWeatherLayer] = useState<string>('none');
  const [showWindParticles, setShowWindParticles] = useState(false);
  const [hideUI, setHideUI] = useState(false);
  const [mapCenterWeather, setMapCenterWeather] = useState<any>(null);
  const [viewState, setViewState] = useState({
    longitude: 80.2707, 
    latitude: 13.0827,
    zoom: 11,
    pitch: 0,
    bearing: 0
  });

  // 🛰️ Reactively sync Map to Master GPS Coords
  useEffect(() => {
    if (!userCoords) return;
    setViewState(prev => ({
      ...prev,
      latitude: userCoords.lat,
      longitude: userCoords.lon,
      zoom: 13 // Zoom in for personal context
    }));
  }, [userCoords]);
  const [sosSent, setSosSent] = useState(false);
  const [showPhaseCinematic, setShowPhaseCinematic] = useState<'MID'|'END'|null>(null);
  const [rescueProgress, setRescueProgress] = useState(0);
  const [impactRadius, setImpactRadius] = useState(0);

  // Simulated citizen vitals
  const [vitals, setVitals] = useState({ hr: 72, stress: 15, o2: 99 });

  // Reset SOS state when simulation ends
  useEffect(() => {
    if (!demoActive) {
      setSosSent(false);
      setRescueProgress(0);
      setImpactRadius(0);
      setVitals({ hr: 72, stress: 15, o2: 99 });
    }
  }, [demoActive]);

  // Vitals simulation — heartrate spikes during MID, calms after SOS
  useEffect(() => {
    if (!demoActive) return;
    const t = setInterval(() => {
      setVitals(prev => {
        if (phase === 'MID' && !sosSent) {
          return {
            hr: Math.min(160, prev.hr + Math.floor(Math.random() * 6 - 1)),
            stress: Math.min(95, prev.stress + Math.floor(Math.random() * 4)),
            o2: Math.max(88, prev.o2 - Math.floor(Math.random() * 2))
          };
        }
        if (sosSent) {
          return {
            hr: Math.max(80, prev.hr - Math.floor(Math.random() * 4)),
            stress: Math.max(20, prev.stress - Math.floor(Math.random() * 3)),
            o2: Math.min(99, prev.o2 + 1)
          };
        }
        return { hr: 72 + Math.floor(Math.random() * 5), stress: 15, o2: 99 };
      });
    }, 800);
    return () => clearInterval(t);
  }, [demoActive, phase, sosSent]);

  // Impact zone grows during MID phase
  useEffect(() => {
    if (phase === 'MID' && demoActive) {
      const t = setInterval(() => {
        setImpactRadius(prev => Math.min(prev + 0.15, 8));
      }, 300);
      return () => clearInterval(t);
    }
  }, [phase, demoActive]);

  // Rescue unit moves toward citizen after SOS
  useEffect(() => {
    if (sosSent && rescueProgress < 100) {
      const t = setInterval(() => {
        setRescueProgress(prev => Math.min(prev + 1, 100));
      }, 600);
      return () => clearInterval(t);
    }
  }, [sosSent, rescueProgress]);

  // Impact zone GeoJSON circle (approximated polygon)
  const impactZoneGeoJSON: any = useMemo(() => {
    if (impactRadius <= 0) return null;
    const center = [80.2707, 13.0827];
    const points = 64;
    const coords = [];
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = (impactRadius / 111) * Math.cos(angle);
      const dy = (impactRadius / 111) * Math.sin(angle);
      coords.push([center[0] + dx, center[1] + dy]);
    }
    return {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coords] }
    };
  }, [impactRadius]);

  const handleSOSFromMap = async () => {
    // Cinematic zoom to disaster epicenter
    setViewState({
      longitude: 80.2500,
      latitude: 13.0650,
      zoom: 14,
      pitch: 55,
      bearing: -20
    });
    try {
      await api.post('/sos/', {
        lat: 13.0650,
        lng: 80.2500,
        injury_level: 'severe',
        event_id: 1,
        zone_id: 2,
        message: 'SOS from simulation — citizen in distress'
      });
    } catch (e) {
      console.error('SOS send failed:', e);
    }
    setSosSent(true);
  };

  // Phase transition cinematic trigger
  const originalAdvancePhase = advancePhase;
  const cinematicAdvance = () => {
    if (phase === 'PRE') {
      setShowPhaseCinematic('MID');
      setTimeout(() => { setShowPhaseCinematic(null); originalAdvancePhase(); }, 2200);
    } else {
      setShowPhaseCinematic('END');
      setTimeout(() => { setShowPhaseCinematic(null); originalAdvancePhase(); }, 1800);
    }
  };

  const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const WEATHER_LAYERS = [
    { id: 'temp', label: 'TEMPERATURE', icon: Thermometer },
    { id: 'wind', label: 'WIND SPEED', icon: Wind },
    { id: 'precipitation', label: 'PRECIPITATION', icon: CloudRain },
    { id: 'pressure', label: 'PRESSURE', icon: Droplets },
    { id: 'clouds', label: 'CLOUDS', icon: Globe },
  ];

  useEffect(() => {
    const fetchCenterWeather = async () => {
      try {
        const res = await api.get(`/alerts/weather?lat=${viewState.latitude}&lon=${viewState.longitude}`);
        setMapCenterWeather(res.data);
      } catch (e) { console.error('Failed to fetch center weather', e); }
    };
    const debounced = setTimeout(fetchCenterWeather, 1000);
    return () => clearTimeout(debounced);
  }, [viewState.latitude, viewState.longitude]);

  useEffect(() => {
    if (demoActive) {
      setViewState({
        longitude: 80.2707,
        latitude: 13.0827,
        zoom: 12.5,
        pitch: 45,
        bearing: 0
      });
    }
  }, [demoActive]);

  const stableCoords = useMemo(() => alerts.map((a:any, i:number) => ({
    lng: a.lng || DEMO_COORDS[i % DEMO_COORDS.length][1],
    lat: a.lat || DEMO_COORDS[i % DEMO_COORDS.length][0]
  })), [alerts.length]);

  const styleUrl = mapStyle === 'voyager'
    ? 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  // The user's simulated position (POV citizen)
  const USER_POV = { lat: 13.0650, lng: 80.2500 };

  // Escape route GeoJSON from user to best facility
  const escapeRouteGeoJSON: any = useMemo(() => {
    if (!sosSent || !bestOption) return null;
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [USER_POV.lng, USER_POV.lat],
          [(USER_POV.lng + bestOption.lng) / 2, (USER_POV.lat + bestOption.lat) / 2 + 0.005],
          [bestOption.lng, bestOption.lat]
        ]
      }
    };
  }, [sosSent, bestOption]);


  return (
    <div className="h-full w-full relative group bg-black overflow-hidden font-['Space_Grotesk']">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={styleUrl}
      >
        <NavigationControl position="bottom-right" />
        
        {activeWeatherLayer !== 'none' && !demoActive && (
          <Source 
            key={activeWeatherLayer}
            id="weather-source" 
            type="raster" 
            tiles={[`https://tile.openweathermap.org/map/${activeWeatherLayer}/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`]}
            tileSize={256}
          >
            <Layer
              id="weather-layer"
              type="raster"
              paint={{ 
                'raster-opacity': 0.65,
                'raster-fade-duration': 500 
              }}
            />
          </Source>
        )}

        {demoActive && alerts.map((a:any, i:number) => {
          const isCritical = a.severity_normalized?.toLowerCase() === 'critical';
          return (
            <Marker key={a.id} longitude={stableCoords[i].lng} latitude={stableCoords[i].lat} anchor="center">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full border-2 ${isCritical ? 'border-red-500' : 'border-[#00f1fe]'} animate-ping opacity-40`}></div>
                <div className={`w-4 h-4 border-2 border-white ${isCritical ? 'bg-red-500' : 'bg-[#00f1fe]'} rounded-full z-10 shadow-lg`}></div>
              </div>
            </Marker>
          );
        })}
        {/* After SOS: Show USER position marker */}
        {sosSent && demoActive && (
          <Marker longitude={USER_POV.lng} latitude={USER_POV.lat} anchor="center">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-50" />
              <div className="absolute inset-2 rounded-full border border-red-400/40 animate-pulse" />
              <div className="w-5 h-5 bg-red-600 border-[3px] border-white rounded-full z-10 shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
            </div>
          </Marker>
        )}

        {/* After SOS: Show ALL facilities with full detail markers */}
        {sosSent && demoActive && facilities.map((f:any) => {
          const isBest = bestOption && f.id === bestOption.id;
          const isSafe = f.route_safe && f.capacity_available > 0;
          return (
            <Marker key={`sos-${f.id}`} longitude={f.lng} latitude={f.lat} anchor="bottom">
              <div className="flex flex-col items-center group/fac cursor-pointer">
                <div className={`px-3 py-2.5 rounded-xl border shadow-2xl backdrop-blur-xl flex flex-col gap-1 mb-1 transition-all group-hover/fac:-translate-y-1 min-w-[140px] ${
                  isBest ? 'bg-emerald-600/90 border-emerald-400/50' : isSafe ? 'bg-black/70 border-white/15' : 'bg-red-950/70 border-red-500/30'
                }`}>
                  {isBest && <span className="text-[6px] font-black text-emerald-200 uppercase tracking-[0.3em] mb-0.5">★ RECOMMENDED</span>}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${isSafe ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className="text-[8px] font-black uppercase tracking-tight leading-none text-white/90">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[7px] font-bold uppercase text-white/50">
                      {f.type === 'hospital' ? '🏥' : '🏕️'} {f.type}
                    </span>
                    <span className="text-[7px] font-bold text-white/30">•</span>
                    <span className={`text-[7px] font-black ${f.capacity_available > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {f.capacity_available}/{f.capacity_total} BEDS
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[6px] font-black uppercase tracking-widest ${f.route_safe ? 'text-emerald-400' : 'text-red-400'}`}>
                      {f.route_safe ? '✓ ROUTE SAFE' : '✗ ROUTE BLOCKED'}
                    </span>
                    <span className={`text-[6px] font-black uppercase tracking-widest ${f.accessibility === 'EASY' ? 'text-emerald-300' : f.accessibility === 'LIMITED' ? 'text-amber-400' : 'text-red-400'}`}>
                      • {f.accessibility}
                    </span>
                  </div>
                </div>
                <div className={`w-3 h-3 rotate-45 border-r border-b backdrop-blur-md -mt-2 ${isBest ? 'bg-emerald-600/90 border-emerald-400/50' : 'bg-black/70 border-white/15'}`} />
              </div>
            </Marker>
          );
        })}

        {/* Before SOS: show simple facility labels */}
        {demoActive && !sosSent && facilities.map((f:any) => (
          <Marker key={f.id} longitude={f.lng} latitude={f.lat} anchor="bottom">
            <div className="flex flex-col items-center group/marker cursor-pointer">
               <div className={`px-3 py-1.5 rounded-lg border border-white/20 shadow-2xl bg-black/40 backdrop-blur-md flex items-center gap-2 mb-1 transition-all group-hover/marker:-translate-y-1`}>
                 <div className={`w-2 h-2 rounded-full ${f.accessibility === 'EASY' ? 'bg-emerald-400' : f.accessibility === 'LIMITED' ? 'bg-amber-400' : 'bg-red-400'}`} />
                 <span className="text-[8px] font-black uppercase tracking-tighter leading-none text-white">{f.name}</span>
               </div>
               <div className="w-3 h-3 rotate-45 border-r border-b border-white/20 bg-black/40 backdrop-blur-md -mt-2" />
            </div>
          </Marker>
        ))}

        {/* 🌊 Disaster Impact Zone — Growing red radius */}
        {impactZoneGeoJSON && demoActive && (
          <Source id="impact-zone" type="geojson" data={impactZoneGeoJSON}>
            <Layer
              id="impact-zone-fill"
              type="fill"
              paint={{
                'fill-color': '#ef4444',
                'fill-opacity': 0.12
              }}
            />
            <Layer
              id="impact-zone-border"
              type="line"
              paint={{
                'line-color': '#ef4444',
                'line-width': 2,
                'line-opacity': 0.5,
                'line-dasharray': [4, 3]
              }}
            />
          </Source>
        )}

        {/* Escape Route Line on map */}
        {escapeRouteGeoJSON && (
          <Source id="escape-route" type="geojson" data={escapeRouteGeoJSON}>
            <Layer
              id="escape-route-line"
              type="line"
              paint={{
                'line-color': '#10b981',
                'line-width': 4,
                'line-dasharray': [2, 2],
                'line-opacity': 0.9
              }}
            />
          </Source>
        )}

        {/* 🚁 Rescue Unit Moving Toward Citizen */}
        {sosSent && demoActive && bestOption && rescueProgress < 100 && (
          <Marker
            longitude={bestOption.lng + (USER_POV.lng - bestOption.lng) * (rescueProgress / 100)}
            latitude={bestOption.lat + (USER_POV.lat - bestOption.lat) * (rescueProgress / 100)}
            anchor="center"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 rounded-full bg-cyan-500/20 animate-ping" />
              <div className="w-8 h-8 bg-black/80 backdrop-blur-md border border-cyan-400/50 rounded-full flex items-center justify-center text-[14px] shadow-[0_0_15px_rgba(6,182,212,0.4)]">🚁</div>
            </div>
          </Marker>
        )}
      </Map>

      {!demoActive && <WindParticles active={showWindParticles} />}

      <AnimatePresence>
        {!hideUI && (
          <>
            {/* Tactical Hub — ONLY when simulation is NOT active */}
            {!demoActive && (
            <motion.div 
              initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }}
              className="absolute top-4 left-4 z-[1000] w-56 flex flex-col gap-3 pointer-events-none"
            >
              <div className="bg-black/50 backdrop-blur-[30px] border border-white/10 rounded-[1.5rem] shadow-2xl p-4 flex flex-col pointer-events-auto">
                <div className="px-1 py-2 border-b border-white/5 mb-3 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Target size={14} className="text-[#ff7e5f]" />
                      <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Tactical</span>
                   </div>
                   <button onClick={() => setHideUI(true)} className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/40 hover:text-[#ff7e5f] transition-all flex items-center justify-center">
                      <Eye size={14} />
                   </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  {WEATHER_LAYERS.map(l => (
                    <button 
                      key={l.id} 
                      onClick={() => setActiveWeatherLayer(activeWeatherLayer === l.id ? 'none' : l.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
                        activeWeatherLayer === l.id 
                          ? 'bg-gradient-to-br from-[#ff7e5f] to-[#feb47b] text-white shadow-lg' 
                          : 'text-white/40 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <l.icon size={16} className={activeWeatherLayer === l.id ? 'text-white' : 'text-white/20 group-hover:text-[#ff7e5f] transition-colors'} />
                      <span className="text-[8px] font-black tracking-widest uppercase">{l.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                   <span className="text-[7px] font-black uppercase text-white/40 tracking-widest">Flow Viz</span>
                   <button 
                      onClick={() => setShowWindParticles(!showWindParticles)}
                      className={`w-8 h-4 rounded-full transition-all relative ${showWindParticles ? 'bg-[#ff7e5f]' : 'bg-white/10'}`}
                   >
                      <motion.div 
                        animate={{ x: showWindParticles ? 16 : 4 }}
                        className="absolute top-0.5 w-3 h-3 bg-white rounded-full"
                      />
                   </button>
                </div>
              </div>

              <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-1 rounded-xl flex gap-1 pointer-events-auto">
                 <button onClick={() => setMapStyle('voyager')} className={`flex-1 py-2 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${mapStyle === 'voyager' ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>Voyager</button>
                 <button onClick={() => setMapStyle('dark')} className={`flex-1 py-2 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${mapStyle === 'dark' ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>Obsidian</button>
              </div>
            </motion.div>
            )}

            {/* Weather Card — ONLY when NOT in simulation */}
            {!demoActive && mapCenterWeather && (
              <motion.div 
                initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
                className="absolute bottom-6 right-6 z-[1000] w-64 bg-black/50 backdrop-blur-[30px] border border-white/10 p-6 rounded-[2rem] shadow-2xl text-white group"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex flex-col">
                        <span className="text-[7px] font-black text-[#ff7e5f] uppercase tracking-[0.2em] mb-0.5">Strategic Feed</span>
                        <h4 className="text-base font-black text-white leading-tight uppercase tracking-tight">{mapCenterWeather.name || 'Nexus scanning...'}</h4>
                     </div>
                     <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                        <CloudRain size={20} className="text-[#ff7e5f]" />
                     </div>
                  </div>

                  <div className="flex items-baseline gap-3 mb-4">
                     <span className="text-4xl font-black text-white tracking-tighter leading-none">{Math.round(mapCenterWeather.temp)}°C</span>
                     <span className="text-[9px] font-black text-[#ff7e5f] uppercase tracking-widest">{mapCenterWeather.condition}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                     <div className="flex flex-col">
                        <span className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-0.5">Humidity</span>
                        <span className="text-xs font-black text-white">{mapCenterWeather.humidity}%</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-0.5">Velocity</span>
                        <span className="text-xs font-black text-white">{mapCenterWeather.wind.split(' ')[0]} M/S</span>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Simulation Control Panel */}
            <div className="absolute top-4 right-4 z-[1500] flex flex-col gap-2 items-end">
              {!demoActive ? (
                <button onClick={runDemo} className="bg-white text-black px-6 py-3 rounded-xl text-[8px] font-black tracking-[0.2em] shadow-2xl transition-all active:scale-[0.95] flex items-center gap-2 uppercase group hover:bg-[#ff7e5f] hover:text-white">
                   <Activity size={14} /> Start Scenario
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-black/60 backdrop-blur-[30px] border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-2xl min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                    <Activity size={12} className="text-[#ff7e5f] animate-pulse" />
                    <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Simulation: {phase}</span>
                  </div>
                  <button onClick={cinematicAdvance} className="w-full bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] text-white py-2.5 rounded-lg text-[8px] font-black tracking-[0.2em] uppercase transition-all active:scale-[0.95]">
                    {phase === 'PRE' ? 'Trigger Disaster (MID)' : 'End Simulation'}
                  </button>
                  <button onClick={stopDemo} className="w-full bg-white/10 hover:bg-red-500/30 text-white/60 hover:text-white py-2 rounded-lg text-[7px] font-black tracking-widest uppercase transition-all">
                    Stop
                  </button>
                </motion.div>
              )}
            </div>

            {/* In-Map SOS Button — Only during MID (Emergency) phase */}
            <AnimatePresence>
              {demoActive && phase === 'MID' && !sosSent && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1500]"
                >
                  <button 
                    onClick={handleSOSFromMap}
                    className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase shadow-[0_0_40px_rgba(239,68,68,0.4)] transition-all active:scale-[0.95] flex items-center gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-ping opacity-30" />
                    <AlertTriangle size={20} className="group-hover:scale-125 transition-transform relative z-10" />
                    <span className="relative z-10">SEND SOS DISTRESS</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SOS Sent — Small confirmation badge (data is on map) */}
            <AnimatePresence>
              {sosSent && demoActive && (
                <motion.div 
                  initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
                  className="absolute bottom-6 left-6 z-[1500] bg-black/70 backdrop-blur-[30px] border border-emerald-500/30 px-4 py-3 rounded-xl shadow-2xl text-white flex items-center gap-3"
                >
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">SOS SENT TO COMMAND</p>
                    <p className="text-[7px] font-bold text-white/40 uppercase mt-0.5">Escape route & facilities on map</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 💓 Citizen Vitals HUD */}
            <AnimatePresence>
              {demoActive && phase === 'MID' && (
                <motion.div 
                  initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
                  className="absolute top-4 left-4 z-[1500] bg-black/70 backdrop-blur-[30px] border border-white/10 rounded-2xl p-4 shadow-2xl w-52"
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${vitals.hr > 120 ? 'bg-red-500' : 'bg-emerald-400'}`} />
                    <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em]">Citizen Vitals</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">♥ Heart</span>
                      <span className={`text-sm font-black tabular-nums ${vitals.hr > 130 ? 'text-red-400' : vitals.hr > 100 ? 'text-amber-400' : 'text-emerald-400'}`}>{vitals.hr} <span className="text-[7px] text-white/30">BPM</span></span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div animate={{ width: `${Math.min(vitals.hr / 1.6, 100)}%` }} className={`h-full rounded-full ${vitals.hr > 130 ? 'bg-red-500' : vitals.hr > 100 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">⚡ Stress</span>
                      <span className={`text-sm font-black tabular-nums ${vitals.stress > 70 ? 'text-red-400' : vitals.stress > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{vitals.stress}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">O₂ Level</span>
                      <span className={`text-sm font-black tabular-nums ${vitals.o2 < 92 ? 'text-red-400' : 'text-emerald-400'}`}>{vitals.o2}%</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 🚁 Rescue ETA Badge */}
            <AnimatePresence>
              {sosSent && demoActive && rescueProgress < 100 && (
                <motion.div
                  initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
                  className="absolute bottom-6 right-6 z-[1500] bg-black/70 backdrop-blur-[30px] border border-cyan-500/30 px-4 py-3 rounded-xl shadow-2xl text-white flex items-center gap-3"
                >
                  <span className="text-lg">🚁</span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-cyan-400">RESCUE EN ROUTE</p>
                    <p className="text-sm font-black tabular-nums text-white">ETA: {Math.ceil((100 - rescueProgress) * 0.6)}s</p>
                  </div>
                  <div className="w-12 h-12 relative">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray={`${rescueProgress} ${100 - rescueProgress}`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-cyan-400">{rescueProgress}%</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rescue Arrived */}
            <AnimatePresence>
              {sosSent && demoActive && rescueProgress >= 100 && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                  className="absolute bottom-6 right-6 z-[1500] bg-emerald-600/90 backdrop-blur-[30px] border border-emerald-400/50 px-5 py-3 rounded-xl shadow-2xl text-white flex items-center gap-3"
                >
                  <CheckCircle2 size={20} className="text-white" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white">RESCUE ARRIVED</p>
                    <p className="text-[7px] font-bold text-emerald-200 uppercase">Citizen secured</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hideUI && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => setHideUI(false)}
            className="absolute top-12 left-12 z-[2000] w-16 h-16 bg-white/10 backdrop-blur-2xl text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:bg-[#00f1fe] hover:text-black transition-all border border-white/10"
          >
            <EyeOff size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ⚡ Phase Transition Cinematic Overlay */}
      <AnimatePresence>
        {showPhaseCinematic === 'MID' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          >
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: [0, 0.6, 0.3, 0.5, 0.2] }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute inset-0 bg-red-600"
            />
            <motion.div
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: 'spring', damping: 15 }}
              className="relative z-10 flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <AlertTriangle size={80} className="text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.8)]" />
              </motion.div>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-black text-white uppercase tracking-[0.5em] text-center"
              >
                DISASTER DETECTED
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-[10px] font-black text-red-200 uppercase tracking-[0.4em]"
              >
                Initiating Emergency Protocol
              </motion.p>
            </motion.div>
          </motion.div>
        )}
        {showPhaseCinematic === 'END' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          >
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute inset-0 bg-emerald-600 origin-left"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', damping: 15 }}
              className="relative z-10 flex flex-col items-center gap-4"
            >
              <CheckCircle2 size={80} className="text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.8)]" />
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-3xl font-black text-white uppercase tracking-[0.5em] text-center"
              >
                ALL CLEAR
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-[10px] font-black text-emerald-200 uppercase tracking-[0.4em]"
              >
                Simulation Complete — Systems Nominal
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CitizenDashboard() {
  const { phase: systemPhase } = usePhase();
  const [demoPhaseOverride, setDemoPhaseOverride] = useState<'PRE' | 'MID' | 'POST' | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [demoActive, setDemoActive] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const { alerts, syncStatus } = useAlerts();
  const navigate = useNavigate();

  // Map system phase to local display key
  const phase: 'PRE' | 'MID' | 'POST' = demoPhaseOverride || (
    systemPhase === 'MID_DISASTER' ? 'MID' :
    systemPhase === 'POST_DISASTER' ? 'POST' : 'PRE'
  );

  // Intelligence: Find Best Safe Option
  const bestOption = useMemo(() => {
    return [...facilities]
      .map(f => ({
        ...f,
        score: (f.capacity_available * 2) + (f.route_safe ? 500 : -1000) + (f.accessibility === 'EASY' ? 200 : 0)
      }))
      .sort((a, b) => b.score - a.score)[0];
  }, [facilities]);

  // Update facilities based on simulation phase
  useEffect(() => {
    if (phase === 'PRE') setFacilities(INITIAL_FACILITIES);
    if (phase === 'MID') {
      setFacilities(prev => prev.map(f => {
        if (f.id === 'f2') return { ...f, capacity_available: 5, accessibility: 'LIMITED' };
        if (f.id === 'f1') return { ...f, capacity_available: 80, accessibility: 'EASY' };
        if (f.id === 'f3') return { ...f, accessibility: 'BLOCKED', route_safe: false };
        return f;
      }));
    }
    if (phase === 'POST') {
      setFacilities(prev => prev.map(f => {
        if (f.id === 'f1') return { ...f, capacity_available: 0, accessibility: 'LIMITED' };
        if (f.id === 'f2') return { ...f, capacity_available: 150, accessibility: 'EASY' };
        return f;
      }));
    }
  }, [phase]);

  const [userCoords, setUserCoords] = useState<any>(null);

  // 🛰️ Master GPS Geolocation Handshake (High-Accuracy & Optimized)
  useEffect(() => {
    if ("geolocation" in navigator) {
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      }, (err) => {
        console.warn("Geolocation failed or timed out. Defaulting to Chennai.");
        setUserCoords({ lat: 13.0827, lon: 80.2707 });
      }, geoOptions);
    } else {
      setUserCoords({ lat: 13.0827, lon: 80.2707 });
    }
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try { 
        const res = await api.get(`/alerts/weather?lat=${userCoords.lat}&lon=${userCoords.lon}`); 
        setWeather(res.data); 
      } catch (e) { console.error(e); }
    };
    fetchWeather();
    const t = setInterval(fetchWeather, 600000);
    return () => clearInterval(t);
  }, [userCoords]); // Re-fetch weather when userCoords changes

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const runDemo = () => {
    if (demoActive) return;
    setDemoActive(true); setDemoPhaseOverride('PRE');
  };

  const advancePhase = () => {
    if (phase === 'PRE') setDemoPhaseOverride('MID');
    else if (phase === 'MID') { setDemoPhaseOverride(null); setDemoActive(false); }
  };

  const stopDemo = () => {
    setDemoPhaseOverride(null); setDemoActive(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f5f7f9] text-[#2c2f31] overflow-hidden font-['Inter'] relative">
      
      <header className="h-16 lg:h-20 bg-white/90 backdrop-blur-2xl border-b border-[#e5e9eb] flex items-center justify-between px-6 lg:px-10 z-[200] shrink-0 relative">
        <div className="flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-4 lg:gap-5 group cursor-pointer" onClick={() => navigate('/citizen')}>
            <div className="w-10 h-10 lg:w-14 lg:h-14 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img src="/ndma_logo.png" alt="NDMA Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-bold font-['Space_Grotesk'] text-[#2c2f31] uppercase tracking-tight leading-none">NDMA | <span className="text-[#00666c]">IDRS</span></h1>
              <p className="text-[7px] lg:text-[9px] font-bold text-[#00666c] uppercase tracking-[0.3em] mt-1.5 opacity-70">National Intelligence Nexus</p>
            </div>
          </div>
          
          <div className="hidden sm:block h-10 w-px bg-[#e5e9eb]" />

          <div className="hidden md:flex items-center gap-3 bg-[#f8fafc] px-4 py-2 rounded-xl border border-[#e5e9eb]">
            <span className={`w-2 h-2 rounded-full animate-pulse ${phase === 'MID' ? 'bg-red-500' : phase === 'POST' ? 'bg-emerald-500' : 'bg-[#00666c]'}`} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2c2f31]">{PHASE_META[phase].text}</span>
            <span className="text-[9px] font-semibold text-[#abadaf] uppercase tracking-wider">• {PHASE_META[phase].sub}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 lg:gap-8">
          {weather && (
            <div className="hidden lg:flex items-center gap-6 pr-6 border-r border-[#e5e9eb]">
              <div className="flex items-center gap-3">
                <CloudRain size={18} className="text-[#00666c]" />
                <div>
                  <p className="text-sm font-bold text-[#2c2f31] leading-none uppercase">{Math.round(weather.temp)}°C</p>
                  <p className="text-[8px] font-bold text-[#00666c] uppercase tracking-widest mt-1">{weather.condition}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[9px] font-bold text-[#2c2f31] leading-none uppercase">{weather.humidity}%</p>
                  <p className="text-[7px] font-bold text-[#abadaf] uppercase tracking-tighter mt-1">Humidity</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-[#2c2f31] leading-none uppercase">{weather.wind}</p>
                  <p className="text-[7px] font-bold text-[#abadaf] uppercase tracking-tighter mt-1">Wind</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-right hidden sm:block">
            <p className="text-lg font-bold font-['Space_Grotesk'] text-[#2c2f31] tabular-nums tracking-tight leading-none">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            <div className="flex items-center justify-end gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${syncStatus === 'live' ? 'bg-[#006947] animate-pulse glow-emerald' : 'bg-amber-500'}`} />
                <span className="text-[8px] font-bold text-[#abadaf] uppercase tracking-widest">{syncStatus} FEED ACTIVE</span>
            </div>
          </div>
          <button onClick={() => navigate('/citizen/recovery')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-bold tracking-[0.3em] shadow-lg shadow-emerald-100 transition-all active:scale-[0.98] flex items-center gap-3 uppercase group">
            <CheckCircle2 size={18} className="group-hover:scale-125 transition-transform" /> RECOVERY HUB
          </button>
        </div>
      </header>

      {/* Ticker */}
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
        <section className="flex-1 relative overflow-hidden bg-white">
            <div className="absolute inset-0 grid-overlay opacity-[0.1] pointer-events-none z-[10]" />
            <AnimatePresence mode="wait">
              <motion.div 
                key="persistent-map" 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="h-full w-full"
              >
                <PreMapView 
                  alerts={alerts} 
                  facilities={facilities} 
                  bestOption={bestOption} 
                  runDemo={runDemo} 
                  demoActive={demoActive} 
                  phase={phase}
                  advancePhase={advancePhase}
                  stopDemo={stopDemo}
                  userCoords={userCoords}
                />
              </motion.div>
            </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
