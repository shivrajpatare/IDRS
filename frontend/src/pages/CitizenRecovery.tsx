import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Heart, Users, MapPin, ArrowRight, Shield, 
  ClipboardCheck, Radio, Globe, Target, Activity, ChevronRight,
  Phone, Building, Droplets, Truck, X, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RECOVERY_SERVICES = [
  { 
    id: 'health', title: 'Health & Wellness', 
    desc: 'Access emergency medical records, mental health support, and trauma counseling.',
    icon: Heart, accent: '#10b981', stats: { available: 12, total: 15, label: 'Centers Active' }
  },
  { 
    id: 'family', title: 'Family Reunion', 
    desc: 'Search missing family members, log safety status, and reunification tracking.',
    icon: Users, accent: '#3b82f6', stats: { available: 847, total: 1200, label: 'Reunited' }
  },
  { 
    id: 'resources', title: 'Resource Allocation', 
    desc: 'Request food, water, essential supplies, and temporary housing in your sector.',
    icon: Truck, accent: '#f59e0b', stats: { available: 2400, total: 5000, label: 'Kits Dispatched' }
  },
  { 
    id: 'insurance', title: 'Insurance Claims', 
    desc: 'File emergency claims for property damage through the accelerated IDRS protocol.',
    icon: ClipboardCheck, accent: '#8b5cf6', stats: { available: 340, total: 800, label: 'Claims Filed' }
  },
  { 
    id: 'infrastructure', title: 'Infrastructure', 
    desc: 'Report damaged roads, utilities, and public services. Track repair progress.',
    icon: Building, accent: '#ec4899', stats: { available: 67, total: 120, label: '% Restored' }
  },
  { 
    id: 'water', title: 'Water & Sanitation', 
    desc: 'Locate clean water sources and sanitation facilities in your area.',
    icon: Droplets, accent: '#06b6d4', stats: { available: 18, total: 24, label: 'Points Active' }
  }
];

const MILESTONES = [
  { label: 'Immediate Safety Check', done: true, time: '2h ago' },
  { label: 'Log Recovery Request', done: true, time: '1h ago' },
  { label: 'Assign Sector Liaison', done: true, time: '45m ago' },
  { label: 'Establish Subsistence', done: false, time: 'Pending' },
  { label: 'Infrastructure Audit', done: false, time: 'Pending' },
  { label: 'Full Restoration', done: false, time: 'Pending' },
];

const SECTOR_STATS = [
  { label: 'Affected', value: '12,400', sub: 'Citizens' },
  { label: 'Evacuated', value: '9,870', sub: 'Safe' },
  { label: 'Sheltered', value: '3,240', sub: 'Active' },
  { label: 'Rescued', value: '1,891', sub: 'Confirmed' },
];

export default function CitizenRecovery() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const completedCount = MILESTONES.filter(m => m.done).length;
  const completionPct = Math.round((completedCount / MILESTONES.length) * 100);

  return (
    <div className="h-screen w-screen bg-white flex flex-col overflow-hidden font-['Inter']">
      
      {/* ── Same Header as Citizen Dashboard ── */}
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

          <div className="hidden md:flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">RECOVERY</span>
            <span className="text-[9px] font-semibold text-emerald-600/50 uppercase tracking-wider">• Restoration Protocol</span>
          </div>
        </div>

        <div className="flex items-center gap-6 lg:gap-8">
          <div className="hidden lg:flex items-center gap-3 pr-6 border-r border-[#e5e9eb]">
            <Activity size={16} className="text-emerald-600" />
            <div>
              <p className="text-[9px] font-bold text-[#2c2f31] leading-none uppercase">{completionPct}% Complete</p>
              <p className="text-[7px] font-bold text-emerald-600 uppercase tracking-widest mt-1">{completedCount}/{MILESTONES.length} Milestones</p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-lg font-bold font-['Space_Grotesk'] text-[#2c2f31] tabular-nums tracking-tight leading-none">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            <div className="flex items-center justify-end gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-[#006947] animate-pulse" />
                <span className="text-[8px] font-bold text-[#abadaf] uppercase tracking-widest">LIVE FEED ACTIVE</span>
            </div>
          </div>
          <button onClick={() => navigate('/citizen')} className="bg-[#2c2f31] hover:bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-bold tracking-[0.3em] shadow-lg transition-all active:scale-[0.98] flex items-center gap-3 uppercase group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
          </button>
        </div>
      </header>

      {/* ── Broadcast Ticker ── */}
      <div className="h-10 bg-emerald-700 flex items-center overflow-hidden relative z-[150] shrink-0 shadow-lg">
         <div className="shrink-0 px-6 bg-black/10 h-full flex items-center border-r border-white/10 z-10">
            <Radio size={14} className="text-white mr-3 animate-pulse" />
            <span className="text-[9px] font-bold tracking-[0.3em] text-white uppercase">Recovery</span>
         </div>
         <div className="flex-1 overflow-hidden">
            <motion.div initial={{ x: '100%' }} animate={{ x: '-100%' }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.4em] px-8 text-emerald-200">
               ⚡ RESTORATION ACTIVE — SECTOR 07: CHENNAI CENTRAL — {completedCount} OF {MILESTONES.length} MILESTONES COMPLETE — LIAISON: CMDR. RAJESH KUMAR — COMMS: ENCRYPTED X2 — GLOBAL RESTORATION: 14.2%
            </motion.div>
         </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* ── Left: Services Grid ── */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {SECTOR_STATS.map(s => (
              <div key={s.label} className="bg-[#f8fafc] border border-[#e5e9eb] rounded-2xl p-4">
                <p className="text-2xl lg:text-3xl font-black text-[#2c2f31] font-['Space_Grotesk'] leading-none">{s.value}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[8px] font-bold text-[#abadaf] uppercase tracking-widest">{s.label}</span>
                  <span className="text-[7px] font-bold text-emerald-600 uppercase">• {s.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Hero */}
          <div className="mb-8">
            <h2 className="text-3xl lg:text-5xl font-black font-['Space_Grotesk'] text-[#2c2f31] tracking-tight leading-none uppercase">
              Restoration <span className="text-emerald-600">Services</span>
            </h2>
            <p className="text-sm text-[#595c5e] mt-3 max-w-lg leading-relaxed">
              Select a recovery service below. All services are coordinated through NDMA's centralized restoration protocol.
            </p>
          </div>

          {/* Service Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
            {RECOVERY_SERVICES.map((service, i) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                className={`p-5 lg:p-6 rounded-2xl text-left group transition-all active:scale-[0.98] border relative overflow-hidden ${
                  selectedService === service.id 
                    ? 'bg-[#2c2f31] border-[#2c2f31] text-white shadow-xl' 
                    : 'bg-white border-[#e5e9eb] hover:border-[#c8ccce] hover:shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      selectedService === service.id ? 'bg-white/10' : 'bg-[#f8fafc] border border-[#e5e9eb]'
                    }`}
                    style={{ color: service.accent }}
                  >
                    <service.icon size={20} />
                  </div>
                  <ChevronRight size={16} className={`transition-all ${
                    selectedService === service.id ? 'text-white/40 rotate-90' : 'text-[#abadaf] group-hover:translate-x-1'
                  }`} />
                </div>
                <h3 className={`text-sm font-black uppercase tracking-tight mb-2 ${
                  selectedService === service.id ? 'text-white' : 'text-[#2c2f31]'
                }`}>{service.title}</h3>
                <p className={`text-[11px] leading-relaxed mb-4 ${
                  selectedService === service.id ? 'text-white/50' : 'text-[#abadaf]'
                }`}>{service.desc}</p>
                
                {/* Stats */}
                <div className={`pt-3 border-t ${selectedService === service.id ? 'border-white/10' : 'border-[#e5e9eb]'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${
                      selectedService === service.id ? 'text-white/30' : 'text-[#abadaf]'
                    }`}>{service.stats.label}</span>
                    <span className="text-xs font-black" style={{ color: service.accent }}>
                      {service.stats.available}<span className={`${selectedService === service.id ? 'text-white/20' : 'text-[#abadaf]'}`}>/{service.stats.total}</span>
                    </span>
                  </div>
                  <div className="h-1 bg-black/5 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${(service.stats.available / service.stats.total) * 100}%` }} 
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full" 
                      style={{ backgroundColor: service.accent }}
                    />
                  </div>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {selectedService === service.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
                    >
                      <button className="w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2" style={{ backgroundColor: service.accent }}>
                        Access Service <ArrowRight size={14} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Right: Progress Sidebar ── */}
        <aside className="hidden lg:flex w-[340px] border-l border-[#e5e9eb] bg-[#f8fafc] flex-col overflow-y-auto">
          
          {/* Restoration Track */}
          <div className="p-8 border-b border-[#e5e9eb]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-emerald-600 rounded-full" />
                <h3 className="text-[10px] font-black text-[#2c2f31] uppercase tracking-[0.3em]">Restoration Track</h3>
              </div>
              <Target size={16} className="text-emerald-600 animate-spin" style={{ animationDuration: '8s' }} />
            </div>

            <div className="space-y-1">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex items-center gap-4 py-2.5 group">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    m.done ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-white border border-[#e5e9eb] text-[#abadaf]'
                  }`}>
                    {m.done ? <CheckCircle2 size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-[#abadaf]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${m.done ? 'text-[#2c2f31]' : 'text-[#abadaf]'}`}>{m.label}</span>
                    <span className="text-[8px] font-bold text-[#abadaf] uppercase tracking-widest">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-6 pt-5 border-t border-[#e5e9eb]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-bold text-[#abadaf] uppercase tracking-widest">Protocol Progress</span>
                <span className="text-sm font-black text-emerald-600 font-['Space_Grotesk']">{completionPct}%</span>
              </div>
              <div className="h-2 bg-[#e5e9eb] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${completionPct}%` }} transition={{ duration: 1.5 }} className="h-full bg-emerald-600 rounded-full" />
              </div>
            </div>
          </div>

          {/* Sector Liaison */}
          <div className="p-8 border-b border-[#e5e9eb]">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
              <h3 className="text-[10px] font-black text-[#2c2f31] uppercase tracking-[0.3em]">Sector Liaison</h3>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-[#2c2f31] rounded-xl flex items-center justify-center text-white text-[11px] font-black shadow-lg">RK</div>
              <div>
                <p className="text-sm font-black text-[#2c2f31] font-['Space_Grotesk'] tracking-tight">Cmdr. Rajesh Kumar</p>
                <p className="text-[8px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-1">Sector 07 Ops Lead</p>
              </div>
            </div>
            <button className="w-full bg-white border border-[#e5e9eb] hover:bg-blue-600 hover:text-white hover:border-blue-600 py-3 rounded-xl text-[9px] font-bold text-[#2c2f31] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-sm">
              <Phone size={14} /> Establish Comms
            </button>
          </div>

          {/* Quick Links */}
          <div className="p-8 flex-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1.5 h-5 bg-[#2c2f31] rounded-full" />
              <h3 className="text-[10px] font-black text-[#2c2f31] uppercase tracking-[0.3em]">Quick Intel</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: MapPin, label: 'Sector: Chennai Central', color: 'text-[#595c5e]' },
                { icon: Radio, label: 'Comms: Encrypted X2', color: 'text-emerald-600' },
                { icon: Globe, label: 'Global Restoration: 14.2%', color: 'text-[#595c5e]' },
                { icon: Activity, label: 'System: All Nominal', color: 'text-emerald-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <item.icon size={14} className="text-[#abadaf]" />
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${item.color}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
