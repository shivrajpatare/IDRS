import { motion } from 'framer-motion';
import { Target, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative flex flex-col items-center justify-center pt-24 pb-12 bg-[#f5f7f9]">
      
      {/* Vercel-style Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e5e9eb 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 container mx-auto px-6 max-w-5xl flex flex-col items-center text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center bg-white border border-[#e5e9eb] p-1.5 rounded-lg mb-8 shadow-sm hover:border-[#2c2f31] transition-colors group select-none overflow-hidden"
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" 
            alt="India Flag" 
            className="w-10 h-auto rounded-sm shadow-sm"
          />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold font-['Space_Grotesk'] text-[#2c2f31] tracking-[-0.04em] leading-[1.1] mb-6"
        >
          Adaptive Disaster Lifecycle <br/>
          Management Platform.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[17px] text-[#595c5e] max-w-2xl font-normal leading-relaxed mb-10"
        >
          A continuous, bidirectional loop between public users and emergency responders. <br/>
          <span className="font-bold text-[#2c2f31]">IDRS - Save Lives. Faster.</span>
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button 
            onClick={() => navigate('/command')}
            className="w-full sm:w-auto bg-[#2c2f31] hover:bg-[#00666c] text-white px-6 py-3 rounded-md text-[14px] font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Activity size={16} />
            Command Control Room
          </button>
          
          <button 
            onClick={() => navigate('/citizen')}
            className="w-full sm:w-auto bg-white border border-[#e5e9eb] hover:border-[#2c2f31] text-[#2c2f31] px-6 py-3 rounded-md text-[14px] font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Target size={16} className="text-[#595c5e]" />
            Citizen Dashboard
          </button>
        </motion.div>

      </div>
    </section>
  );
}
