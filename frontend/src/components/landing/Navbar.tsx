import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="fixed top-6 left-0 right-0 z-[9999] flex justify-center px-6">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="h-14 pl-2 pr-2 flex items-center justify-between gap-8 border border-[#e5e9eb] bg-white/70 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        {/* Logo & Name Section */}
        <div
          className="flex items-center gap-3 cursor-pointer pl-4 py-1 pr-2 rounded-full hover:bg-[#f5f7f9] transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-8 h-8 flex items-center justify-center bg-white border border-[#e5e9eb] rounded-full shadow-sm overflow-hidden">
            <img
              src="/ndma_logo.png"
              alt="NDMA Logo"
              className="w-full h-full object-contain p-1"
            />
          </div>
          <h1 className="text-sm font-bold font-['Space_Grotesk'] text-[#2c2f31] tracking-tight">
            IDRS
          </h1>
        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {['System', 'Intelligence', 'Operations', 'Architecture'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-4 py-1.5 rounded-full text-[13px] font-medium text-[#595c5e] hover:text-[#2c2f31] hover:bg-[#f5f7f9] transition-all"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA Section */}
        <div className="flex items-center gap-2 pr-1">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 rounded-full text-[13px] font-medium text-[#595c5e] hover:text-[#2c2f31] transition-colors hidden sm:block"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/command')}
            className="bg-[#2c2f31] text-white pl-5 pr-4 py-2 rounded-full text-[13px] font-medium transition-all hover:bg-[#00666c] flex items-center gap-2 shadow-sm"
          >
            Console <ChevronRight size={14} />
          </button>
        </div>
      </motion.nav>
    </div>
  );
}
