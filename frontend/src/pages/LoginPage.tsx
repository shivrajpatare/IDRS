import { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Shield, ArrowRight, Activity, Map, Lock, Globe, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlobeBackground from '../components/GlobeBackground';
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
    transition: { type: 'spring' as any, damping: 25, stiffness: 120 }
  }
};

const PerspectiveCard = ({ children, className, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: any) => {
    if (!isHovered) setIsHovered(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ 
        rotateY: isHovered ? rotateY : 0, 
        rotateX: isHovered ? rotateX : 0, 
        transformStyle: "preserve-3d",
        transition: "rotate 0.6s cubic-bezier(0.23, 1, 0.32, 1)" 
      }}
      className={`${className} relative`}
    >
      <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (role: string) => {
    setLoading(true);
    try {
      // In this scaffold, we use the seeded users
      // Admin: admin@tn.gov.in / password123
      // Citizen: citizen_chennai@example.com / password123
      const email = role === 'ADMIN' ? 'admin@tn.gov.in' : 'citizen_chennai@example.com';
      const password = 'password123';

      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/token', formData);
      const { access_token } = response.data;
      
      await login(access_token);
      navigate(role === 'ADMIN' ? '/command' : '/citizen', { replace: true });
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.detail || "Authentication Failed. Ensure backend is running on port 8000.");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#f5f7f9] flex items-center justify-center p-6 overflow-hidden relative font-['Inter']">
      
      {/* ── Background UI Layers ── */}
      <GlobeBackground />
      <div className="absolute inset-0 grid-overlay opacity-[0.3] pointer-events-none z-[1]" />

      <div className="w-full max-w-[1200px] grid lg:grid-cols-2 gap-8 items-center relative z-10">
        
        {/* ── Left Side: Brand & Technical Stats ── */}
        <motion.div 
          variants={staggerContainer} initial="hidden" animate="visible"
          className="hidden lg:flex flex-col items-start"
        >
          <motion.div variants={itemVariant} className="flex items-center gap-5 mb-8 xl:mb-12">
            <div className="w-12 h-12 xl:w-16 xl:h-16 flex items-center justify-center group cursor-pointer hover:scale-110 transition-transform">
              <img src="/idrs_logo.png" alt="IDRS Logo" className="w-full h-full object-contain drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-xl xl:text-3xl font-bold font-['Space_Grotesk'] text-[#2c2f31] uppercase tracking-tight leading-none">IDRS | <span className="text-[#00666c]">CORE</span></h2>
              <p className="text-[10px] xl:text-[12px] font-bold text-[#00666c] uppercase tracking-[0.4em] mt-2 opacity-60">Disaster Response Framework</p>
            </div>
          </motion.div>

          <motion.h1 variants={itemVariant} className="text-4xl xl:text-7xl font-bold font-['Space_Grotesk'] text-[#2c2f31] tracking-tighter leading-[0.9] mb-6 xl:mb-10 uppercase">
            SECURE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00666c] to-[#00f1fe]">NEXUS TERMINAL</span>
          </motion.h1>
          
          <motion.p variants={itemVariant} className="text-[#595c5e] text-base xl:text-lg font-medium leading-relaxed max-w-md mb-8 xl:mb-10">
            In the high-stakes environment of disaster response, clarity is a functional requirement. The Luminous engine provides atmospheric intelligence.
          </motion.p>

          <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-8 xl:gap-12">
             <motion.div variants={itemVariant} className="space-y-2">
                <div className="flex items-center gap-2 text-[#006947]">
                    <Target size={14} className="animate-spin-slow" />
                    <p className="text-2xl xl:text-4xl font-black font-['Space_Grotesk'] text-[#2c2f31] tracking-tighter">99.9<span className="text-[#00f1fe] text-sm xl:text-lg font-normal">%</span></p>
                </div>
                <p className="text-[8px] xl:text-[9px] font-black text-[#595c5e] uppercase tracking-[0.3em]">Integrity</p>
             </motion.div>
             <motion.div variants={itemVariant} className="space-y-2">
                <div className="flex items-center gap-2 text-[#00666c]">
                    <Zap size={14} />
                    <p className="text-2xl xl:text-4xl font-black font-['Space_Grotesk'] text-[#2c2f31] tracking-tighter">14<span className="text-[#00f1fe] text-sm xl:text-lg font-normal">ms</span></p>
                </div>
                <p className="text-[8px] xl:text-[9px] font-black text-[#595c5e] uppercase tracking-[0.3em]">Latency</p>
             </motion.div>
             <motion.div variants={itemVariant} className="space-y-2">
                <div className="flex items-center gap-2 text-red-500">
                    <Globe size={14} className="animate-pulse" />
                    <p className="text-2xl xl:text-4xl font-black font-['Space_Grotesk'] text-[#2c2f31] tracking-tighter">Live</p>
                </div>
                <p className="text-[8px] xl:text-[9px] font-black text-[#595c5e] uppercase tracking-[0.3em]">Network</p>
             </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Right Side: Login Terminal ── */}
        <motion.div initial={{opacity:0, y: 40}} animate={{opacity:1, y: 0}} transition={{duration: 0.8, ease: "easeOut"}} className="flex justify-center lg:justify-end w-full">
          <PerspectiveCard className="w-full max-w-[400px]">
            <div className="glass p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] shadow-[0_20px_60px_rgba(0,102,108,0.06)] relative overflow-hidden group border border-white">
              
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#00f1fe]/5 blur-[80px] rounded-full" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6 lg:mb-8">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold font-['Space_Grotesk'] text-[#2c2f31] tracking-tight uppercase leading-none">TERMINAL</h3>
                    <p className="text-[8px] lg:text-[9px] font-bold text-[#595c5e] uppercase tracking-[0.4em] mt-1.5 lg:mt-2 opacity-50">Luminous Protocol: SECURE</p>
                  </div>
                  <div className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center group-hover:scale-110 transition-transform mix-blend-multiply">
                    <img src="/emblem.png" alt="Emblem" className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-5 mb-6 lg:mb-8">
                  <div className="relative group/input">
                    <label className="text-[8px] font-black text-[#595c5e] uppercase tracking-[0.4em] mb-2 block ml-4">Operator ID</label>
                    <input 
                      type="email" 
                      placeholder="SENTINEL_01"
                      className="w-full bg-[#f8fafc] border-2 border-[#e5e9eb] rounded-[16px] lg:rounded-[20px] px-6 py-3 lg:py-4 text-[#2c2f31] placeholder:text-[#abadaf] font-bold tracking-widest text-xs focus:outline-none focus:border-[#00666c] focus:bg-white transition-all shadow-inner" 
                    />
                  </div>
                  <div className="relative group/input">
                    <label className="text-[8px] font-black text-[#595c5e] uppercase tracking-[0.4em] mb-2 block ml-4">Passcode</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-[#f8fafc] border-2 border-[#e5e9eb] rounded-[16px] lg:rounded-[20px] px-6 py-3 lg:py-4 text-[#2c2f31] placeholder:text-[#abadaf] font-bold tracking-widest text-xs focus:outline-none focus:border-[#00666c] focus:bg-white transition-all shadow-inner" 
                    />
                  </div>
                </div>

                 <button 
                  onClick={() => handleLogin('CITIZEN')}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#00666c] to-[#00f1fe] text-white py-4 lg:py-5 rounded-2xl font-bold text-[9px] lg:text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-cyan-100 mb-6 lg:mb-8 group"
                >
                  {loading ? 'SYNCING...' : 'ESTABLISH SESSION'} <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </button>

                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => handleLogin('CITIZEN')}
                     className="flex flex-col items-center gap-2 p-4 lg:p-5 bg-white hover:bg-[#f8fafc] border border-[#e5e9eb] rounded-2xl transition-all group active:scale-[0.98] shadow-sm"
                   >
                     <Activity size={20} className="text-[#00666c] group-hover:scale-110 transition-transform" />
                     <span className="text-[8px] lg:text-[9px] font-bold text-[#595c5e] uppercase tracking-[0.2em]">Citizen Portal</span>
                   </button>
                   <button 
                     onClick={() => handleLogin('ADMIN')}
                     className="flex flex-col items-center gap-2 p-4 lg:p-5 bg-white hover:bg-[#f8fafc] border border-[#e5e9eb] rounded-2xl transition-all group active:scale-[0.98] shadow-sm"
                   >
                     <Globe size={20} className="text-[#006947] group-hover:scale-110 transition-transform" />
                     <span className="text-[8px] lg:text-[9px] font-bold text-[#595c5e] uppercase tracking-[0.2em]">Command Center</span>
                   </button>
                </div>
              </div>
            </div>
          </PerspectiveCard>
        </motion.div>

      </div>

      {/* ── Footer Readout ── */}
      <div className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-center gap-4 sm:gap-12 opacity-30">
         <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-[#00666c] rounded-full animate-pulse glow-cyan" />
            <span className="text-[8px] lg:text-[9px] font-black text-[#595c5e] uppercase tracking-[0.4em]">Network Active</span>
         </div>
         <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-[#006947] rounded-full glow-emerald" />
            <span className="text-[8px] lg:text-[9px] font-black text-[#595c5e] uppercase tracking-[0.4em]">Sector_7_Ready</span>
         </div>
      </div>

    </div>
  );
}
