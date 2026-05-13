import { motion, useScroll, useSpring } from 'framer-motion';
import SmoothScroll from '../components/landing/SmoothScroll';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import ProblemSection from '../components/landing/ProblemSection';
import OrchestrationSection from '../components/landing/OrchestrationSection';
import PhaseAwareSection from '../components/landing/PhaseAwareSection';
import MapIntelligenceSection from '../components/landing/MapIntelligenceSection';
import TechStackSection from '../components/landing/TechStackSection';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <SmoothScroll>
      <div className="bg-[#f5f7f9] min-h-screen text-[#2c2f31] font-['Inter'] selection:bg-[#00f1fe] selection:text-[#00666c]">
        
        {/* Top Progress Bar - Crisp Vercel style */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] bg-[#2c2f31] origin-left z-[10000]"
          style={{ scaleX }}
        />

        <Navbar />
        
        <main className="relative z-10 flex flex-col pt-32 pb-32 gap-32">
          <HeroSection />
          <ProblemSection />
          <OrchestrationSection />
          <PhaseAwareSection />
          <MapIntelligenceSection />
          <TechStackSection />
        </main>
        
        <footer className="py-12 border-t border-[#e5e9eb] bg-white text-center flex flex-col items-center justify-center gap-4 relative z-10">
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#006947] rounded-full" />
                <span className="text-[11px] font-semibold text-[#595c5e] uppercase tracking-widest">All Systems Operational</span>
            </div>
            <p className="text-[11px] text-[#595c5e]">
                © 2026 IDRS Nexus. Integrated Disaster Response System.
            </p>
        </footer>
      </div>
    </SmoothScroll>
  );
}
